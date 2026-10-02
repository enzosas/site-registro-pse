import { createContext, useContext, useState } from 'react';
import { autenticarUsuario, deslogarUsuario } from '../services/supabaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usuarioId, setUsuarioId] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [escolaIdUsuario, setEscolaIdUsuario] = useState(null);
    const [ubsIdUsuario, setUbsIdUsuario] = useState(null);
    const [mensagemErro, setMensagemErro] = useState('');

    const login = async (email, password) => {
        setMensagemErro('');
        const resultado = await autenticarUsuario(email, password);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro);
            return false;
        }

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