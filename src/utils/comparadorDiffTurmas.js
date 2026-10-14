// normaliza datas para o formato aaaa-mm-dd antes da comparacao
function normalizarDataParaComparar(valor) {
    if (!valor) return '';
    const str = String(valor).trim();

    // se estiver no formato dd/mm/aaaa converte para aaaa-mm-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [dia, mes, ano] = str.split('/');
        return `${ano}-${mes}-${dia}`;
    }

    // se ja for aaaa-mm-dd ou iso extrai os 10 primeiros caracteres
    return str.slice(0, 10);
}

// normaliza texto para chaves de comparacao
function normalizarChave(texto) {
    return String(texto || '').trim().toLowerCase();
}

// calcula diferencas entre os dados do banco atual e as planilhas do zip
export function calcularDiffTurmas(escolasBanco, escolasZip) {
    const mapaBanco = new Map();
    (escolasBanco || []).forEach((e) => {
        mapaBanco.set(normalizarChave(e.nome), e);
    });

    const mapaZip = new Map();
    (escolasZip || []).forEach((e) => {
        mapaZip.set(normalizarChave(e.nome), e);
    });

    let totalAlunosNovos = 0;
    let totalAlunosRemovidos = 0;
    let totalAlunosModificados = 0;

    const escolasNovas = [];
    const detalhesPorEscola = [];

    // avalia cada escola presente nas planilhas do zip
    for (const escolaZip of escolasZip) {
        const chaveEscola = normalizarChave(escolaZip.nome);
        const escolaBanco = mapaBanco.get(chaveEscola);

        // caso a: escola totalmente nova
        if (!escolaBanco) {
            escolasNovas.push(escolaZip.nome);

            let qtdAlunos = 0;
            (escolaZip.turmas || []).forEach((t) => {
                qtdAlunos += (t.alunos || []).length;
            });

            totalAlunosNovos += qtdAlunos;

            detalhesPorEscola.push({
                nome: escolaZip.nome,
                status: 'nova',
                turmasNovas: (escolaZip.turmas || []).map((t) => t.nome),
                turmasRemovidas: [],
                turmasAlteradas: [],
            });
            continue;
        }

        // caso b: escola existente no banco -> compara turmas e alunos
        const turmasBanco = escolaBanco.turmas || [];
        const turmasZip = escolaZip.turmas || [];

        const mapaTurmasBanco = new Map();
        turmasBanco.forEach((t) => mapaTurmasBanco.set(normalizarChave(t.nome), t));

        const mapaTurmasZip = new Map();
        turmasZip.forEach((t) => mapaTurmasZip.set(normalizarChave(t.nome), t));

        const turmasNovasNomes = [];
        const turmasRemovidasNomes = [];
        const turmasAlteradasDetalhe = [];

        // 1. identifica turmas novas dentro da escola
        for (const tZip of turmasZip) {
            const ch = normalizarChave(tZip.nome);
            if (!mapaTurmasBanco.has(ch)) {
                turmasNovasNomes.push(tZip.nome);
                totalAlunosNovos += (tZip.alunos || []).length;
            }
        }

        // 2. identifica turmas que sumiram da escola
        for (const tBanco of turmasBanco) {
            const ch = normalizarChave(tBanco.nome);
            if (!mapaTurmasZip.has(ch)) {
                turmasRemovidasNomes.push(tBanco.nome);
                totalAlunosRemovidos += (tBanco.alunos || []).length;
            }
        }

        // 3. compara os alunos das turmas que existem em ambos os lados
        for (const tZip of turmasZip) {
            const ch = normalizarChave(tZip.nome);
            const tBanco = mapaTurmasBanco.get(ch);

            if (!tBanco) continue;

            const mapaAlunosBanco = new Map();
            (tBanco.alunos || []).forEach((a) => {
                mapaAlunosBanco.set(normalizarChave(a.nome), a);
            });

            const mapaAlunosZip = new Map();
            (tZip.alunos || []).forEach((a) => {
                mapaAlunosZip.set(normalizarChave(a.nome), a);
            });

            let novosNaTurma = 0;
            let removidosNaTurma = 0;
            let modificadosNaTurma = 0;

            // alunos novos ou com data alterada
            for (const [nomeAluno, aZip] of mapaAlunosZip.entries()) {
                const aBanco = mapaAlunosBanco.get(nomeAluno);
                if (!aBanco) {
                    novosNaTurma++;
                    totalAlunosNovos++;
                } else {
                    const dataBancoNorm = normalizarDataParaComparar(aBanco.dataNascimento);
                    const dataZipNorm = normalizarDataParaComparar(aZip.dataNascimento);

                    if (dataBancoNorm && dataZipNorm && dataBancoNorm !== dataZipNorm) {
                        modificadosNaTurma++;
                        totalAlunosModificados++;
                    }
                }
            }

            // alunos removidos da turma
            for (const nomeAluno of mapaAlunosBanco.keys()) {
                if (!mapaAlunosZip.has(nomeAluno)) {
                    removidosNaTurma++;
                    totalAlunosRemovidos++;
                }
            }

            // inclui apenas turmas que realmente sofreram alguma modificacao
            if (novosNaTurma > 0 || removidosNaTurma > 0 || modificadosNaTurma > 0) {
                turmasAlteradasDetalhe.push({
                    nome: tZip.nome,
                    novos: novosNaTurma,
                    removidos: removidosNaTurma,
                    modificados: modificadosNaTurma,
                });
            }
        }

        // registra a escola apenas se houver pelo menos uma alteracao real
        if (
            turmasNovasNomes.length > 0 ||
            turmasRemovidasNomes.length > 0 ||
            turmasAlteradasDetalhe.length > 0
        ) {
            detalhesPorEscola.push({
                nome: escolaZip.nome,
                status: 'existente',
                turmasNovas: turmasNovasNomes,
                turmasRemovidas: turmasRemovidasNomes,
                turmasAlteradas: turmasAlteradasDetalhe,
            });
        }
    }

    // identifica escolas do banco que nao vieram no arquivo zip
    const escolasAusentesNoZip = [];
    for (const [chaveBanco, escolaBanco] of mapaBanco.entries()) {
        if (!mapaZip.has(chaveBanco)) {
            escolasAusentesNoZip.push(escolaBanco.nome);
        }
    }

    return {
        totalEscolasNoZip: escolasZip.length,
        totalEscolasNovas: escolasNovas.length,
        totalAlunosNovos,
        totalAlunosRemovidos,
        totalAlunosModificados,
        escolasNovas,
        escolasAusentesNoZip,
        detalhesPorEscola,
    };
}