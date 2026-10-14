import JSZip from 'jszip';
import * as XLSX from 'xlsx/xlsx.mjs';

// limpa o nome do arquivo para utiliza-lo como nome da turma
// reproduz a mesma regra usada no script original em python:
// remove a extensao .xlsx, sufixos de copias (1), marcas do educarweb e prefixo relatorio
export function extrairNomeTurmaArquivo(nomeArquivo) {
    // remove extensao .xlsx no final
    let texto = nomeArquivo.replace(/\.xlsx$/i, '').trim();

    // remove sufixos de copias numeradas no final ex: (1), (2)
    texto = texto.replace(/\s*\(\d+\)\s*$/, '').trim();

    // remove o sufixo educarweb ou emitido pelo educarweb
    texto = texto.replace(/\s*(?:Emitido\s*Pelo\s*)?Educar\s*WEB\s*$/i, '').trim();

    // remove a palavra relatorio do inicio
    texto = texto.replace(/^Relat[oó]rio\s*/i, '').trim();

    return texto;
}

// formata qualquer tipo de data encontrada no excel para o padrao aaaa-mm-dd
function formatarDataPlanilha(valor) {
    if (!valor) return '';

    // caso 1: a celula ja foi interpretada como objeto Date
    if (valor instanceof Date && !isNaN(valor)) {
        return valor.toISOString().slice(0, 10);
    }

    // caso 2: numero serial de dias do excel desde 1900
    if (typeof valor === 'number') {
        const dataConvertida = new Date(Math.round((valor - 25569) * 86400 * 1000));
        if (!isNaN(dataConvertida)) {
            return dataConvertida.toISOString().slice(0, 10);
        }
    }

    const str = String(valor).trim();

    // caso 3: data digitada como texto dd/mm/aaaa
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [dia, mes, ano] = str.split('/');
        return `${ano}-${mes}-${dia}`;
    }

    // caso 4: extrai apenas os 10 primeiros caracteres ex: aaaa-mm-dd
    return str.slice(0, 10);
}

// le uma planilha .xlsx individual em memoria e extrai o nome da escola e turmas
export function extrairDadosPlanilha(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const primeiraAbaNome = workbook.SheetNames[0];
    const aba = workbook.Sheets[primeiraAbaNome];

    // converte a aba em matriz bidimensional preservando colunas
    const matriz = XLSX.utils.sheet_to_json(aba, { header: 1, defval: null });

    if (!matriz || matriz.length <= 1) {
        return { nomeEscola: '', turmas: [] };
    }

    // no pandas df["unnamed: 14"][0] corresponde a linha 1 do excel (indice 1 da matriz)
    // caso nao encontre na linha 1 faz fallback para a linha 0
    const linhaDados0 = matriz[1] || [];
    const linhaCabecalho = matriz[0] || [];
    const nomeEscola = String(linhaDados0[14] || linhaCabecalho[14] || '').trim();

    const conjuntoTurmas = [];
    let turmaAtual = [];
    let nomeTurmaAtual = '';
    let nomeTurmaLista = '';

    // inicia em i = 1 para pular a linha de cabecalho assim como o pandas faz
    for (let i = 1; i < matriz.length; i++) {
        const linha = matriz[i];
        const turmaInfo = linha[1];
        const nome = linha[5];
        const data = linha[12];

        if (turmaInfo !== null && turmaInfo !== undefined) {
            const turmaInfoStr = String(turmaInfo).trim();
            if (turmaInfoStr.includes('Série:')) {
                nomeTurmaAtual = turmaInfoStr.replace('Série:', '').trim();
            }
        }

        if (nome === null || nome === undefined) {
            continue;
        }

        const nomeStr = String(nome).trim();

        if (nomeStr === 'Nome') {
            if (turmaAtual.length > 0) {
                conjuntoTurmas.push({
                    nome: nomeTurmaLista,
                    alunos: turmaAtual,
                });
            }
            turmaAtual = [];
            nomeTurmaLista = nomeTurmaAtual;
        } else {
            const dataStr = formatarDataPlanilha(data);
            turmaAtual.push({
                nome: nomeStr,
                dataNascimento: dataStr,
            });
        }
    }

    if (turmaAtual.length > 0) {
        conjuntoTurmas.push({
            nome: nomeTurmaLista,
            alunos: turmaAtual,
        });
    }

    return { nomeEscola, turmas: conjuntoTurmas };
}

// processa o arquivo zip enviado pelo usuario aplicando as regras de hierarquia de pastas
export async function processarZipTurmas(arquivoZip) {
    console.group('[parser zip] inicio do processamento');
    console.log('arquivo recebido:', arquivoZip.name, `tamanho: ${(arquivoZip.size / 1024).toFixed(1)} KB`);

    // carrega e descompacta o arquivo zip em memoria
    const zip = await JSZip.loadAsync(arquivoZip);
    const bancoDados = { escolas: [] };

    // lista todas as entradas do zip para inspecao
    const todosCaminhos = [];
    const entradasXlsx = [];

    zip.forEach((caminhoRelativo, entry) => {
        todosCaminhos.push(caminhoRelativo);

        // normaliza barras invertidas do windows para barras convencionais
        const caminhoNormalizado = caminhoRelativo.replace(/\\/g, '/');
        const partes = caminhoNormalizado.split('/').filter((p) => p.trim() !== '');
        const nomeArquivo = partes[partes.length - 1] || '';

        // ignora pastas, arquivos temporarios e extensoes que nao sejam .xlsx
        if (!entry.dir && nomeArquivo.toLowerCase().endsWith('.xlsx') && !nomeArquivo.startsWith('~$')) {
            entradasXlsx.push({
                caminho: caminhoNormalizado,
                partes,
                nomeArquivo,
                entry,
                dataModificacao: entry.date ? entry.date.getTime() : Date.now(),
            });
        }
    });

    console.log('total de entradas brutas encontradas no zip:', todosCaminhos.length);
    console.log('planilhas .xlsx validas identificadas:', entradasXlsx.map((e) => e.caminho));

    if (entradasXlsx.length === 0) {
        console.warn('[parser zip] nenhum arquivo .xlsx valido encontrado.');
        console.log('entradas brutas presentes:', todosCaminhos);
        console.groupEnd();
        return bancoDados;
    }

    // organiza os arquivos por pasta de escola
    const arquivosPorEscola = {};

    entradasXlsx.forEach((item) => {
        let partes = [...item.partes];

        // se a primeira pasta for a raiz do zip como pet pse descarta o primeiro nivel
        if (
            partes.length > 2 &&
            (partes[0].toLowerCase().includes('pet') || partes[0].toLowerCase().includes('pse'))
        ) {
            partes = partes.slice(1);
        }

        // precisa de pelo menos a pasta da escola e o nome do arquivo
        if (partes.length < 2) {
            console.warn('[parser zip] arquivo ignorado por estar na raiz sem pasta de escola:', item.caminho);
            return;
        }

        const pastaEscola = partes[0];
        const temSubpasta = partes.length > 2;

        if (!arquivosPorEscola[pastaEscola]) {
            arquivosPorEscola[pastaEscola] = { temSubpastas: false, arquivos: [] };
        }

        if (temSubpasta) {
            arquivosPorEscola[pastaEscola].temSubpastas = true;
        }

        arquivosPorEscola[pastaEscola].arquivos.push({
            ...item,
            emSubpasta: temSubpasta,
        });
    });

    console.log('agrupamento de arquivos por escola:', arquivosPorEscola);

    // itera sobre as escolas agrupadas respeitando a regra de subpastas exclusivas
    for (const [pastaEscola, grupo] of Object.entries(arquivosPorEscola)) {
        console.log(`[parser zip] processando pasta de escola: "${pastaEscola}" (tem subpastas: ${grupo.temSubpastas})`);

        // regra: se a pasta da escola possui subpastas processa apenas os arquivos contidos nelas
        const arquivosParaProcessar = grupo.temSubpastas
            ? grupo.arquivos.filter((a) => a.emSubpasta)
            : grupo.arquivos;

        console.log(`[parser zip] arquivos a processar para "${pastaEscola}":`, arquivosParaProcessar.map((a) => a.nomeArquivo));

        for (const arquivoItem of arquivosParaProcessar) {
            try {
                // obtem os bytes brutos do arquivo da planilha
                const arrayBuffer = await arquivoItem.entry.async('arraybuffer');
                const { nomeEscola, turmas } = extrairDadosPlanilha(arrayBuffer, arquivoItem.nomeArquivo);

                // valida metadados basicos da escola e turmas
                if (
                    !nomeEscola ||
                    ['nan', 'none', ''].includes(nomeEscola.toLowerCase()) ||
                    turmas.length === 0
                ) {
                    console.warn(
                        `[parser zip] arquivo ignorado por nome de escola vazio ou sem turmas: "${arquivoItem.nomeArquivo}" (escola lida: "${nomeEscola}")`
                    );
                    continue;
                }

                // regra: em subpastas de nivel 2 planilhas com mais de uma turma nao sao permitidas
                if (arquivoItem.emSubpasta && turmas.length > 1) {
                    throw new Error(
                        `arquivo '${arquivoItem.nomeArquivo}' em subpasta contem mais de 1 turma. em subpastas cada arquivo deve conter 1 turma.`
                    );
                }

                // se a planilha contiver apenas 1 turma utiliza o nome limpo do arquivo
                if (turmas.length === 1) {
                    const novoNome = extrairNomeTurmaArquivo(arquivoItem.nomeArquivo);
                    if (novoNome) {
                        turmas[0].nome = novoNome;
                    }
                }

                // adiciona ou agrupa na lista final de escolas
                const escolaExistente = bancoDados.escolas.find((e) => e.nome === nomeEscola);
                if (escolaExistente) {
                    escolaExistente.turmas.push(...turmas);
                    escolaExistente.datasModificacao.push(arquivoItem.dataModificacao);
                } else {
                    bancoDados.escolas.push({
                        nome: nomeEscola,
                        turmas: turmas,
                        datasModificacao: [arquivoItem.dataModificacao],
                    });
                }
            } catch (err) {
                console.error(`[parser zip] erro ao processar '${arquivoItem.nomeArquivo}':`, err);
            }
        }
    }

    console.log('[parser zip] resultado final de escolas processadas:', bancoDados);
    console.groupEnd();
    return bancoDados;
}