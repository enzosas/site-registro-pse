import { useState } from 'react';
import { deletarUsuarioDB } from '../../services/supabaseService';
import { formatarTipoUsuario } from '../../constantes'
import { formatarNome } from '../../utils/formatadores'

export function PainelDetalhesUsuario({
    usuario,
    usuarioLogadoId = null,
    onVoltar,
    onSucessoExclusao
}) {
    const [deletando, setDeletando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    if (!usuario) {
        return null;
    }

    const isProprioUsuario = usuarioLogadoId && usuario.id === usuarioLogadoId;

    const handleDeletar = async () => {
        if (isProprioUsuario) {
            setMensagemErro('Você não pode excluir a sua própria conta.');
            return;
        }

        const confirmou = window.confirm(
            `Tem certeza de que deseja excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`
        );

        if (!confirmou) return;

        setMensagemErro('');
        setDeletando(true);

        const resultado = await deletarUsuarioDB(usuario.id);

        setDeletando(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro || 'Falha ao excluir o usuário.');
            return;
        }

        alert('Usuário excluído com sucesso!');
        if (onSucessoExclusao) {
            onSucessoExclusao();
        }
    };

    return (
        <>
            <p className="app__title">Detalhes do Usuário</p>

            {mensagemErro && (
                <div className="app__alerta-erro">
                    <p>{mensagemErro}</p>
                </div>
            )}

            <div className='admin__detalhes_usuario__frame'>
                <div>
                    <p className='admin__detalhes_usuario__label'>Nome</p>
                    <p className='admin__detalhes_usuario__value'>{usuario.nome}</p>
                </div>

                <div>
                    <p className='admin__detalhes_usuario__label'>E-mail</p>
                    <p className='admin__detalhes_usuario__value'>{usuario.email}</p>
                </div>

                <div>
                    <p className='admin__detalhes_usuario__label'>Tipo de usuário</p>
                    <p className='admin__detalhes_usuario__value'>{formatarTipoUsuario(usuario.tipoUsuario)}</p>
                </div>

                {usuario.escolaNome && (
                    <div>
                        <p className='admin__detalhes_usuario__label'>Escola vinculada</p>
                        <p className='admin__detalhes_usuario__value'>{formatarNome(usuario.escolaNome)}</p>
                    </div>
                )}

                {usuario.ubsNome && (
                    <div>
                        <p className='admin__detalhes_usuario__label'>UBS vinculada</p>
                        <p className='admin__detalhes_usuario__value'>{usuario.ubsNome}</p>
                    </div>
                )}
            </div>

            <div className="app__footer">

                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={handleDeletar}
                    disabled={deletando || isProprioUsuario}
                >
                    <p>{deletando ? 'Excluindo...' : 'Excluir Usuário'}</p>
                </button>
            </div>
        </>
    );
}