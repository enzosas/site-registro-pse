import JSZip from 'jszip';
import * as XLSX from 'xlsx/xlsx.mjs';

// limpa o nome do arquivo para utiliza-lo como nome da turma
export function extrairNomeTurmaArquivo(nomeArquivo) {
    let texto = nomeArquivo.replace(/\.xlsx$/i, '').trim();
    texto = texto.replace(/\s*\(\d+\)\s*$/, '').trim();
    texto = texto.replace(/\s*(?:Emitido\s*Pelo\s*)?Educar\s*WEB\s*$/i, '').trim();
    texto = texto.replace(/^Relat[oó]rio\s*/i, '').trim();
    return texto;
}

// formata qualquer tipo de data encontrada no excel para o padrao aaaa-mm-dd
function formatarDataPlanilha(valor) {
    if (!valor) return '';
    if (valor instanceof Date && !isNaN(valor)) {
        return valor.toISOString().slice(0, 10);
    }
    if (typeof valor === 'number') {
        const dataConvertida = new Date(Math.round((valor - 25569) * 86400 * 1000));
        if (!isNaN(dataConvertida)) {
            return dataConvertida.toISOString().slice(0, 10);
        }
    }
    const str = String(valor).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [dia, mes, ano] = str.split('/');
        return `${ano}-${mes}-${dia}`;
    }
    return str.slice(0, 10);
}

// le uma planilha .xlsx individual em memoria e extrai os dados
export function extrairDadosPlanilha(arrayBuffer, nomeArquivo = '', debugPrimeiro = false) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const primeiraAbaNome = workbook.SheetNames[0];
    const aba = workbook.Sheets[primeiraAbaNome];

    const matriz = XLSX.utils.sheet_to_json(aba, { header: 1, defval: null });

    if (!matriz || matriz.length === 0) {
        return { nomeEscola: '', turmas: [] };
    }

    // busca o nome da escola: verifica linha 0 e linha 1 na coluna 14 ou procura por extenso
    let nomeEscola = '';
    const cand1 = matriz[0]?.[14];
    const cand2 = matriz[1]?.[14];

    if (cand1 && String(cand1).trim() !== '' && !['nan', 'none'].includes(String(cand1).toLowerCase())) {
        nomeEscola = String(cand1).trim();
    } else if (cand2 && String(cand2).trim() !== '' && !['nan', 'none'].includes(String(cand2).toLowerCase())) {
        nomeEscola = String(cand2).trim();
    } else {
        // busca nas primeiras 3 linhas por qualquer celula preenchida com emef ou emei
        for (let r = 0; r < Math.min(3, matriz.length); r++) {
            const linha = matriz[r] || [];
            for (let c = 0; c < linha.length; c++) {
                const val = String(linha[c] || '').trim();
                if (/^(EMEF|EMEI|ESCOLA)\b/i.test(val)) {
                    nomeEscola = val;
                    break;
                }
            }
            if (nomeEscola) break;
        }
    }

    const conjuntoTurmas = [];
    let turmaAtual = [];
    let nomeTurmaAtual = '';
    let nomeTurmaLista = '';

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

        // equivalente exato ao if pd.isna(nome): continue do python
        if (nome === null || nome === undefined) {
            continue;
        }

        const nomeStr = String(nome).trim();

        // se o nome for vazio ou nan ignora a linha e nao gera aluno fantasma
        if (!nomeStr || ['nan', 'none'].includes(nomeStr.toLowerCase())) {
            continue;
        }

        if (nomeStr === 'Nome') {
            if (turmaAtual.length > 0 && nomeTurmaLista.trim() !== '') {
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

    if (turmaAtual.length > 0 && nomeTurmaLista.trim() !== '') {
        conjuntoTurmas.push({
            nome: nomeTurmaLista,
            alunos: turmaAtual,
        });
    }

    return { nomeEscola, turmas: conjuntoTurmas };
}

// processa o arquivo zip e estrutura o banco de dados idêntico ao python
export async function processarZipTurmas(arquivoZip) {
    const zip = await JSZip.loadAsync(arquivoZip);
    const bancoDados = { escolas: [] };

    const entradasXlsx = [];
    zip.forEach((caminhoRelativo, entry) => {
        const caminhoNormalizado = caminhoRelativo.replace(/\\/g, '/');
        const partes = caminhoNormalizado.split('/').filter((p) => p.trim() !== '');
        const nomeArquivo = partes[partes.length - 1] || '';

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

    const arquivosPorEscola = {};
    entradasXlsx.forEach((item) => {
        let partes = [...item.partes];
        if (partes.length > 2 && (partes[0].toLowerCase().includes('pet') || partes[0].toLowerCase().includes('pse'))) {
            partes = partes.slice(1);
        }
        if (partes.length < 2) return;

        const pastaEscola = partes[0];
        const temSubpasta = partes.length > 2;

        if (!arquivosPorEscola[pastaEscola]) {
            arquivosPorEscola[pastaEscola] = { temSubpastas: false, arquivos: [] };
        }
        if (temSubpasta) {
            arquivosPorEscola[pastaEscola].temSubpastas = true;
        }
        arquivosPorEscola[pastaEscola].arquivos.push({ ...item, emSubpasta: temSubpasta });
    });

    let jaInspecionouPrimeiro = false;

    for (const [pastaEscola, grupo] of Object.entries(arquivosPorEscola)) {
        const arquivosParaProcessar = grupo.temSubpastas
            ? grupo.arquivos.filter((a) => a.emSubpasta)
            : grupo.arquivos;

        for (const arquivoItem of arquivosParaProcessar) {
            try {
                const arrayBuffer = await arquivoItem.entry.async('arraybuffer');
                const debugEste = !jaInspecionouPrimeiro;
                const { nomeEscola: escolaLida, turmas } = extrairDadosPlanilha(
                    arrayBuffer,
                    arquivoItem.nomeArquivo,
                    debugEste
                );

                if (debugEste) jaInspecionouPrimeiro = true;

                // se a celula veio vazia usa como fallback o nome da pasta
                const nomeFinal = escolaLida || pastaEscola.replace(/\s*-\s*turmas\s*$/i, '').trim();

                if (!nomeFinal || turmas.length === 0) continue;

                if (turmas.length === 1) {
                    const novoNome = extrairNomeTurmaArquivo(arquivoItem.nomeArquivo);
                    if (novoNome) turmas[0].nome = novoNome;
                }

                const escolaExistente = bancoDados.escolas.find(
                    (e) => e.nome.trim().toLowerCase() === nomeFinal.trim().toLowerCase()
                );

                if (escolaExistente) {
                    escolaExistente.turmas.push(...turmas);
                    escolaExistente.datasModificacao.push(arquivoItem.dataModificacao);
                } else {
                    bancoDados.escolas.push({
                        nome: nomeFinal,
                        turmas: turmas,
                        datasModificacao: [arquivoItem.dataModificacao],
                    });
                }
            } catch (err) {
                console.error(`erro em '${arquivoItem.nomeArquivo}':`, err);
            }
        }
    }

    return bancoDados;
}

// gera e dispara o download do json snapshot (identico a opcao 6 do python)
export function baixarSnapshotJson(bancoProcessado) {
    let escolaId = 1;
    let turmaId = 101;
    let alunoId = 1001;
    const escolasFormatadas = [];

    for (const escola of bancoProcessado.escolas) {
        const escolaFormatada = { id: escolaId++, nome: escola.nome, turmas: [] };

        for (const turma of escola.turmas) {
            const turmaFormatada = { id: turmaId++, nome: turma.nome, alunos: [] };

            for (const aluno of turma.alunos) {
                turmaFormatada.alunos.push({
                    id: alunoId++,
                    nome: aluno.nome,
                    dataNascimento: aluno.dataNascimento,
                });
            }
            escolaFormatada.turmas.push(turmaFormatada);
        }
        escolasFormatadas.push(escolaFormatada);
    }

    const payload = JSON.stringify({ escolas: escolasFormatadas }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banco_dados_completo.json';
    a.click();
    URL.revokeObjectURL(url);
}