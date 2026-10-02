import { useState } from 'react';
import { useRegistro } from '../../context/RegistroPSEContext';
import { TELAS_ADMIN } from '../../constantes';
import { IconeVoltar } from '../../components/Icones';
import { PainelAdminInicial } from './PainelAdminInicial';
import { PainelRegistros } from './PainelRegistros';
import { PainelUsuarios } from './PainelUsuarios';
import { PainelEscolaUbs } from './PainelEscolaUbs';
import { PainelCriarUsuario } from './PainelCriarUsuario';
import { PainelDetalhesUsuario } from './PainelDetalhesUsuario';
import { PainelCriarUbs } from './PainelCriarUbs';
import { PainelRemoverUbs } from './PainelRemoverUbs';
import { PainelEditarEscolaUbs } from './PainelEditarEscolaUbs';

export function TelaAdmin({ onVoltar, cardRef }) {
    const {
        tipoUsuario,
        nomeUsuario,
        usuarioId,
        escolaIdUsuario,
        ubsIdUsuario,
    } = useRegistro();

    const [subtelaAtiva, setSubtelaAtiva] = useState(TELAS_ADMIN.PAINEL_INICIAL);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

    const handleVoltar = () => {
        if (
            subtelaAtiva === TELAS_ADMIN.PAINEL_CRIAR_USUARIO ||
            subtelaAtiva === TELAS_ADMIN.PAINEL_DETALHES_USUARIO
        ) {
            setUsuarioSelecionado(null);
            setSubtelaAtiva(TELAS_ADMIN.PAINEL_USUARIOS);
        } else if (
            subtelaAtiva === TELAS_ADMIN.PAINEL_CRIAR_UBS ||
            subtelaAtiva === TELAS_ADMIN.PAINEL_REMOVER_UBS ||
            subtelaAtiva === TELAS_ADMIN.PAINEL_EDITAR_ESCOLAUBS
        ) {
            setSubtelaAtiva(TELAS_ADMIN.PAINEL_ESCOLAUBS);
        } else if (subtelaAtiva !== TELAS_ADMIN.PAINEL_INICIAL) {
            setSubtelaAtiva(TELAS_ADMIN.PAINEL_INICIAL);
        } else {
            onVoltar();
        }
    };

    const renderizarSubtela = () => {
        switch (subtelaAtiva) {
            case TELAS_ADMIN.PAINEL_USUARIOS:
                return (
                    <PainelUsuarios
                        tipoUsuario={tipoUsuario}
                        escolaId={escolaIdUsuario}
                        ubsId={ubsIdUsuario}
                        onCriarUsuario={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_CRIAR_USUARIO)}
                        onSelecionarUsuario={(usuario) => {
                            setUsuarioSelecionado(usuario);
                            setSubtelaAtiva(TELAS_ADMIN.PAINEL_DETALHES_USUARIO);
                        }}
                    />
                );
            case TELAS_ADMIN.PAINEL_DETALHES_USUARIO:
                return (
                    <PainelDetalhesUsuario
                        usuario={usuarioSelecionado}
                        usuarioLogadoId={usuarioId}
                        onVoltar={() => {
                            setUsuarioSelecionado(null);
                            setSubtelaAtiva(TELAS_ADMIN.PAINEL_USUARIOS);
                        }}
                        onSucessoExclusao={() => {
                            setUsuarioSelecionado(null);
                            setSubtelaAtiva(TELAS_ADMIN.PAINEL_USUARIOS);
                        }}
                    />
                );
            case TELAS_ADMIN.PAINEL_CRIAR_USUARIO:
                return (
                    <PainelCriarUsuario
                        tipoUsuarioLogado={tipoUsuario}
                        escolaIdLogado={escolaIdUsuario}
                        ubsIdLogado={ubsIdUsuario}
                        onSucesso={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_USUARIOS)}
                    />
                );
            case TELAS_ADMIN.PAINEL_REGISTROS:
                return (
                    <PainelRegistros
                        tipoUsuario={tipoUsuario}
                    />
                );
            case TELAS_ADMIN.PAINEL_ESCOLAUBS:
                return (
                    <PainelEscolaUbs
                        tipoUsuario={tipoUsuario}
                        onAdicionarUbs={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_CRIAR_UBS)}
                        onRemoverUbs={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_REMOVER_UBS)}
                        onEditar={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_EDITAR_ESCOLAUBS)}
                    />
                );
            case TELAS_ADMIN.PAINEL_CRIAR_UBS:
                return (
                    <PainelCriarUbs
                        onSucesso={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_ADMIN.PAINEL_REMOVER_UBS:
                return (
                    <PainelRemoverUbs
                        onSucesso={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_ADMIN.PAINEL_EDITAR_ESCOLAUBS:
                return (
                    <PainelEditarEscolaUbs
                        onSucesso={() => setSubtelaAtiva(TELAS_ADMIN.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_ADMIN.PAINEL_INICIAL:
            default:
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