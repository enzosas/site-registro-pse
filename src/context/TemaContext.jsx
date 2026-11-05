import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CHAVE_STORAGE = 'tema-preferido';
const COR_BARRA_NAVEGADOR = { claro: '#f2f2f2', escuro: '#141414' };

const TemaContext = createContext(null);

function lerPreferenciaSalva() {
    try {
        const valor = localStorage.getItem(CHAVE_STORAGE);
        return valor === 'claro' || valor === 'escuro' ? valor : null;
    } catch {
        return null; // sem acesso ao armazenamento (ex.: modo privado restrito)
    }
}

function lerTemaDoSistema() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export function TemaProvider({ children }) {
    // preferencia: o que a pessoa escolheu (null = ainda segue o tema do aparelho)
    const [preferencia, setPreferencia] = useState(lerPreferenciaSalva);
    const [temaSistema, setTemaSistema] = useState(lerTemaDoSistema);

    const tema = preferencia ?? temaSistema;

    // Acompanha mudanças do tema do aparelho (enquanto a pessoa não escolheu um)
    useEffect(() => {
        const consulta = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (!consulta) return undefined;
        const aoMudar = (e) => setTemaSistema(e.matches ? 'escuro' : 'claro');
        consulta.addEventListener('change', aoMudar);
        return () => consulta.removeEventListener('change', aoMudar);
    }, []);

    // Aplica o tema na página e na barra do navegador do celular
    useEffect(() => {
        document.documentElement.setAttribute('data-tema', tema);
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', COR_BARRA_NAVEGADOR[tema]);
    }, [tema]);

    const alternarTema = useCallback(() => {
        const novo = tema === 'escuro' ? 'claro' : 'escuro';
        setPreferencia(novo);
        try {
            localStorage.setItem(CHAVE_STORAGE, novo);
        } catch {
            // se não der para salvar, o tema vale só nesta sessão
        }
    }, [tema]);

    return (
        <TemaContext.Provider value={{ tema, alternarTema }}>
            {children}
        </TemaContext.Provider>
    );
}

export function useTema() {
    const context = useContext(TemaContext);
    if (!context) {
        throw new Error('useTema deve ser utilizado dentro de um TemaProvider');
    }
    return context;
}
