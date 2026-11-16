import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { TIPO_USUARIO } from '../../utils/constantes';
import ajudaPerfis from '../../content/admin/perfis.md?raw';
import ajudaRegistros from '../../content/admin/registros.md?raw';
import ajudaUsuarios from '../../content/admin/usuarios.md?raw';
import ajudaEscolasUbs from '../../content/admin/escolasUbs.md?raw';
import ajudaTurmas from '../../content/admin/turmas.md?raw';

// Seções da ajuda e os perfis que podem vê-las (cada perfil só lê o que consegue usar)
const SECOES = [
    { conteudo: ajudaPerfis, perfis: [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS] },
    { conteudo: ajudaRegistros, perfis: [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS] },
    { conteudo: ajudaUsuarios, perfis: [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS] },
    { conteudo: ajudaEscolasUbs, perfis: [TIPO_USUARIO.ADMIN] },
    { conteudo: ajudaTurmas, perfis: [TIPO_USUARIO.ADMIN] },
];

export function PainelAjudaAdmin() {
    const { tipoUsuario } = useAuth();
    const tipo = tipoUsuario?.toLowerCase();
    const conteudo = SECOES.filter((secao) => secao.perfis.includes(tipo))
        .map((secao) => secao.conteudo.trim())
        .join('\n\n');

    return (
        <>
            <p className="app__title">Ajuda da Administração</p>
            <div className="markdown">
                <ReactMarkdown>{conteudo}</ReactMarkdown>
            </div>
        </>
    );
}
