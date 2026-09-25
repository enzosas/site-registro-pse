import { TELAS_ADMIN, TIPO_USUARIO } from '../../constantes';

export function PainelEscolaUbs({ tipoUsuario }) {
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Gerenciar Relação Escola UBS</p>
        </>
    );
}