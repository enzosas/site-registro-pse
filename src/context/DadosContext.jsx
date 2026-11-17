import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { carregarEscolasDB, carregarUbsDB } from '../services/supabaseService';
import { useAuth } from './AuthContext';

const DadosContext = createContext(null);

export function DadosProvider({ children }) {
    const { isLoggedIn, aoDeslogar } = useAuth();
    const [escolas, setEscolas] = useState([]);
    const [listaUbs, setListaUbs] = useState([]);
    const [carregandoDados, setCarregandoDados] = useState(false);
    // Explicação do erro ao carregar escolas/UBS (null = sem erro)
    const [erroDados, setErroDados] = useState(null);

    const recarregarEscolas = useCallback(async () => {
        try {
            const dados = await carregarEscolasDB();
            setEscolas(dados || []);
            setErroDados(null);
        } catch (err) {
            console.error('Erro ao recarregar escolas:', err);
            setErroDados(err.explicacao || null);
        }
    }, []);

    const recarregarUbs = useCallback(async () => {
        try {
            const dados = await carregarUbsDB();
            setListaUbs(dados || []);
            setErroDados(null);
        } catch (err) {
            console.error('Erro ao recarregar UBSs:', err);
            setErroDados(err.explicacao || null);
        }
    }, []);

    const recarregarTodosDados = useCallback(async () => {
        setCarregandoDados(true);
        try {
            const [escolasCarregadas, ubsCarregadas] = await Promise.all([
                carregarEscolasDB(),
                carregarUbsDB(),
            ]);
            setEscolas(escolasCarregadas || []);
            setListaUbs(ubsCarregadas || []);
            setErroDados(null);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setErroDados(err.explicacao || null);
        } finally {
            setCarregandoDados(false);
        }
    }, []);

    // Escolas, turmas e alunos só são carregados com o usuário logado
    // (o banco não libera esses dados para quem não está logado)
    useEffect(() => {
        if (!isLoggedIn) return;
        const carregar = async () => {
            await recarregarTodosDados();
        };
        carregar();
    }, [isLoggedIn, recarregarTodosDados]);

    // Ao sair (botão Sair, inatividade ou sessão expirada), descarta os dados da memória
    useEffect(
        () =>
            aoDeslogar(() => {
                setEscolas([]);
                setListaUbs([]);
                setErroDados(null);
            }),
        [aoDeslogar]
    );

    return (
        <DadosContext.Provider
            value={{
                escolas,
                listaUbs,
                carregandoDados,
                erroDados,
                recarregarEscolas,
                recarregarUbs,
                recarregarTodosDados,
            }}
        >
            {children}
        </DadosContext.Provider>
    );
}

export function useDados() {
    const context = useContext(DadosContext);
    if (!context) {
        throw new Error('useDados deve ser utilizado dentro de um DadosProvider');
    }
    return context;
}
