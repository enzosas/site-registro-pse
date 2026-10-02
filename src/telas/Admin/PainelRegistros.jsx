import { useAuth } from '../../context/AuthContext';
import { TIPO_USUARIO } from '../../utils/constantes';

export function PainelRegistros() {
    const { tipoUsuario } = useAuth();
    const isAdminGeral = tipoUsuario === TIPO_USUARIO.ADMIN;

    return (
        <>
            <p className="app__title">Gerenciar Registros</p>
        </>
    );
}