// compara o estado atual do banco com os dados recem extraidos do arquivo zip
export function calcularDiffTurmas(escolasAtuais = [], escolasNovas = []) {
    const diff = {
        totalEscolasNovas: 0,
        totalEscolasNoZip: escolasNovas.length,
        totalAlunosNovos: 0,
        totalAlunosRemovidos: 0,
        totalAlunosModificados: 0,
        escolasNovas: [],
        escolasAusentesNoZip: [],
        detalhesPorEscola: [],
    };

    // cria mapa com as escolas atuais indexadas pelo nome normalizado
    const mapaAtuais = new Map();
    escolasAtuais.forEach((e) => {
        if (e && e.nome) {
            mapaAtuais.set(e.nome.trim().toLowerCase(), e);
        }
    });

    // cria mapa com as escolas novas vindas do zip
    const mapaNovas = new Map();
    escolasNovas.forEach((e) => {
        if (e && e.nome) {
            mapaNovas.set(e.nome.trim().toLowerCase(), e);
        }
    });

    // 1. avalia cada escola presente no arquivo zip
    escolasNovas.forEach((escolaNova) => {
        const chave = escolaNova.nome.trim().toLowerCase();
        const escolaAtual = mapaAtuais.get(chave);

        // escola ausente no banco atual (escola nova)
        if (!escolaAtual) {
            diff.totalEscolasNovas += 1;
            diff.escolasNovas.push(escolaNova.nome);

            let qtdAlunosEscolaNova = 0;
            (escolaNova.turmas || []).forEach((t) => {
                qtdAlunosEscolaNova += (t.alunos || []).length;
            });
            diff.totalAlunosNovos += qtdAlunosEscolaNova;

            diff.detalhesPorEscola.push({
                nome: escolaNova.nome,
                status: 'nova',
                turmasNovas: (escolaNova.turmas || []).map((t) => t.nome),
                turmasRemovidas: [],
                turmasAlteradas: [],
                totalAlunosDelta: qtdAlunosEscolaNova,
            });
            return;
        }

        // escola ja existe no banco: compara turma por turma
        const turmasAtuaisMap = new Map();
        (escolaAtual.turmas || []).forEach((t) => {
            if (t && t.nome) turmasAtuaisMap.set(t.nome.trim().toLowerCase(), t);
        });

        const turmasNovasMap = new Map();
        (escolaNova.turmas || []).forEach((t) => {
            if (t && t.nome) turmasNovasMap.set(t.nome.trim().toLowerCase(), t);
        });

        const turmasNovas = [];
        const turmasRemovidas = [];
        const turmasAlteradas = [];
        let deltaAlunosEscola = 0;

        // verifica turmas novas ou modificadas
        escolaNova.turmas.forEach((tNova) => {
            const chaveTurma = tNova.nome.trim().toLowerCase();
            const tAtual = turmasAtuaisMap.get(chaveTurma);

            if (!tAtual) {
                // turma totalmente nova nesta escola
                turmasNovas.push(tNova.nome);
                const qtd = (tNova.alunos || []).length;
                diff.totalAlunosNovos += qtd;
                deltaAlunosEscola += qtd;
            } else {
                // turma ja existente: compara alunos
                const alunosAtuais = tAtual.alunos || [];
                const alunosNovos = tNova.alunos || [];

                const mapaAlunosAtuais = new Map(
                    alunosAtuais.map((a) => [a.nome.trim().toLowerCase(), a])
                );
                const mapaAlunosNovos = new Map(
                    alunosNovos.map((a) => [a.nome.trim().toLowerCase(), a])
                );

                let novosNaTurma = 0;
                let removidosNaTurma = 0;
                let alteradosNaTurma = 0;

                alunosNovos.forEach((aNovo) => {
                    const chaveAluno = aNovo.nome.trim().toLowerCase();
                    const aAtual = mapaAlunosAtuais.get(chaveAluno);
                    if (!aAtual) {
                        novosNaTurma += 1;
                    } else if (aAtual.dataNascimento !== aNovo.dataNascimento) {
                        alteradosNaTurma += 1;
                    }
                });

                alunosAtuais.forEach((aAtual) => {
                    const chaveAluno = aAtual.nome.trim().toLowerCase();
                    if (!mapaAlunosNovos.has(chaveAluno)) {
                        removidosNaTurma += 1;
                    }
                });

                diff.totalAlunosNovos += novosNaTurma;
                diff.totalAlunosRemovidos += removidosNaTurma;
                diff.totalAlunosModificados += alteradosNaTurma;
                deltaAlunosEscola += novosNaTurma - removidosNaTurma;

                if (novosNaTurma > 0 || removidosNaTurma > 0 || alteradosNaTurma > 0) {
                    turmasAlteradas.push({
                        nome: tNova.nome,
                        novos: novosNaTurma,
                        removidos: removidosNaTurma,
                        alterados: alteradosNaTurma,
                        totalAtual: alunosNovos.length,
                    });
                }
            }
        });

        // verifica turmas que existiam no banco mas sumiram no zip
        escolaAtual.turmas.forEach((tAtual) => {
            const chaveTurma = tAtual.nome.trim().toLowerCase();
            if (!turmasNovasMap.has(chaveTurma)) {
                turmasRemovidas.push(tAtual.nome);
                const qtd = (tAtual.alunos || []).length;
                diff.totalAlunosRemovidos += qtd;
                deltaAlunosEscola -= qtd;
            }
        });

        // se houve qualquer diferenca nessa escola adiciona ao resumo
        if (
            turmasNovas.length > 0 ||
            turmasRemovidas.length > 0 ||
            turmasAlteradas.length > 0
        ) {
            diff.detalhesPorEscola.push({
                nome: escolaNova.nome,
                status: 'modificada',
                turmasNovas,
                turmasRemovidas,
                turmasAlteradas,
                totalAlunosDelta: deltaAlunosEscola,
            });
        }
    });

    // 2. identifica escolas que existem no banco mas nao vieram no zip
    escolasAtuais.forEach((escolaAtual) => {
        const chave = escolaAtual.nome.trim().toLowerCase();
        if (!mapaNovas.has(chave)) {
            diff.escolasAusentesNoZip.push(escolaAtual.nome);
        }
    });

    return diff;
}