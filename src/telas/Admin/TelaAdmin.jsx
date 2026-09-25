// src/telas/admin/TelaAdmin.jsx
import { useState } from 'react';
import { TELAS_ADMIN } from '../../constantes';
import { IconeVoltar } from '../../components/Icones';
import { PainelAdminInicial } from './PainelAdminInicial';

export function TelaAdmin({ onVoltar, tipoUsuario, cardRef, nomeUsuario }) {

    const [subtelaAtiva, setSubtelaAtiva] = useState(TELAS_ADMIN.PAINEL_INICIAL);

    const handleVoltar = () => {
        if (subtelaAtiva !== TELAS_ADMIN.PAINEL_INICIAL) {
            setSubtelaAtiva(TELAS_ADMIN.PAINEL_INICIAL);
        } else {
            onVoltar();
        }
    };

    const renderizarSubtela = () => {
        switch (subtelaAtiva) {
            default:
            case TELAS_ADMIN.PAINEL_INICIAL:
                return (
                    <PainelAdminInicial
                        tipoUsuario={tipoUsuario}
                        nomeUsuario={nomeUsuario}
                        onNavegar={(subtela) => setSubtelaAtiva(subtela)}
                    />
                );
        }
    };

    return (
        <div className="app__card" ref={cardRef}>
            <button type="button" className="app__botao-voltar" onClick={handleVoltar}>
                <IconeVoltar />
            </button>
            {renderizarSubtela()}
        </div>
    );
}