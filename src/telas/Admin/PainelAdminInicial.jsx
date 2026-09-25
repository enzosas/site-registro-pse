import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelAdminInicial({ nomeUsuario, tipoUsuario, onNavegar }) {
    
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Painel Administrativo</p>
            <p>
                Olá, {nomeUsuario}!
            </p>

            {isAdminGeral && (
                <button
                    type="button"
                    className="app__buttonSecondary"
                    onClick={() => onNavegar(TELAS_ADMIN.USUARIOS)}
                >
                    Gerenciar Usuários e Acessos
                </button>
            )}

            <button
                type="button"
                className="app__buttonSecondary"
                onClick={() => onNavegar(TELAS_ADMIN.ESCOLAS)}
            >
                Visualizar Escolas e Turmas
            </button>

            <button
                type="button"
                className="app__buttonSecondary"
                onClick={() => onNavegar(TELAS_ADMIN.RELATORIOS)}
            >
                Relatórios Consolidados
            </button>
        </>
    );
}