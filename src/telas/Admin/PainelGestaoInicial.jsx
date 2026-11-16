import '../../styles/telas/TelaAdmin.css';
import { TELAS_GESTAO, TIPO_USUARIO } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

export function PainelGestaoInicial({ onNavegar }) {
    const { nomeUsuario, tipoUsuario } = useAuth();

    const verTelaRegistros =
        tipoUsuario === TIPO_USUARIO.ADMIN ||
        tipoUsuario === TIPO_USUARIO.ESCOLA ||
        tipoUsuario === TIPO_USUARIO.UBS;

    const verTelaUsuarios =
        tipoUsuario === TIPO_USUARIO.ADMIN ||
        tipoUsuario === TIPO_USUARIO.ESCOLA ||
        tipoUsuario === TIPO_USUARIO.UBS;

    const verTelaEscolaUBS = tipoUsuario === TIPO_USUARIO.ADMIN;
    const verTelaAtualizarTurmas = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <div className="admin__inicial__titulo-linha">
                <p className="app__title">Painel Administrativo</p>
                <button
                    type="button"
                    className="admin__botao-ajuda"
                    onClick={() => onNavegar(TELAS_GESTAO.PAINEL_AJUDA)}
                    aria-label="Ajuda da administração"
                    title="Ajuda da administração"
                >
                    ?
                </button>
            </div>
            <p className='admin__inicial__saudacoes'>Olá, {nomeUsuario}!</p>

            {verTelaRegistros && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_GESTAO.PAINEL_REGISTROS)}
                >
                    Gerenciar Registros
                </button>
            )}

            {verTelaUsuarios && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_GESTAO.PAINEL_USUARIOS)}
                >
                    Gerenciar Usuários
                </button>
            )}

            {verTelaEscolaUBS && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_GESTAO.PAINEL_ESCOLAUBS)}
                >
                    Gerenciar Vínculo Escolas UBS
                </button>
            )}

            {verTelaAtualizarTurmas && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_GESTAO.PAINEL_ATUALIZAR_TURMAS)}
                >
                    Atualizar Turmas
                </button>
            )}
        </>
    );
}