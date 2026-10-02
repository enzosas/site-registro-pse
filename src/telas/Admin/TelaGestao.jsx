import { useState } from 'react';
import { TELAS_GESTAO } from '../../utils/constantes';
import { IconeVoltar } from '../../components/Icones';
import { PainelGestaoInicial } from './PainelGestaoInicial';
import { PainelRegistros } from './PainelRegistros';
import { PainelUsuarios } from './PainelUsuarios';
import { PainelEscolaUbs } from './PainelEscolaUbs';
import { PainelCriarUsuario } from './PainelCriarUsuario';
import { PainelDetalhesUsuario } from './PainelDetalhesUsuario';
import { PainelCriarUbs } from './PainelCriarUbs';
import { PainelRemoverUbs } from './PainelRemoverUbs';
import { PainelEditarEscolaUbs } from './PainelEditarEscolaUbs';

export function TelaGestao({ onVoltar, cardRef }) {
    const [subtelaAtiva, setSubtelaAtiva] = useState(TELAS_GESTAO.PAINEL_INICIAL);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

    const handleVoltar = () => {
        if (
            subtelaAtiva === TELAS_GESTAO.PAINEL_CRIAR_USUARIO ||
            subtelaAtiva === TELAS_GESTAO.PAINEL_DETALHES_USUARIO
        ) {
            setUsuarioSelecionado(null);
            setSubtelaAtiva(TELAS_GESTAO.PAINEL_USUARIOS);
        } else if (
            subtelaAtiva === TELAS_GESTAO.PAINEL_CRIAR_UBS ||
            subtelaAtiva === TELAS_GESTAO.PAINEL_REMOVER_UBS ||
            subtelaAtiva === TELAS_GESTAO.PAINEL_EDITAR_ESCOLAUBS
        ) {
            setSubtelaAtiva(TELAS_GESTAO.PAINEL_ESCOLAUBS);
        } else if (subtelaAtiva !== TELAS_GESTAO.PAINEL_INICIAL) {
            setSubtelaAtiva(TELAS_GESTAO.PAINEL_INICIAL);
        } else {
            onVoltar();
        }
    };

    const renderizarSubtela = () => {
        switch (subtelaAtiva) {
            case TELAS_GESTAO.PAINEL_USUARIOS:
                return (
                    <PainelUsuarios
                        onCriarUsuario={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_CRIAR_USUARIO)}
                        onSelecionarUsuario={(usuario) => {
                            setUsuarioSelecionado(usuario);
                            setSubtelaAtiva(TELAS_GESTAO.PAINEL_DETALHES_USUARIO);
                        }}
                    />
                );
            case TELAS_GESTAO.PAINEL_DETALHES_USUARIO:
                return (
                    <PainelDetalhesUsuario
                        usuario={usuarioSelecionado}
                        onVoltar={() => {
                            setUsuarioSelecionado(null);
                            setSubtelaAtiva(TELAS_GESTAO.PAINEL_USUARIOS);
                        }}
                        onSucessoExclusao={() => {
                            setUsuarioSelecionado(null);
                            setSubtelaAtiva(TELAS_GESTAO.PAINEL_USUARIOS);
                        }}
                    />
                );
            case TELAS_GESTAO.PAINEL_CRIAR_USUARIO:
                return (
                    <PainelCriarUsuario
                        onSucesso={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_USUARIOS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_REGISTROS:
                return <PainelRegistros />;
            case TELAS_GESTAO.PAINEL_ESCOLAUBS:
                return (
                    <PainelEscolaUbs
                        onAdicionarUbs={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_CRIAR_UBS)}
                        onRemoverUbs={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_REMOVER_UBS)}
                        onEditar={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_EDITAR_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_CRIAR_UBS:
                return (
                    <PainelCriarUbs
                        onSucesso={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_REMOVER_UBS:
                return (
                    <PainelRemoverUbs
                        onSucesso={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_EDITAR_ESCOLAUBS:
                return (
                    <PainelEditarEscolaUbs
                        onSucesso={() => setSubtelaAtiva(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_INICIAL:
            default:
                return (
                    <PainelGestaoInicial
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