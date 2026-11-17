import { useState } from 'react';
import { deletarUsuarioDB } from '../../services/supabaseService';
import * as Formatadores from '../../utils/formatadores';
import { useAuth } from '../../context/AuthContext';
import { AvisoErro } from '../../components/AvisoErro';
import { erroDeValidacao } from '../../utils/mensagensErro';

const EMAIL_PROTEGIDO = (import.meta.env.VITE_EMAIL_PROTEGIDO || '').trim().toLowerCase();

export function PainelDetalhesUsuario({
    usuario,
    onVoltar,
    onSucessoExclusao
}) {
    const { usuarioId: usuarioLogadoId } = useAuth();

    const [deletando, setDeletando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState(null); // explicação do erro (cartão)

    if (!usuario) {
        return null;
    }

    const isProprioUsuario = usuarioLogadoId && usuario.id === usuarioLogadoId;
    const isUsuarioProtegido = Boolean(EMAIL_PROTEGIDO) && usuario.email?.trim().toLowerCase() === EMAIL_PROTEGIDO;

    const handleDeletar = async () => {
        if (isProprioUsuario) {
            setMensagemErro(erroDeValidacao({ oQue: 'Não foi possível excluir o usuário.', porque: 'Você não pode excluir a sua própria conta.' }));
            return;
        }

        if (isUsuarioProtegido) {
            setMensagemErro(erroDeValidacao({ oQue: 'Não foi possível excluir o usuário.', porque: 'Este usuário é protegido pelo sistema e não pode ser excluído.' }));
            return;
        }

        const confirmou = window.confirm(
            `Tem certeza de que deseja excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`
        );
        if (!confirmou) return;

        setMensagemErro(null);
        setDeletando(true);
        const resultado = await deletarUsuarioDB(usuario.id, usuario.email);
        setDeletando(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.explicacao);
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
            <AvisoErro explicacao={mensagemErro} emFundoBranco />
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
                    <p className='admin__detalhes_usuario__value'>{Formatadores.formatarTipoUsuario(usuario.tipoUsuario)}</p>
                </div>
                {usuario.escolaNome && (
                    <div>
                        <p className='admin__detalhes_usuario__label'>Escola vinculada</p>
                        <p className='admin__detalhes_usuario__value'>{Formatadores.formatarNome(usuario.escolaNome)}</p>
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
                    disabled={deletando || isProprioUsuario || isUsuarioProtegido}
                >
                    <p>{deletando ? 'Excluindo...' : 'Excluir Usuário'}</p>
                </button>
            </div>
        </>
    );
}