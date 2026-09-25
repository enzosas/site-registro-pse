import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelUsuarios({ tipoUsuario }) {
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Gerenciar Usuários</p>
        </>
    );
}