import { useState, useRef, useEffect, useMemo } from 'react';
import { salvarRegistroAtividadeDB } from '../services/supabaseService';
import * as Constantes from '../utils/constantes';
import * as Formatadores from '../utils/formatadores';
import { TELAS, ETAPAS, TURNOS } from '../utils/constantes';
import { useAuth } from '../context/AuthContext';
import { useDados } from '../context/DadosContext';

export function useRegistroPSE() {
    const { usuarioId, nomeUsuario, logout } = useAuth();
    const { escolas, listaUbs } = useDados();

    // Navegação global de ecrãs
    const [telaAtiva, setTelaAtiva] = useState(TELAS.INICIAL);

    // Etapa atual do formulário
    const [etapaAtualId, setEtapaAtualId] = useState(ETAPAS.DATA);

    // Etapa 1: Dados da atividade
    const hoje = new Date();
    const [dia, setDia] = useState(String(hoje.getDate()).padStart(2, '0'));
    const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, '0'));
    const [ano, setAno] = useState(String(hoje.getFullYear()));
    const [turno, setTurno] = useState(TURNOS.MANHA);

    // Etapa 2: Profissionais responsáveis
    const [profissionaisResponsaveis, setProfissionaisResponsaveis] = useState(
        nomeUsuario ? [nomeUsuario] : ['']
    );

    // Etapas 3 e 4: Escolas e Turmas
    const [buscaEscola, setBuscaEscola] = useState('');
    const [escolaSelecionada, setEscolaSelecionada] = useState(null);
    const [buscaTurma, setBuscaTurma] = useState('');
    const [turmaSelecionada, setTurmaSelecionada] = useState([]);

    // Cadastro Manual de Escola / Turma / UBS
    const [escolaManual, setEscolaManual] = useState('');
    const [turmaManual, setTurmaManual] = useState('');
    const [ubsManualTexto, setUbsManualTexto] = useState('');

    // Etapa 5: Eixos temáticos
    const [idsEixosSelecionados, setIdsEixosSelecionados] = useState([]);
    const [nomeEixoLocal, setNomeEixoLocal] = useState('');
    const [observacoes, setObservacoes] = useState('');

    // Etapa 6: Presença de alunos
    const [idsAlunosPresentes, setIdsAlunosPresentes] = useState([]);
    const [novoAlunoNome, setNovoAlunoNome] = useState('');
    const [novoAlunoDataNascimento, setNovoAlunoDataNascimento] = useState('');
    const [alunoAdicionadoAnim, setAlunoAdicionadoAnim] = useState(false);

    // Etapa 7: Coleta individual
    const [alunoAtualIndex, setAlunoAtualIndex] = useState(0);
    const [dadosAlunos, setDadosAlunos] = useState({});
    const [mostrarAlunosPendentes, setMostrarAlunosPendentes] = useState(false);

    // Resumo final
    const [copiado, setCopiado] = useState(false);

    // Persistência na base de dados
    const [salvandoBanco, setSalvandoBanco] = useState(false);
    const [registroSalvo, setRegistroSalvo] = useState(false);
    const [erroSalvarBanco, setErroSalvarBanco] = useState('');

    // Refs de interface
    const cardRef = useRef(null);
    const bgRef = useRef(null);
    const nomeInputRef = useRef(null);
    const alturaInputRef = useRef(null);

    // Scroll automático para o topo em transições
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (cardRef.current) {
            cardRef.current.scrollTop = 0;
        }
    }, [etapaAtualId, alunoAtualIndex, telaAtiva]);

    // Atualiza o profissional padrão quando o utilizador muda
    useEffect(() => {
        if (nomeUsuario) {
            setProfissionaisResponsaveis([nomeUsuario]);
        }
    }, [nomeUsuario]);

    // Logout global e reinicialização do registo
    const handleLogout = async () => {
        await logout();
        reiniciarRegistro();
        setTelaAtiva(TELAS.INICIAL);
    };

    // Avaliações ativas conforme os eixos selecionados
    const temAntropometria = idsEixosSelecionados.includes(Constantes.EIXOS_ID.ANTROPOMETRIA);
    const temVacinacao = idsEixosSelecionados.includes(Constantes.EIXOS_ID.VACINACAO);
    const temSaudeOcular = idsEixosSelecionados.includes(Constantes.EIXOS_ID.SAUDE_OCULAR);
    const temEixoLocal = idsEixosSelecionados.includes(Constantes.EIXOS_ID.TEMATICA_LOCAL);
    const temAvaliacaoIndividual = temAntropometria || temVacinacao || temSaudeOcular;

    const etapasAtivas = useMemo(() => {
        const lista = [
            ETAPAS.DATA,
            ETAPAS.PROFISSIONAIS,
            ETAPAS.ESCOLA,
            ETAPAS.TURMA,
            ETAPAS.EIXOS,
            ETAPAS.PRESENCA,
        ];
        if (temAvaliacaoIndividual) {
            lista.push(ETAPAS.COLETA);
        }
        lista.push(ETAPAS.CONCLUSAO);
        return lista;
    }, [temAvaliacaoIndividual]);

    const totalEtapas = etapasAtivas.length;

    const mapaEtapaNumero = useMemo(() => {
        const mapa = {};
        etapasAtivas.forEach((id, index) => {
            mapa[id] = index + 1;
        });
        mapa[TELAS.CADASTRO_MANUAL] = mapa[ETAPAS.ESCOLA] || 3;
        mapa[TELAS.ADD_ALUNO] = mapa[ETAPAS.PRESENCA] || 6;
        mapa[TELAS.RESUMO] = mapa[ETAPAS.CONCLUSAO] || totalEtapas;
        return mapa;
    }, [etapasAtivas, totalEtapas]);

    const passoVisual = useMemo(() => {
        if (telaAtiva === TELAS.ETAPAS) {
            return mapaEtapaNumero[etapaAtualId] || 1;
        }
        return mapaEtapaNumero[telaAtiva] || 1;
    }, [telaAtiva, etapaAtualId, mapaEtapaNumero]);

    const indiceEtapaAtual = etapasAtivas.indexOf(etapaAtualId);

    const avancarEtapa = () => {
        if (indiceEtapaAtual < etapasAtivas.length - 1) {
            setEtapaAtualId(etapasAtivas[indiceEtapaAtual + 1]);
        }
    };

    const voltarEtapa = () => {
        if (etapaAtualId === ETAPAS.COLETA) {
            setAlunoAtualIndex(0);
            setMostrarAlunosPendentes(false);
        }
        if (indiceEtapaAtual > 0) {
            setEtapaAtualId(etapasAtivas[indiceEtapaAtual - 1]);
        }
    };

    // Filtros e ordenação
    const escolasFiltradas = escolas
        .filter((escola) => escola.nome.toLowerCase().includes(buscaEscola.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const turmasFiltradas =
        escolaSelecionada?.turmas
            ?.filter((turma) => turma.nome.toLowerCase().includes(buscaTurma.toLowerCase()))
            .sort((a, b) => a.nome.localeCompare(b.nome)) || [];

    const toggleTurma = (turma) => {
        setTurmaSelecionada((prev) => {
            const lista = Array.isArray(prev) ? prev : [];
            return lista.some((t) => t.id === turma.id)
                ? lista.filter((t) => t.id !== turma.id)
                : [...lista, turma];
        });
    };

    const turmasArray = Array.isArray(turmaSelecionada)
        ? turmaSelecionada
        : turmaSelecionada ? [turmaSelecionada] : [];

    const alunosOrdenados = turmasArray
        .flatMap((t) => (t.alunos || []).map((a) => ({ ...a, turmaNome: t.nome })))
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

    const alunosPresentes = alunosOrdenados.filter((aluno) =>
        idsAlunosPresentes.includes(aluno.id)
    );

    const alunoAtualTelaAntropometria = alunosPresentes[alunoAtualIndex];

    const toggleAluno = (idAluno) => {
        setIdsAlunosPresentes((prev) =>
            prev.includes(idAluno) ? prev.filter((id) => id !== idAluno) : [...prev, idAluno]
        );
    };

    const todosEstaoPresentes =
        turmasArray.length > 0 &&
        alunosOrdenados.length > 0 &&
        idsAlunosPresentes.length === alunosOrdenados.length;

    const alternarPresencaTodos = () => {
        if (todosEstaoPresentes) {
            setIdsAlunosPresentes([]);
        } else {
            setIdsAlunosPresentes(alunosOrdenados.map((aluno) => aluno.id));
        }
    };

    const marcarTodosPresentes = () => {
        if (turmasArray.length > 0) {
            setIdsAlunosPresentes(alunosOrdenados.map((aluno) => aluno.id));
        }
    };

    const toggleEixo = (idEixo) => {
        setIdsEixosSelecionados((prev) =>
            prev.includes(idEixo) ? prev.filter((id) => id !== idEixo) : [...prev, idEixo]
        );
    };

    const handleAtualizarDadosAluno = (campo, valor) => {
        if (!alunoAtualTelaAntropometria) return;
        setDadosAlunos((prev) => ({
            ...prev,
            [alunoAtualTelaAntropometria.id]: {
                ...prev[alunoAtualTelaAntropometria.id],
                [campo]: valor,
            },
        }));
    };

    const obterAlunosPendentes = () => {
        return alunosPresentes.filter((aluno) => {
            const dados = dadosAlunos[aluno.id] || {};
            if (temAntropometria) {
                if (!dados.altura || !String(dados.altura).trim()) return true;
                if (!dados.peso || !String(dados.peso).trim()) return true;
            }
            if (temVacinacao && !dados.vacinado) return true;
            if (temSaudeOcular && !dados.saudeOcular) return true;
            return false;
        });
    };

    const proximoAluno = () => {
        if (alunoAtualIndex < alunosPresentes.length - 1) {
            setAlunoAtualIndex((prev) => prev + 1);
            setTimeout(() => {
                if (alturaInputRef.current) alturaInputRef.current.focus();
            }, 10);
        } else {
            const pendentes = obterAlunosPendentes();
            if (pendentes.length > 0) {
                setMostrarAlunosPendentes(true);
            } else {
                avancarEtapa();
            }
        }
    };

    const alunoAnterior = () => {
        if (alunoAtualIndex > 0) {
            setAlunoAtualIndex((prev) => prev - 1);
            setTimeout(() => {
                if (alturaInputRef.current) alturaInputRef.current.focus();
            }, 10);
        } else {
            voltarEtapa();
        }
    };

    const handleAdicionarAluno = () => {
        if (!novoAlunoNome || turmasArray.length === 0) return;
        const novoAlunoId = Date.now();
        const novoAluno = {
            id: novoAlunoId,
            nome: novoAlunoNome,
            dataNascimento: novoAlunoDataNascimento,
        };
        setTurmaSelecionada((prev) => {
            const lista = Array.isArray(prev) ? prev : [prev];
            const primeira = { ...lista[0], alunos: [...(lista[0]?.alunos || []), novoAluno] };
            return [primeira, ...lista.slice(1)];
        });
        setIdsAlunosPresentes((prev) => [...prev, novoAlunoId]);
        setNovoAlunoNome('');
        setNovoAlunoDataNascimento('');
        setAlunoAdicionadoAnim(true);
        setTimeout(() => setAlunoAdicionadoAnim(false), 2000);
        setTimeout(() => {
            if (nomeInputRef.current) nomeInputRef.current.focus();
        }, 10);
    };

    const handleSalvarManual = () => {
        const ubsEncontrada = listaUbs.find(
            (u) => u.nome.trim().toLowerCase() === ubsManualTexto.trim().toLowerCase()
        );
        setEscolaSelecionada({
            id: 'manual_escola',
            nome: escolaManual,
            turmas: [],
            ubsManualId: ubsEncontrada ? ubsEncontrada.id : null,
        });
        setTurmaSelecionada([{ id: 'manual_turma', nome: turmaManual, alunos: [] }]);
        setIdsAlunosPresentes([]);
        setEtapaAtualId(ETAPAS.EIXOS);
        setTelaAtiva(TELAS.ETAPAS);
    };

    const gerarObjetoRelatorio = () => {
        return {
            data: Formatadores.formatarDataComTurno(dia, mes, ano, turno),
            escola: escolaSelecionada?.nome || '',
            turma: Formatadores.formatarTurmas(turmasArray.length > 0 ? turmasArray : turmaManual),
            profissionaisResponsaveis: profissionaisResponsaveis,
            Registrador: nomeUsuario,
            eixosTematicos: Formatadores.formatarEixosTematicosSelecionados(idsEixosSelecionados, nomeEixoLocal),
            observacoes: observacoes,
            alunosPresentes: alunosOrdenados
                .filter((aluno) => idsAlunosPresentes.includes(aluno.id))
                .map((aluno) => ({
                    id: aluno.id,
                    nome: aluno.nome,
                    dataNascimento: aluno.dataNascimento,
                    altura: dadosAlunos[aluno.id]?.altura || null,
                    peso: dadosAlunos[aluno.id]?.peso || null,
                    vacinado: dadosAlunos[aluno.id]?.vacinado || null,
                    saudeOcular: dadosAlunos[aluno.id]?.saudeOcular || null,
                })),
        };
    };

    const handleSalvarNoBanco = async () => {
        if (registroSalvo || salvandoBanco) return;

        setSalvandoBanco(true);
        setErroSalvarBanco('');

        const relatorio = gerarObjetoRelatorio();
        const dataIso = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const idEscolaValido = typeof escolaSelecionada?.id === 'number' ? escolaSelecionada.id : null;

        const ubsIdParaSalvar = idEscolaValido !== null
            ? null
            : (escolaSelecionada?.ubsManualId || (ubsManualTexto ? listaUbs.find(u => u.nome.trim().toLowerCase() === ubsManualTexto.trim().toLowerCase())?.id : null) || null);

        const payload = {
            dataAtividade: dataIso,
            turno: turno,
            escolaId: idEscolaValido,
            ubsId: ubsIdParaSalvar,
            escolaNome: escolaSelecionada?.nome || escolaManual || '',
            turmas: relatorio.turma,
            profissionais: profissionaisResponsaveis.filter((p) => p && p.trim().length > 0),
            usuarioId: usuarioId || null,
            registradorNome: nomeUsuario || '',
            eixosTematicos: Formatadores.formatarEixosTematicosSelecionados(idsEixosSelecionados, nomeEixoLocal),
            observacoes: observacoes || '',
            alunosDados: relatorio.alunosPresentes,
        };

        const resultado = await salvarRegistroAtividadeDB(payload);
        setSalvandoBanco(false);

        if (!resultado.sucesso) {
            setErroSalvarBanco(resultado.erro || 'Falha ao salvar o registro no banco de dados.');
            return;
        }

        setRegistroSalvo(true);
    };

    const handleCopiarResumo = async () => {
        const dados = gerarObjetoRelatorio();
        const linhas = [
            'Resumo da Atividade',
            '',
            `Registrado por: ${dados.Registrador}`,
            `Profissionais que realizaram a ação: ${Formatadores.formatarProfissionais(dados.profissionaisResponsaveis)}`,
            `Escola: ${dados.escola}`,
            `Turma: ${dados.turma}`,
            `Data de realização: ${dados.data}`,
            '',
            'Eixos Selecionados:',
            ...dados.eixosTematicos.map((eixo) => `- ${eixo}`),
            `Observações: ${dados.observacoes}`,
            '',
            'Alunos que participaram da ação:',
        ];

        dados.alunosPresentes.forEach((aluno) => {
            let linhaAluno = `- ${aluno.nome} (${Formatadores.formatarData(aluno.dataNascimento)})`;
            const detalhes = [];
            if (aluno.peso) detalhes.push(`${aluno.peso}kg`);
            if (aluno.altura) detalhes.push(`${aluno.altura}cm`);
            if (aluno.vacinado) detalhes.push(`Vacina: ${Formatadores.formatarVacinacao(aluno.vacinado)}`);
            if (aluno.saudeOcular) detalhes.push(`Saúde Ocular: ${Formatadores.formatarSaudeOcular(aluno.saudeOcular)}`);
            if (detalhes.length > 0) {
                linhaAluno += ` [${detalhes.join(' - ')}]`;
            }
            linhas.push(linhaAluno);
        });

        try {
            await navigator.clipboard.writeText(linhas.join('\n'));
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch (erro) {
            console.error('Erro ao copiar', erro);
        }
    };

    const reiniciarRegistro = () => {
        setEtapaAtualId(ETAPAS.DATA);
        setTurno(TURNOS.MANHA);
        setAlunoAtualIndex(0);
        setEscolaSelecionada(null);
        setBuscaEscola('');
        setTurmaSelecionada([]);
        setBuscaTurma('');
        setEscolaManual('');
        setTurmaManual('');
        setNovoAlunoNome('');
        setNovoAlunoDataNascimento('');
        setIdsEixosSelecionados([]);
        setNomeEixoLocal('');
        setObservacoes('');
        setIdsAlunosPresentes([]);
        setDadosAlunos({});
        setUbsManualTexto('');
        setMostrarAlunosPendentes(false);
        setProfissionaisResponsaveis(nomeUsuario ? [nomeUsuario] : []);
        setRegistroSalvo(false);

        const dataAtual = new Date();
        setDia(String(dataAtual.getDate()).padStart(2, '0'));
        setMes(String(dataAtual.getMonth() + 1).padStart(2, '0'));
        setAno(String(dataAtual.getFullYear()));
    };

    return {
        telaAtiva,
        setTelaAtiva,
        handleLogout,

        etapaAtualId,
        passoVisual,
        totalEtapas,
        mapaEtapaNumero,
        avancarEtapa,
        voltarEtapa,

        dia,
        setDia,
        mes,
        setMes,
        ano,
        setAno,
        turno,
        setTurno,
        profissionaisResponsaveis,
        setProfissionaisResponsaveis,

        buscaEscola,
        setBuscaEscola,
        escolaSelecionada,
        setEscolaSelecionada,
        escolasFiltradas,
        buscaTurma,
        setBuscaTurma,
        turmaSelecionada,
        setTurmaSelecionada,
        toggleTurma,
        turmasFiltradas,
        escolaManual,
        setEscolaManual,
        turmaManual,
        setTurmaManual,
        handleSalvarManual,
        ubsManualTexto,
        setUbsManualTexto,
        listaUbs,

        idsEixosSelecionados,
        toggleEixo,
        temEixoLocal,
        nomeEixoLocal,
        setNomeEixoLocal,
        observacoes,
        setObservacoes,

        alunosOrdenados,
        idsAlunosPresentes,
        toggleAluno,
        alternarPresencaTodos,
        todosEstaoPresentes,
        marcarTodosPresentes,
        novoAlunoNome,
        setNovoAlunoNome,
        novoAlunoDataNascimento,
        setNovoAlunoDataNascimento,
        alunoAdicionadoAnim,
        handleAdicionarAluno,

        alunoAtualIndex,
        setAlunoAtualIndex,
        alunosPresentes,
        alunoAtualTelaAntropometria,
        dadosAlunos,
        handleAtualizarDadosAluno,
        temAntropometria,
        temVacinacao,
        temSaudeOcular,
        mostrarAlunosPendentes,
        setMostrarAlunosPendentes,
        obterAlunosPendentes,
        proximoAluno,
        alunoAnterior,

        gerarObjetoRelatorio,
        copiado,
        handleCopiarResumo,
        reiniciarRegistro,

        salvandoBanco,
        registroSalvo,
        erroSalvarBanco,
        handleSalvarNoBanco,

        cardRef,
        bgRef,
        nomeInputRef,
        alturaInputRef,
    };
}