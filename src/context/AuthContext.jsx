import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { autenticarUsuario, deslogarUsuario } from '../services/supabaseService';

// O link do e-mail de recuperação abre o site com os dados na parte "#..." da URL.
// Lemos isso uma única vez, ao carregar o módulo, antes de o Supabase limpar a URL.
const paramsDaUrl = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
);
const ABRIU_LINK_RECUPERACAO =
    paramsDaUrl.get('type') === 'recovery' && Boolean(paramsDaUrl.get('access_token'));
const CHAVE_RECUPERANDO = 'recuperando-senha';

function lerRecuperacaoSalva() {
    try {
        return sessionStorage.getItem(CHAVE_RECUPERANDO) === '1';
    } catch {
        return false;
    }
}

const ABRIU_LINK_INVALIDO =
    !ABRIU_LINK_RECUPERACAO &&
    (paramsDaUrl.get('error_code') === 'otp_expired' || paramsDaUrl.get('error') === 'access_denied');

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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usuarioId, setUsuarioId] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [escolaIdUsuario, setEscolaIdUsuario] = useState(null);
    const [ubsIdUsuario, setUbsIdUsuario] = useState(null);
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemInfo, setMensagemInfo] = useState('');

    // Recuperação de senha
    // Se a página for recarregada no meio da troca de senha, continua na tela "Nova senha"
    // (o link do e-mail é de uso único e já foi consumido, então não dá para abri-lo de novo)
    const [recuperandoSenha, setRecuperandoSenha] = useState(
        () => ABRIU_LINK_RECUPERACAO || lerRecuperacaoSalva()
    );
    const [linkRecuperacaoInvalido, setLinkRecuperacaoInvalido] = useState(
        ABRIU_LINK_INVALIDO && !VERIFICAR_SESSAO_AO_ABRIR
    );
    const [verificandoLink, setVerificandoLink] = useState(VERIFICAR_SESSAO_AO_ABRIR);

    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange((evento) => {
            if (evento === 'PASSWORD_RECOVERY') {
                setRecuperandoSenha(true);
            }
        });
        return () => data.subscription.unsubscribe();
    }, []);

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

    // Se voltou à tela só pelo aviso salvo, confirma que ainda existe uma sessão de recuperação válida
    useEffect(() => {
        if (ABRIU_LINK_RECUPERACAO || !lerRecuperacaoSalva()) return;
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                setRecuperandoSenha(false);
            }
        });
    }, []);

    // Abriu um link que já foi usado: se a troca de senha ainda está em andamento neste
    // navegador (a sessão do primeiro clique continua válida), retoma de onde parou
    useEffect(() => {
        if (!VERIFICAR_SESSAO_AO_ABRIR) return undefined;
        let ativo = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!ativo) return;
            if (data.session) {
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

    const login = async (email, password) => {
        setMensagemErro('');
        setMensagemInfo('');
        const resultado = await autenticarUsuario(email, password);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro);
            return false;
        }

        limparRecuperacaoPendente();
        setUsuarioId(resultado.id || '');
        setNomeUsuario(resultado.nome || '');
        setTipoUsuario(resultado.tipoUsuario || '');
        setEscolaIdUsuario(resultado.escolaId || null);
        setUbsIdUsuario(resultado.ubsId || null);
        setIsLoggedIn(true);
        setMensagemErro('');
        return true;
    };

    const logout = async () => {
        await deslogarUsuario();
        setIsLoggedIn(false);
        setUsuarioId('');
        setNomeUsuario('');
        setTipoUsuario('');
        setEscolaIdUsuario(null);
        setUbsIdUsuario(null);
        setMensagemErro('');
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
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
                verificandoLink,
                setLinkRecuperacaoInvalido,
                finalizarRecuperacao,
                cancelarRecuperacao,
                recuperacaoExpirada,
                login,
                logout,
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