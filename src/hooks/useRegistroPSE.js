import { useState, useRef, useEffect } from 'react';
import { autenticarUsuario, carregarEscolasDB } from '../services/supabaseService';
import * as Constantes from '../constantes';
import { formatarData } from '../utils/formatadores';
import { TELAS } from '../constantes';

export function useRegistroPSE() {
    // Dados do Supabase
    const [escolas, setEscolas] = useState([]);

    // Estados de navegação e telas
    const [telaAtiva, setTelaAtiva] = useState(TELAS.INICIAL);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Autenticação
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');

    // Identificação do utilizador autenticado
    const [usuarioId, setUsuarioId] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');

    // Etapa atual do fluxo (1 a 7)
    const [etapa, setEtapa] = useState(1);

    // Dados da atividade (Etapa 1)
    const hoje = new Date();
    const [dia, setDia] = useState(String(hoje.getDate()).padStart(2, '0'));
    const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, '0'));
    const [ano, setAno] = useState(String(hoje.getFullYear()));
    const [profissionaisResponsaveis, setProfissionaisResponsaveis] = useState([]);

    // Escolas e Turmas (Etapas 2 e 3)
    const [buscaEscola, setBuscaEscola] = useState('');
    const [escolaSelecionada, setEscolaSelecionada] = useState(null);
    const [buscaTurma, setBuscaTurma] = useState('');
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);

    // Cadastro Manual
    const [escolaManual, setEscolaManual] = useState('');
    const [turmaManual, setTurmaManual] = useState('');

    // Eixos temáticos (Etapa 4)
    const [idsEixosSelecionados, setIdsEixosSelecionados] = useState([]);
    const [nomeEixoLocal, setNomeEixoLocal] = useState('');
    const [observacoes, setObservacoes] = useState('');

    // Alunos e Presença (Etapa 5)
    const [idsAlunosPresentes, setIdsAlunosPresentes] = useState([]);
    const [novoAlunoNome, setNovoAlunoNome] = useState('');
    const [novoAlunoDataNascimento, setNovoAlunoDataNascimento] = useState('');
    const [alunoAdicionadoAnim, setAlunoAdicionadoAnim] = useState(false);

    // Coleta individual (Etapa 6)
    const [alunoAtualIndex, setAlunoAtualIndex] = useState(0);
    const [dadosAlunos, setDadosAlunos] = useState({});
    const [mostrarAlunosPendentes, setMostrarAlunosPendentes] = useState(false);

    // Resumo final
    const [copiado, setCopiado] = useState(false);

    // Refs de UI
    const cardRef = useRef(null);
    const bgRef = useRef(null);
    const nomeInputRef = useRef(null);
    const alturaInputRef = useRef(null);

    // Scroll automático para o topo em mudanças de tela
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (cardRef.current) {
            cardRef.current.scrollTop = 0;
        }
    }, [etapa, alunoAtualIndex, telaAtiva]);

    // Busca inicial dos dados no Supabase
    const buscarDados = async () => {
        const escolasCarregadas = await carregarEscolasDB();
        setEscolas(escolasCarregadas);
    };

    // Login
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setMensagemErro('');

        const resultado = await autenticarUsuario(loginInput, senhaInput);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro);
            return;
        }

        if (resultado.id) {
            setUsuarioId(resultado.id);
        }

        if (resultado.nome) {
            setNomeUsuario(resultado.nome);
            setProfissionaisResponsaveis([resultado.nome]);
        }

        setIsLoggedIn(true);
        setMensagemErro('');
        await buscarDados();
        setTelaAtiva(TELAS.ETAPAS);
    };

    // Computed values: Eixos
    const temAntropometria = idsEixosSelecionados.includes(Constantes.EIXOS_ID.ANTROPOMETRIA);
    const temVacinacao = idsEixosSelecionados.includes(Constantes.EIXOS_ID.VACINACAO);
    const temSaudeOcular = idsEixosSelecionados.includes(Constantes.EIXOS_ID.SAUDE_OCULAR);
    const temEixoLocal = idsEixosSelecionados.includes(Constantes.EIXOS_ID.TEMATICA_LOCAL);
    const temAvaliacaoIndividual = temAntropometria || temVacinacao || temSaudeOcular;

    // Navegação entre etapas com desvio condicional
    const avancarEtapa = () => {
        if (etapa === 5 && !temAvaliacaoIndividual) {
            setEtapa(7);
            return;
        }
        setEtapa((prev) => prev + 1);
    };

    const voltarEtapa = () => {
        if (etapa === 7 && !temAvaliacaoIndividual) {
            setEtapa(5);
            return;
        }
        if (etapa === 6) {
            setAlunoAtualIndex(0);
            setMostrarAlunosPendentes(false);
        }
        setEtapa((prev) => prev - 1);
    };

    // Filtros de listas
    const escolasFiltradas = escolas
        .filter((escola) => escola.nome.toLowerCase().includes(buscaEscola.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const turmasFiltradas =
        escolaSelecionada?.turmas
            ?.filter((turma) => turma.nome.toLowerCase().includes(buscaTurma.toLowerCase()))
            .sort((a, b) => a.nome.localeCompare(b.nome)) || [];

    const alunosOrdenados = [...(turmaSelecionada?.alunos || [])].sort((a, b) =>
        (a.nome || '').localeCompare(b.nome || '')
    );

    const alunosPresentes = alunosOrdenados.filter((aluno) =>
        idsAlunosPresentes.includes(aluno.id)
    );

    const alunoAtualTelaAntropometria = alunosPresentes[alunoAtualIndex];

    // Presença
    const toggleAluno = (idAluno) => {
        setIdsAlunosPresentes((prev) =>
            prev.includes(idAluno) ? prev.filter((id) => id !== idAluno) : [...prev, idAluno]
        );
    };

    const todosEstaoPresentes =
        turmaSelecionada &&
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
        if (turmaSelecionada) {
            setIdsAlunosPresentes(alunosOrdenados.map((aluno) => aluno.id));
        }
    };

    // Eixos
    const toggleEixo = (idEixo) => {
        setIdsEixosSelecionados((prev) =>
            prev.includes(idEixo) ? prev.filter((id) => id !== idEixo) : [...prev, idEixo]
        );
    };

    const formatarEixosTematicosSelecionados = () => {
        return Constantes.EIXOS_TEMATICOS
            .filter((eixo) => idsEixosSelecionados.includes(eixo.id))
            .map((eixo) => {
                if (eixo.id === Constantes.EIXOS_ID.TEMATICA_LOCAL && nomeEixoLocal.trim()) {
                    return `${eixo.label}: ${nomeEixoLocal.trim()}`;
                }
                return eixo.label;
            });
    };

    // Coleta individual de dados
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

    // Inclusões manuais
    const handleAdicionarAluno = () => {
        if (!novoAlunoNome || !turmaSelecionada) return;
        const novoAlunoId = Date.now();
        const novoAluno = {
            id: novoAlunoId,
            nome: novoAlunoNome,
            dataNascimento: novoAlunoDataNascimento,
        };
        setTurmaSelecionada((prev) => ({ ...prev, alunos: [...prev.alunos, novoAluno] }));
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
        setEscolaSelecionada({ id: 'manual_escola', nome: escolaManual, turmas: [] });
        setTurmaSelecionada({ id: 'manual_turma', nome: turmaManual, alunos: [] });
        setIdsAlunosPresentes([]);
        setEtapa(4);
        setTelaAtiva('ETAPAS');
    };

    // Relatório e Resumo
    const gerarObjetoRelatorio = () => {
        return {
            data: `${dia}/${mes}/${ano}`,
            escola: escolaSelecionada?.nome || '',
            turma: turmaSelecionada?.nome || '',
            profissionaisResponsaveis: profissionaisResponsaveis,
            Registrador: nomeUsuario,
            eixosTematicos: formatarEixosTematicosSelecionados(),
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

    const handleCopiarResumo = async () => {
        const dados = gerarObjetoRelatorio();
        const linhas = [
            'Resumo da Atividade',
            '',
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
            let linhaAluno = `- ${aluno.nome} (${formatarData(aluno.dataNascimento)})`;
            const detalhes = [];
            if (aluno.peso) detalhes.push(`${aluno.peso}kg`);
            if (aluno.altura) detalhes.push(`${aluno.altura}cm`);
            if (aluno.vacinado) detalhes.push(`Vacina: ${Constantes.formatarVacinacao(aluno.vacinado)}`);
            if (aluno.saudeOcular) detalhes.push(`Saúde Ocular: ${Constantes.formatarSaudeOcular(aluno.saudeOcular)}`);
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
        setEtapa(1);
        setAlunoAtualIndex(0);
        setEscolaSelecionada(null);
        setBuscaEscola('');
        setTurmaSelecionada(null);
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
        setMostrarAlunosPendentes(false);
        setProfissionaisResponsaveis(nomeUsuario ? [nomeUsuario] : []);
        setTelaAtiva(TELAS.INICIAL);
        const dataAtual = new Date();
        setDia(String(dataAtual.getDate()).padStart(2, '0'));
        setMes(String(dataAtual.getMonth() + 1).padStart(2, '0'));
        setAno(String(dataAtual.getFullYear()));
    };

    return {
        // Estados de UI
        telaAtiva,
        setTelaAtiva,
        isLoggedIn,

        // Login
        loginInput,
        setLoginInput,
        senhaInput,
        setSenhaInput,
        mensagemErro,
        setMensagemErro,
        handleLogin,

        // Etapa e navegação
        etapa,
        avancarEtapa,
        voltarEtapa,

        // Etapa 1
        dia,
        setDia,
        mes,
        setMes,
        ano,
        setAno,
        profissionaisResponsaveis,
        setProfissionaisResponsaveis,

        // Etapas 2 e 3
        buscaEscola,
        setBuscaEscola,
        escolaSelecionada,
        setEscolaSelecionada,
        escolasFiltradas,
        buscaTurma,
        setBuscaTurma,
        turmaSelecionada,
        setTurmaSelecionada,
        turmasFiltradas,
        escolaManual,
        setEscolaManual,
        turmaManual,
        setTurmaManual,
        handleSalvarManual,

        // Etapa 4
        idsEixosSelecionados,
        toggleEixo,
        temEixoLocal,
        nomeEixoLocal,
        setNomeEixoLocal,
        observacoes,
        setObservacoes,

        // Etapa 5
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

        // Etapa 6
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

        // Etapa 7 e Resumo
        gerarObjetoRelatorio,
        copiado,
        handleCopiarResumo,
        reiniciarRegistro,

        // Refs
        cardRef,
        bgRef,
        nomeInputRef,
        alturaInputRef,

        // Outros
        nomeUsuario,
        setNomeUsuario,
    };
}