import '../../styles/telas/TelaAdmin.css';
import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelAdminInicial({ nomeUsuario, tipoUsuario, onNavegar }) {
    
    const verTelaRegistros = tipoUsuario === TIPO_USUARIO.ADMIN || tipoUsuario === TIPO_USUARIO.ESCOLA || tipoUsuario === TIPO_USUARIO.UBS;
    const verTelaUsuarios = tipoUsuario === TIPO_USUARIO.ADMIN || tipoUsuario === TIPO_USUARIO.ESCOLA || tipoUsuario === TIPO_USUARIO.UBS;
    const verTelaEscolaUBS = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Painel Administrativo</p>
            <p className='admin__inicial__saudacoes'> Olá, {nomeUsuario}!</p>

            {verTelaRegistros && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_ADMIN.PAINEL_REGISTROS)}
                >
                    Gerenciar Registros
                </button>
            )}
            {verTelaUsuarios && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_ADMIN.PAINEL_USUARIOS)}
                >
                    Gerenciar Usuários
                </button>
            )}
            {verTelaEscolaUBS && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_ADMIN.PAINEL_ESCOLAUBS)}
                >
                    Alocar Escolas UBS
                </button>
            )}
        </>
    );
}