import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    autenticarUsuario,
    deslogarUsuario,
    restaurarSessaoUsuario,
    observarFimDaSessao,
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

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [restaurandoSessao, setRestaurandoSessao] = useState(true);
    const [usuarioId, setUsuarioId] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [escolaIdUsuario, setEscolaIdUsuario] = useState(null);
    const [ubsIdUsuario, setUbsIdUsuario] = useState(null);
    const [mensagemErro, setMensagemErro] = useState(null); // explicação do erro de login (cartão)

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
        const resultado = await autenticarUsuario(email, password);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.explicacao || null);
            return false;
        }

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
