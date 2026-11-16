import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { salvarRegistroAtividadeDB } from '../services/supabaseService';
import * as Constantes from '../utils/constantes';
import * as Formatadores from '../utils/formatadores';
import { TELAS, ETAPAS, TURNOS } from '../utils/constantes';
import { useAuth } from '../context/AuthContext';
import { useDados } from '../context/DadosContext';
import { navegarComFeedback } from '../utils/delayTouch';
import { numeroDecimal, normalizarDecimal } from '../utils/medidas';

export function useRegistroPSE() {
    const { usuarioId, nomeUsuario, logout, aoDeslogar } = useAuth();
    const { escolas, listaUbs } = useDados();

    // Navegação global de ecrãs
    const [telaAtivaInterna, setTelaAtivaInterna] = useState(TELAS.INICIAL);
    const setTelaAtiva = (novaTela, forceInstant = false) => {
        if (forceInstant) {
            setTelaAtivaInterna(novaTela);
        } else {
            navegarComFeedback(() => setTelaAtivaInterna(novaTela));
        }
    };

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
    }, [etapaAtualId, alunoAtualIndex, telaAtivaInterna]);

    // Atualiza o profissional padrão quando o utilizador muda
    useEffect(() => {
        if (nomeUsuario) {
            setProfissionaisResponsaveis([nomeUsuario]);
        }
    }, [nomeUsuario]);

    // Logout global (o registro é reiniciado pelo ouvinte de logout abaixo)
    const handleLogout = async () => {
        await logout();
    };

    // Avaliações ativas conforme os eixos selecionados
    const temAntropometria = idsEixosSelecionados.includes(Constantes.EIXOS_ID.ANTROPOMETRIA);
    const temVacinacao = idsEixosSelecionados.includes(Constantes.EIXOS_ID.VACINACAO);
    const temSaudeOcular = idsEixosSelecionados.includes(Constantes.EIXOS_ID.SAUDE_OCULAR);
    const temSaudeAuditiva = idsEixosSelecionados.includes(Constantes.EIXOS_ID.SAUDE_AUDITIVA);
    const temEixoLocal = idsEixosSelecionados.includes(Constantes.EIXOS_ID.TEMATICA_LOCAL);
    const temAvaliacaoIndividual =
        temAntropometria || temVacinacao || temSaudeOcular || temSaudeAuditiva;

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
        mapa[TELAS.CADASTRO_MANUAL] =
            etapaAtualId === ETAPAS.TURMA ? mapa[ETAPAS.TURMA] || 4 : mapa[ETAPAS.ESCOLA] || 3;
        mapa[TELAS.ADD_ALUNO] = mapa[ETAPAS.PRESENCA] || 6;
        mapa[TELAS.RESUMO] = mapa[ETAPAS.CONCLUSAO] || totalEtapas;
        return mapa;
    }, [etapasAtivas, totalEtapas, etapaAtualId]);

    const passoVisual = useMemo(() => {
        if (telaAtivaInterna === TELAS.ETAPAS) {
            return mapaEtapaNumero[etapaAtualId] || 1;
        }
        return mapaEtapaNumero[telaAtivaInterna] || 1;
    }, [telaAtivaInterna, etapaAtualId, mapaEtapaNumero]);

    const indiceEtapaAtual = etapasAtivas.indexOf(etapaAtualId);
    const avancarEtapa = () => {
        navegarComFeedback(() => {
            if (indiceEtapaAtual < etapasAtivas.length - 1) {
                setEtapaAtualId(etapasAtivas[indiceEtapaAtual + 1]);
            }
        });
    };
    const voltarEtapa = () => {
        navegarComFeedback(() => {
            if (etapaAtualId === ETAPAS.COLETA) {
                setAlunoAtualIndex(0);
                setMostrarAlunosPendentes(false);
            }
            if (indiceEtapaAtual > 0) {
                setEtapaAtualId(etapasAtivas[indiceEtapaAtual - 1]);
            }
        });
    };

    // Filtros e ordenação
    const escolasFiltradas = escolas
        .filter((escola) => escola.nome.toLowerCase().includes(buscaEscola.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const ID_TURMA_MANUAL = 'manual_turma';

    // Turmas da escola + turma cadastrada manualmente (para continuar visível e desmarcável)
    const turmasFiltradas = [
        ...(escolaSelecionada?.turmas || []),
        ...(Array.isArray(turmaSelecionada) ? turmaSelecionada : []).filter(
            (t) => t.id === ID_TURMA_MANUAL
        ),
    ]
        .filter((turma) => turma.nome.toLowerCase().includes(buscaTurma.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    // Cadastro manual aberto a partir da etapa de turmas, com uma escola da lista já escolhida:
    // pede apenas o nome da turma e mantém a escola real
    const cadastroManualSomenteTurma =
        etapaAtualId === ETAPAS.TURMA && typeof escolaSelecionada?.id === 'number';

    // Ao trocar de escola, descarta turmas, presenças e dados coletados da escola anterior
    const selecionarEscola = (escola) => {
        if (escola?.id !== escolaSelecionada?.id) {
            setTurmaSelecionada([]);
            setBuscaTurma('');
            setIdsAlunosPresentes([]);
            idsAlunosJaExibidosRef.current = new Set();
            setDadosAlunos({});
            setAlunoAtualIndex(0);
        }
        setEscolaSelecionada(escola);
    };

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

    // Compara com os alunos das turmas atuais (ignora ids de turmas que foram desmarcadas)
    const todosEstaoPresentes =
        alunosOrdenados.length > 0 && alunosPresentes.length === alunosOrdenados.length;

    const alternarPresencaTodos = () => {
        if (todosEstaoPresentes) {
            setIdsAlunosPresentes([]);
        } else {
            setIdsAlunosPresentes(alunosOrdenados.map((aluno) => aluno.id));
        }
    };

    // Alunos que já apareceram na tela de presença neste registro
    const idsAlunosJaExibidosRef = useRef(new Set());

    // Antes de abrir a presença: marca como presentes apenas os alunos que ainda não
    // foram exibidos, preservando as marcações que o usuário já fez
    const prepararPresenca = () => {
        const jaExibidos = idsAlunosJaExibidosRef.current;
        const novos = alunosOrdenados
            .map((aluno) => aluno.id)
            .filter((id) => !jaExibidos.has(id));
        if (novos.length === 0) return;
        novos.forEach((id) => jaExibidos.add(id));
        setIdsAlunosPresentes((prev) => [...prev, ...novos.filter((id) => !prev.includes(id))]);
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

    // Indica se os dados de um aluno estão completos para os eixos selecionados
    const dadosAlunoCompletos = (dados = {}) => {
        if (temAntropometria) {
            if (numeroDecimal(dados.altura) === null) return false;
            if (numeroDecimal(dados.peso) === null) return false;
        }
        if (temVacinacao && !dados.vacinado) return false;
        if (temSaudeOcular && !dados.saudeOcular) return false;
        if (temSaudeAuditiva && !dados.saudeAuditiva) return false;
        return true;
    };

    const obterAlunosPendentes = () => {
        return alunosPresentes.filter((aluno) => !dadosAlunoCompletos(dadosAlunos[aluno.id]));
    };

    // Coloca o cursor na altura no mesmo instante do toque/Enter: no iPhone, o teclado
    // só abre se o foco acontecer dentro da interação do usuário (não depois de um atraso)
    const focarAltura = () => {
        alturaInputRef.current?.focus({ preventScroll: true });
    };

    const proximoAluno = () => {
        if (alunoAtualIndex < alunosPresentes.length - 1) {
            focarAltura();
            setAlunoAtualIndex((prev) => prev + 1);
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
            focarAltura();
            setAlunoAtualIndex((prev) => prev - 1);
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
        if (cadastroManualSomenteTurma) {
            setTurmaSelecionada((prev) => [
                ...(Array.isArray(prev) ? prev : []).filter((t) => t.id !== ID_TURMA_MANUAL),
                { id: ID_TURMA_MANUAL, nome: turmaManual.trim(), alunos: [] },
            ]);
            setEtapaAtualId(ETAPAS.EIXOS);
            setTelaAtiva(TELAS.ETAPAS);
            return;
        }

        const ubsEncontrada = listaUbs.find(
            (u) => u.nome.trim().toLowerCase() === ubsManualTexto.trim().toLowerCase()
        );
        setEscolaSelecionada({
            id: 'manual_escola',
            nome: escolaManual,
            turmas: [],
            ubsManualId: ubsEncontrada ? ubsEncontrada.id : null,
        });
        setTurmaSelecionada([{ id: ID_TURMA_MANUAL, nome: turmaManual, alunos: [] }]);
        setIdsAlunosPresentes([]);
        idsAlunosJaExibidosRef.current = new Set();
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
                    altura: normalizarDecimal(dadosAlunos[aluno.id]?.altura),
                    peso: normalizarDecimal(dadosAlunos[aluno.id]?.peso),
                    vacinado: dadosAlunos[aluno.id]?.vacinado || null,
                    saudeOcular: dadosAlunos[aluno.id]?.saudeOcular || null,
                    saudeAuditiva: dadosAlunos[aluno.id]?.saudeAuditiva || null,
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
            let linhaAluno = `- ${aluno.nome} (${Formatadores.formatarDataIso(aluno.dataNascimento)})`;
            const detalhes = [];
            if (aluno.peso) detalhes.push(`${aluno.peso}kg`);
            if (aluno.altura) detalhes.push(`${aluno.altura}cm`);
            if (aluno.vacinado) detalhes.push(`Vacina: ${Formatadores.formatarVacinacao(aluno.vacinado)}`);
            if (aluno.saudeOcular) detalhes.push(`Saúde Ocular: ${Formatadores.formatarSaudeOcular(aluno.saudeOcular)}`);
            if (aluno.saudeAuditiva) detalhes.push(`Saúde Auditiva: ${Formatadores.formatarSaudeAuditiva(aluno.saudeAuditiva)}`);
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
        idsAlunosJaExibidosRef.current = new Set();
        setDadosAlunos({});
        setUbsManualTexto('');
        setMostrarAlunosPendentes(false);
        setProfissionaisResponsaveis(nomeUsuario ? [nomeUsuario] : []);
        setRegistroSalvo(false);
        setErroSalvarBanco('');

        const dataAtual = new Date();
        setDia(String(dataAtual.getDate()).padStart(2, '0'));
        setMes(String(dataAtual.getMonth() + 1).padStart(2, '0'));
        setAno(String(dataAtual.getFullYear()));
    };

    // Sempre que a sessão termina (botão Sair, inatividade ou sessão expirada no Supabase),
    // descarta o registro em andamento e volta para a tela inicial
    const aoDeslogarRef = useRef(null);
    useEffect(() => {
        aoDeslogarRef.current = () => {
            reiniciarRegistro();
            setTelaAtivaInterna(TELAS.INICIAL);
        };
    });
    useEffect(() => aoDeslogar(() => aoDeslogarRef.current?.()), [aoDeslogar]);

    // Botão voltar nativo (celular/navegador).
    // Enquanto o usuário está fora da tela inicial, mantemos exatamente UMA entrada extra
    // no histórico. Ao apertar voltar, essa entrada é consumida, o app executa a mesma ação
    // do botão voltar da tela atual e a entrada é recriada. Assim o histórico não cresce
    // e, na tela inicial, o voltar sai do site normalmente.
    const estaNaTelaInicial = telaAtivaInterna === TELAS.INICIAL;
    const temEntradaHistoricoRef = useRef(false);
    const ignorarProximoPopstateRef = useRef(false);
    const voltarNativoRef = useRef(null);
    const estaNaTelaInicialRef = useRef(estaNaTelaInicial);

    // Telas com navegação interna (ex.: Administração) registram aqui o seu botão voltar
    const voltarAdminRef = useRef(null);
    const registrarVoltarAdmin = useCallback((callback) => {
        voltarAdminRef.current = callback;
        return () => {
            if (voltarAdminRef.current === callback) voltarAdminRef.current = null;
        };
    }, []);

    useEffect(() => {
        estaNaTelaInicialRef.current = estaNaTelaInicial;
        voltarNativoRef.current = () => {
            switch (telaAtivaInterna) {
                case TELAS.ETAPAS:
                    if (
                        etapaAtualId === ETAPAS.DATA ||
                        (etapaAtualId === ETAPAS.CONCLUSAO && registroSalvo)
                    ) {
                        reiniciarRegistro();
                        setTelaAtiva(TELAS.INICIAL);
                    } else {
                        // Mesmo comportamento do botão voltar da etapa de turmas
                        if (etapaAtualId === ETAPAS.TURMA) {
                            setTurmaSelecionada([]);
                        }
                        voltarEtapa();
                    }
                    break;
                case TELAS.CADASTRO_MANUAL:
                case TELAS.ADD_ALUNO:
                case TELAS.RESUMO:
                    setTelaAtiva(TELAS.ETAPAS);
                    break;
                case TELAS.ESQUECI_SENHA:
                    setTelaAtiva(TELAS.LOGIN);
                    break;
                case TELAS.ADMIN:
                    // Mesmo comportamento do botão voltar do painel (volta ao painel anterior)
                    if (voltarAdminRef.current) {
                        voltarAdminRef.current();
                    } else {
                        setTelaAtiva(TELAS.INICIAL);
                    }
                    break;
                default:
                    setTelaAtiva(TELAS.INICIAL);
            }
        };
    });

    useEffect(() => {
        const handlePopState = () => {
            if (ignorarProximoPopstateRef.current) {
                ignorarProximoPopstateRef.current = false;
                return;
            }
            temEntradaHistoricoRef.current = false;
            if (estaNaTelaInicialRef.current) return;

            voltarNativoRef.current?.();

            // Recria a entrada extra na hora: algumas ações (ex.: trocar de painel dentro da
            // Administração) não mudam a tela principal. Se a ação levar à tela inicial,
            // o efeito abaixo remove a entrada.
            window.history.pushState({ registroPse: true }, '');
            temEntradaHistoricoRef.current = true;
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (!estaNaTelaInicial && !temEntradaHistoricoRef.current) {
            window.history.pushState({ registroPse: true }, '');
            temEntradaHistoricoRef.current = true;
        } else if (estaNaTelaInicial && temEntradaHistoricoRef.current) {
            // Voltou para a tela inicial pelos botões do app: remove a entrada extra
            temEntradaHistoricoRef.current = false;
            ignorarProximoPopstateRef.current = true;
            window.history.back();
        }
    }, [estaNaTelaInicial]);

    return {
        telaAtiva: telaAtivaInterna,
        setTelaAtiva,
        handleLogout,
        registrarVoltarAdmin,

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
        selecionarEscola,
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
        cadastroManualSomenteTurma,
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
        prepararPresenca,
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
        temSaudeAuditiva,
        mostrarAlunosPendentes,
        setMostrarAlunosPendentes,
        obterAlunosPendentes,
        focarAltura,
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