import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { carregarEscolasDB, carregarUbsDB } from '../services/supabaseService';

const DadosContext = createContext(null);

export function DadosProvider({ children }) {
    const [escolas, setEscolas] = useState([]);
    const [listaUbs, setListaUbs] = useState([]);
    const [carregandoDados, setCarregandoDados] = useState(false);

    const recarregarEscolas = useCallback(async () => {
        try {
            const dados = await carregarEscolasDB();
            setEscolas(dados || []);
        } catch (err) {
            console.error('Erro ao recarregar escolas:', err);
        }
    }, []);

    const recarregarUbs = useCallback(async () => {
        try {
            const dados = await carregarUbsDB();
            setListaUbs(dados || []);
        } catch (err) {
            console.error('Erro ao recarregar UBSs:', err);
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
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setCarregandoDados(false);
        }
    }, []);

    useEffect(() => {
        recarregarTodosDados();
    }, [recarregarTodosDados]);

    return (
        <DadosContext.Provider
            value={{
                escolas,
                listaUbs,
                carregandoDados,
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