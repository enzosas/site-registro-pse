import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    autenticarUsuario,
    deslogarUsuario,
    restaurarSessaoUsuario,
    observarFimDaSessao,
    observarRecuperacaoSenha,
    existeSessaoSalva,
} from '../services/supabaseService';

const AuthContext = createContext(null);

// Tempo sem nenhuma interação (toque, clique, digitação, rolagem) até o logout automático
const TEMPO_LIMITE_INATIVIDADE_MS = 30 * 60 * 1000;
const CHAVE_ULTIMA_ATIVIDADE = 'registroPse:ultimaAtividade';
const EVENTOS_DE_ATIVIDADE = ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'];

// A última atividade fica no localStorage (vale entre abas e após fechar o site)
// e também em memória, caso o navegador bloqueie o localStorage
let ultimaAtividadeEmMemoria = 0;

function lerUltimaAtividade() {
    let salva = 0;
    try {
        salva = Number(localStorage.getItem(CHAVE_ULTIMA_ATIVIDADE)) || 0;
    } catch {
        // localStorage indisponível: usa só o valor em memória
    }
    return Math.max(salva, ultimaAtividadeEmMemoria);
}

function registrarUltimaAtividade(momento = Date.now()) {
    ultimaAtividadeEmMemoria = momento;
    try {
        localStorage.setItem(CHAVE_ULTIMA_ATIVIDADE, String(momento));
    } catch {
        // localStorage indisponível: mantém só em memória
    }
}

function limparUltimaAtividade() {
    ultimaAtividadeEmMemoria = 0;
    try {
        localStorage.removeItem(CHAVE_ULTIMA_ATIVIDADE);
    } catch {
        // nada a fazer
    }
}

function sessaoExpirouPorInatividade() {
    return Date.now() - lerUltimaAtividade() > TEMPO_LIMITE_INATIVIDADE_MS;
}

// ---------------------------------------------------------------------------
// Recuperação de senha
// O link do e-mail abre o site com os dados na parte "#..." da URL. Lemos isso uma única
// vez, ao carregar o módulo, antes de o Supabase limpar a URL.
// ---------------------------------------------------------------------------
const paramsDaUrl = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
);
const ABRIU_LINK_RECUPERACAO =
    paramsDaUrl.get('type') === 'recovery' && Boolean(paramsDaUrl.get('access_token'));
const ABRIU_LINK_INVALIDO =
    !ABRIU_LINK_RECUPERACAO &&
    (paramsDaUrl.get('error_code') === 'otp_expired' || paramsDaUrl.get('error') === 'access_denied');

// Aba que está trocando a senha (sobrevive a recarregar a página)
const CHAVE_RECUPERANDO = 'recuperando-senha';

function lerRecuperacaoSalva() {
    try {
        return sessionStorage.getItem(CHAVE_RECUPERANDO) === '1';
    } catch {
        return false;
    }
}

// O link do e-mail só funciona uma vez. Para quem abre o mesmo link de novo (outra aba, atalho,
// histórico) e ainda tem a troca de senha em andamento neste navegador, guardamos um marcador
// com validade. Assim dá para continuar em vez de exigir um novo e-mail.
const CHAVE_PENDENTE = 'recuperacao-pendente-ate';
const VALIDADE_PENDENTE_MS = 55 * 60 * 1000; // o link do Supabase vale 1 hora

function haRecuperacaoPendente() {
    try {
        return Number(localStorage.getItem(CHAVE_PENDENTE)) > Date.now();
    } catch {
        return false;
    }
}

function marcarRecuperacaoPendente() {
    try {
        // não renova: a janela conta a partir da primeira abertura do link
        if (!haRecuperacaoPendente()) {
            localStorage.setItem(CHAVE_PENDENTE, String(Date.now() + VALIDADE_PENDENTE_MS));
        }
    } catch {
        // sem acesso ao armazenamento: segue sem o marcador
    }
}

function limparRecuperacaoPendente() {
    try {
        localStorage.removeItem(CHAVE_PENDENTE);
    } catch {
        // sem acesso ao armazenamento: nada a limpar
    }
}

const VERIFICAR_SESSAO_AO_ABRIR = ABRIU_LINK_INVALIDO && haRecuperacaoPendente();

// A sessão criada pelo link de recuperação NÃO pode ser tratada como um login: senão quem
// clicasse no link entraria no app sem senha (ou a verificação de inatividade a encerraria
// antes da troca). Por isso, enquanto a troca está em andamento, não restauramos a sessão.
const TROCANDO_SENHA_AO_ABRIR =
    ABRIU_LINK_RECUPERACAO || VERIFICAR_SESSAO_AO_ABRIR || lerRecuperacaoSalva();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [restaurandoSessao, setRestaurandoSessao] = useState(true);
    const [usuarioId, setUsuarioId] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [escolaIdUsuario, setEscolaIdUsuario] = useState(null);
    const [ubsIdUsuario, setUbsIdUsuario] = useState(null);
    const [mensagemErro, setMensagemErro] = useState(null); // explicação do erro de login (cartão)
    const [mensagemInfo, setMensagemInfo] = useState(''); // aviso de sucesso (ex.: senha redefinida)

    // Se a página for recarregada no meio da troca de senha, continua na tela "Nova senha"
    // (o link do e-mail é de uso único e já foi consumido, então não dá para abri-lo de novo)
    const [recuperandoSenha, setRecuperandoSenha] = useState(
        () => ABRIU_LINK_RECUPERACAO || lerRecuperacaoSalva()
    );
    const [linkRecuperacaoInvalido, setLinkRecuperacaoInvalido] = useState(
        ABRIU_LINK_INVALIDO && !VERIFICAR_SESSAO_AO_ABRIR
    );
    const [verificandoLink, setVerificandoLink] = useState(VERIFICAR_SESSAO_AO_ABRIR);

    // Funções avisadas quando o usuário sai (para limpar o registro em andamento)
    const ouvintesDeLogoutRef = useRef(new Set());
    const encerrandoPorInatividadeRef = useRef(false);

    const aoDeslogar = useCallback((callback) => {
        const ouvintes = ouvintesDeLogoutRef.current;
        ouvintes.add(callback);
        return () => ouvintes.delete(callback);
    }, []);

    const aplicarUsuario = useCallback((dados) => {
        setUsuarioId(dados.id || '');
        setNomeUsuario(dados.nome || '');
        setTipoUsuario(dados.tipoUsuario || '');
        setEscolaIdUsuario(dados.escolaId || null);
        setUbsIdUsuario(dados.ubsId || null);
        setIsLoggedIn(true);
    }, []);

    const limparUsuario = useCallback(() => {
        setIsLoggedIn(false);
        setUsuarioId('');
        setNomeUsuario('');
        setTipoUsuario('');
        setEscolaIdUsuario(null);
        setUbsIdUsuario(null);
        ouvintesDeLogoutRef.current.forEach((callback) => callback());
    }, []);

    const login = async (email, password) => {
        setMensagemErro(null);
        setMensagemInfo('');
        const resultado = await autenticarUsuario(email, password);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.explicacao || null);
            return false;
        }

        limparRecuperacaoPendente();
        registrarUltimaAtividade();
        aplicarUsuario(resultado);
        setMensagemErro(null);
        return true;
    };

    const logout = async () => {
        limparUltimaAtividade();
        await deslogarUsuario();
        limparUsuario();
        setMensagemErro(null);
    };

    // Ao abrir/recarregar o site: restaura a sessão salva, se ainda estiver dentro do prazo
    useEffect(() => {
        let ativo = true;

        async function restaurar() {
            // Troca de senha em andamento: a sessão do link não é um login
            if (false) {
                setRestaurandoSessao(false);
                return;
            }

            const resultado = await restaurarSessaoUsuario();
            if (!ativo) return;

            if (resultado.sucesso) {
                if (sessaoExpirouPorInatividade()) {
                    limparUltimaAtividade();
                    await deslogarUsuario();
                } else {
                    registrarUltimaAtividade();
                    aplicarUsuario(resultado);
                }
            }
            if (ativo) setRestaurandoSessao(false);
        }

        restaurar();
        const pararDeObservar = observarFimDaSessao(limparUsuario);

        return () => {
            ativo = false;
            pararDeObservar();
        };
    }, [aplicarUsuario, limparUsuario]);

    // --- Recuperação de senha ---------------------------------------------------------

    // Segunda via de detecção do link (a leitura da URL, no topo do arquivo, é a principal)
    useEffect(() => observarRecuperacaoSenha(() => setRecuperandoSenha(true)), []);

    // Guarda "esta aba está trocando a senha" e o marcador com validade
    useEffect(() => {
        try {
            if (recuperandoSenha) {
                sessionStorage.setItem(CHAVE_RECUPERANDO, '1');
                marcarRecuperacaoPendente();
            } else {
                sessionStorage.removeItem(CHAVE_RECUPERANDO);
            }
        } catch {
            // sem acesso ao armazenamento: o aviso só vale até recarregar a página
        }
    }, [recuperandoSenha]);

    // Voltou à tela só pelo aviso salvo (recarregou a página): confirma que a sessão ainda existe
    useEffect(() => {
        if (ABRIU_LINK_RECUPERACAO || !lerRecuperacaoSalva()) return;
        existeSessaoSalva().then((existe) => {
            if (!existe) setRecuperandoSenha(false);
        });
    }, []);

    // Abriu um link que já foi usado: se a troca de senha ainda está em andamento neste
    // navegador (a sessão do primeiro clique continua válida), retoma de onde parou
    useEffect(() => {
        if (!VERIFICAR_SESSAO_AO_ABRIR) return undefined;
        let ativo = true;
        existeSessaoSalva().then((existe) => {
            if (!ativo) return;
            if (existe) {
                setRecuperandoSenha(true);
            } else {
                limparRecuperacaoPendente();
                setLinkRecuperacaoInvalido(true);
            }
            setVerificandoLink(false);
        });
        return () => {
            ativo = false;
        };
    }, []);

    // Limpa dados sensíveis do endereço (tokens ou mensagem de erro do link)
    useEffect(() => {
        if (ABRIU_LINK_RECUPERACAO || ABRIU_LINK_INVALIDO) {
            const limpo = window.location.pathname + window.location.search;
            window.history.replaceState(window.history.state, '', limpo);
        }
    }, []);

    const finalizarRecuperacao = (mensagem = '') => {
        limparRecuperacaoPendente();
        setRecuperandoSenha(false);
        setLinkRecuperacaoInvalido(false);
        setMensagemInfo(mensagem);
    };

    // A sessão do link não vale mais: encerra e pede para solicitar um novo link
    const recuperacaoExpirada = async () => {
        limparRecuperacaoPendente();
        await deslogarUsuario();
        setRecuperandoSenha(false);
        setLinkRecuperacaoInvalido(true);
        setMensagemInfo('');
    };

    const cancelarRecuperacao = async () => {
        await deslogarUsuario();
        finalizarRecuperacao('');
    };

    // Logout automático após TEMPO_LIMITE_INATIVIDADE_MS sem interação
    useEffect(() => {
        if (!isLoggedIn) return;
        encerrandoPorInatividadeRef.current = false;

        const encerrarPorInatividade = async () => {
            if (encerrandoPorInatividadeRef.current) return;
            encerrandoPorInatividadeRef.current = true;
            limparUltimaAtividade();
            limparUsuario();
            await deslogarUsuario();
            window.alert(
                'Sua sessão foi encerrada após 30 minutos sem atividade. Entre novamente para continuar.'
            );
        };

        const verificar = () => {
            if (sessaoExpirouPorInatividade()) {
                encerrarPorInatividade();
                return true;
            }
            return false;
        };

        let ultimaGravacao = 0;
        const aoInteragir = () => {
            // Ao voltar depois de muito tempo, o primeiro toque não pode renovar a sessão
            if (verificar()) return;
            const agora = Date.now();
            if (agora - ultimaGravacao > 10 * 1000) {
                ultimaGravacao = agora;
                registrarUltimaAtividade(agora);
            }
        };

        const aoMudarVisibilidade = () => {
            if (document.visibilityState === 'visible') verificar();
        };

        EVENTOS_DE_ATIVIDADE.forEach((evento) =>
            window.addEventListener(evento, aoInteragir, { passive: true, capture: true })
        );
        document.addEventListener('visibilitychange', aoMudarVisibilidade);
        const intervalo = setInterval(verificar, 30 * 1000);

        return () => {
            EVENTOS_DE_ATIVIDADE.forEach((evento) =>
                window.removeEventListener(evento, aoInteragir, { capture: true })
            );
            document.removeEventListener('visibilitychange', aoMudarVisibilidade);
            clearInterval(intervalo);
        };
    }, [isLoggedIn, limparUsuario]);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                restaurandoSessao,
                usuarioId,
                nomeUsuario,
                tipoUsuario,
                escolaIdUsuario,
                ubsIdUsuario,
                mensagemErro,
                setMensagemErro,
                mensagemInfo,
                setMensagemInfo,
                recuperandoSenha,
                linkRecuperacaoInvalido,
                setLinkRecuperacaoInvalido,
                verificandoLink,
                finalizarRecuperacao,
                cancelarRecuperacao,
                recuperacaoExpirada,
                login,
                logout,
                aoDeslogar,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
    }
    return context;
}
