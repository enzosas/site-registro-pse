import { useState } from 'react';
import { TELAS_GESTAO } from '../../utils/constantes';
import { IconeVoltar } from '../../components/Icones';
import { navegarComFeedback } from '../../utils/delayTouch';
import { PainelGestaoInicial } from './PainelGestaoInicial';
import { PainelRegistros } from './PainelRegistros';
import { PainelDetalhesRegistro } from './PainelDetalhesRegistro';
import { PainelUsuarios } from './PainelUsuarios';
import { PainelEscolaUbs } from './PainelEscolaUbs';
import { PainelCriarUsuario } from './PainelCriarUsuario';
import { PainelDetalhesUsuario } from './PainelDetalhesUsuario';
import { PainelCriarUbs } from './PainelCriarUbs';
import { PainelRemoverUbs } from './PainelRemoverUbs';
import { PainelEditarEscolaUbs } from './PainelEditarEscolaUbs';
import { PainelAtualizarTurmas } from './PainelAtualizarTurmas';

export function TelaGestao({ onVoltar, cardRef, subtelaInicial = TELAS_GESTAO.PAINEL_INICIAL }) {
    const [subtelaAtiva, setSubtelaAtivaInterna] = useState(subtelaInicial);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [registroSelecionado, setRegistroSelecionado] = useState(null);

    const mudarSubtela = (novaSubtela) => {
        navegarComFeedback(() => {
            setSubtelaAtivaInterna(novaSubtela);
        });
    };

    const handleVoltar = () => {
        navegarComFeedback(() => {
            if (subtelaInicial === TELAS_GESTAO.PAINEL_REGISTROS && subtelaAtiva === TELAS_GESTAO.PAINEL_REGISTROS) {
                onVoltar();
                return;
            }
            if (
                subtelaAtiva === TELAS_GESTAO.PAINEL_CRIAR_USUARIO ||
                subtelaAtiva === TELAS_GESTAO.PAINEL_DETALHES_USUARIO
            ) {
                setUsuarioSelecionado(null);
                setSubtelaAtivaInterna(TELAS_GESTAO.PAINEL_USUARIOS);
            } else if (subtelaAtiva === TELAS_GESTAO.PAINEL_DETALHES_REGISTRO) {
                setRegistroSelecionado(null);
                setSubtelaAtivaInterna(TELAS_GESTAO.PAINEL_REGISTROS);
            } else if (
                subtelaAtiva === TELAS_GESTAO.PAINEL_CRIAR_UBS ||
                subtelaAtiva === TELAS_GESTAO.PAINEL_REMOVER_UBS ||
                subtelaAtiva === TELAS_GESTAO.PAINEL_EDITAR_ESCOLAUBS
            ) {
                setSubtelaAtivaInterna(TELAS_GESTAO.PAINEL_ESCOLAUBS);
            } else if (subtelaAtiva !== TELAS_GESTAO.PAINEL_INICIAL) {
                setSubtelaAtivaInterna(TELAS_GESTAO.PAINEL_INICIAL);
            } else {
                onVoltar();
            }
        });
    };

    const renderizarSubtela = () => {
        switch (subtelaAtiva) {
            case TELAS_GESTAO.PAINEL_USUARIOS:
                return (
                    <PainelUsuarios
                        onCriarUsuario={() => mudarSubtela(TELAS_GESTAO.PAINEL_CRIAR_USUARIO)}
                        onSelecionarUsuario={(usuario) => {
                            navegarComFeedback(() => {
                                setUsuarioSelecionado(usuario);
                                setSubtelaAtivaInterna(TELAS_GESTAO.PAINEL_DETALHES_USUARIO);
                            });
                        }}
                    />
                );
            case TELAS_GESTAO.PAINEL_DETALHES_USUARIO:
                return (
                    <PainelDetalhesUsuario
                        usuario={usuarioSelecionado}
                        onVoltar={() => {
                            mudarSubtela(TELAS_GESTAO.PAINEL_USUARIOS);
                            setUsuarioSelecionado(null);
                        }}
                        onSucessoExclusao={() => {
                            mudarSubtela(TELAS_GESTAO.PAINEL_USUARIOS);
                            setUsuarioSelecionado(null);
                        }}
                    />
                );
            case TELAS_GESTAO.PAINEL_CRIAR_USUARIO:
                return (
                    <PainelCriarUsuario
                        onSucesso={() => mudarSubtela(TELAS_GESTAO.PAINEL_USUARIOS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_REGISTROS:
                return (
                    <PainelRegistros
                        onSelecionarRegistro={(registro) => {
                            navegarComFeedback(() => {
                                setRegistroSelecionado(registro);
                                setSubtelaAtivaInterna(TELAS_GESTAO.PAINEL_DETALHES_REGISTRO);
                            });
                        }}
                    />
                );
            case TELAS_GESTAO.PAINEL_DETALHES_REGISTRO:
                return (
                    <PainelDetalhesRegistro
                        registro={registroSelecionado}
                        onVoltar={() => {
                            mudarSubtela(TELAS_GESTAO.PAINEL_REGISTROS);
                            setRegistroSelecionado(null);
                        }}
                    />
                );
            case TELAS_GESTAO.PAINEL_ESCOLAUBS:
                return (
                    <PainelEscolaUbs
                        onAdicionarUbs={() => mudarSubtela(TELAS_GESTAO.PAINEL_CRIAR_UBS)}
                        onRemoverUbs={() => mudarSubtela(TELAS_GESTAO.PAINEL_REMOVER_UBS)}
                        onEditar={() => mudarSubtela(TELAS_GESTAO.PAINEL_EDITAR_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_CRIAR_UBS:
                return (
                    <PainelCriarUbs
                        onSucesso={() => mudarSubtela(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_REMOVER_UBS:
                return (
                    <PainelRemoverUbs
                        onSucesso={() => mudarSubtela(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_EDITAR_ESCOLAUBS:
                return (
                    <PainelEditarEscolaUbs
                        onSucesso={() => mudarSubtela(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                    />
                );
            case TELAS_GESTAO.PAINEL_ATUALIZAR_TURMAS:
                return (
                    <PainelAtualizarTurmas
                        onSucesso={() => mudarSubtela(TELAS_GESTAO.PAINEL_INICIAL)}
                        onVoltar={() => mudarSubtela(TELAS_GESTAO.PAINEL_INICIAL)}
                    />
                );
            case TELAS_GESTAO.PAINEL_INICIAL:
            default:
                return (
                    <PainelGestaoInicial
                        onNavegar={(subtela) => mudarSubtela(subtela)}
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