import { createContext, useContext } from 'react';
import { useRegistroPSE } from '../hooks/useRegistroPSE';

const RegistroPSEContext = createContext(null);

export function RegistroPSEProvider({ children }) {
    const registro = useRegistroPSE();
    return (
        <RegistroPSEContext.Provider value={registro}>
            {children}
        </RegistroPSEContext.Provider>
    );
}

export function useRegistro() {
    const context = useContext(RegistroPSEContext);
    if (!context) {
        throw new Error('useRegistro deve ser usado dentro de um RegistroPSEProvider');
    }
    return context;
}