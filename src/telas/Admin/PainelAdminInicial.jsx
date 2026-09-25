import '../../styles/telas/TelaAdmin.css';
import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelAdminInicial({ nomeUsuario, tipoUsuario, onNavegar }) {
    
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Painel Administrativo</p>
            <p className='admin__inicial__saudacoes'> Olá, {nomeUsuario}!</p>

            {isAdminGeral && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_ADMIN.PAINEL_REGISTROS)}
                >
                    Gerenciar Registros
                </button>
            )}
            {isAdminGeral && (
                <button
                    type="button"
                    className="app__buttonSecondary admin__inicial__nav-button"
                    onClick={() => onNavegar(TELAS_ADMIN.PAINEL_USUARIOS)}
                >
                    Gerenciar Usuários
                </button>
            )}
            {isAdminGeral && (
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