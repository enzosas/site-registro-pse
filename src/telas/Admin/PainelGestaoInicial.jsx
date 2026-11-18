import '../../styles/telas/TelaAdmin.css';
import { TELAS_GESTAO, TIPO_USUARIO } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';
import { useDados } from '../../context/DadosContext';
import {
    IconeDocumento,
    IconeUsuarios,
    IconeVinculo,
    IconeEnviarArquivo,
    IconeSetaDireita,
} from '../../components/Icones';

const ROTULOS_PERFIL = {
    [TIPO_USUARIO.ADMIN]: 'Administrador',
    [TIPO_USUARIO.ESCOLA]: 'Escola',
    [TIPO_USUARIO.UBS]: 'UBS',
    [TIPO_USUARIO.COMUM]: 'Usuário',
};

// Áreas do painel e quais perfis podem ver cada uma
const AREAS = [
    {
        tela: TELAS_GESTAO.PAINEL_REGISTROS,
        titulo: 'Gerenciar Registros',
        descricao: 'Consultar, gerar PDF e lançar no MV',
        Icone: IconeDocumento,
        perfis: [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS],
    },
    {
        tela: TELAS_GESTAO.PAINEL_USUARIOS,
        titulo: 'Gerenciar Usuários',
        descricao: 'Criar e excluir contas de acesso',
        Icone: IconeUsuarios,
        perfis: [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS],
    },
    {
        tela: TELAS_GESTAO.PAINEL_ESCOLAUBS,
        titulo: 'Vínculo Escolas e UBS',
        descricao: 'Definir qual UBS atende cada escola',
        Icone: IconeVinculo,
        perfis: [TIPO_USUARIO.ADMIN],
    },
    {
        tela: TELAS_GESTAO.PAINEL_ATUALIZAR_TURMAS,
        titulo: 'Atualizar Turmas',
        descricao: 'Importar as turmas a partir das planilhas',
        Icone: IconeEnviarArquivo,
        perfis: [TIPO_USUARIO.ADMIN],
    },
];

// Etiqueta "Perfil | Unidade". Se o nome da unidade já começa com o perfil
// (ex.: "UBS Kennedy"), mostra só o nome para não repetir.
function EtiquetaPerfil({ tipoUsuario, nomeUnidade }) {
    const rotulo = ROTULOS_PERFIL[tipoUsuario];
    if (!rotulo) return null;

    const nomeJaTemPerfil =
        nomeUnidade && nomeUnidade.toLowerCase().startsWith(`${rotulo.toLowerCase()} `);

    return (
        <p className="admin__inicial__perfil" title={nomeUnidade ? `${rotulo}: ${nomeUnidade}` : rotulo}>
            {!nomeJaTemPerfil && <span className="admin__inicial__perfil-tipo">{rotulo}</span>}
            {!nomeJaTemPerfil && nomeUnidade && (
                <span className="admin__inicial__perfil-divisor" aria-hidden="true" />
            )}
            {nomeUnidade && <span className="admin__inicial__perfil-unidade">{nomeUnidade}</span>}
        </p>
    );
}

export function PainelGestaoInicial({ onNavegar }) {
    const { nomeUsuario, tipoUsuario, escolaIdUsuario, ubsIdUsuario } = useAuth();
    const { escolas, listaUbs } = useDados();

    let nomeUnidade = '';
    if (tipoUsuario === TIPO_USUARIO.ESCOLA) {
        nomeUnidade = escolas.find((escola) => String(escola.id) === String(escolaIdUsuario))?.nome || '';
    } else if (tipoUsuario === TIPO_USUARIO.UBS) {
        nomeUnidade = listaUbs.find((ubs) => String(ubs.id) === String(ubsIdUsuario))?.nome || '';
    }

    const areasVisiveis = AREAS.filter((area) => area.perfis.includes(tipoUsuario));

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

            <div className="admin__inicial__cabecalho">
                <p className="admin__inicial__saudacoes">Olá, {nomeUsuario}!</p>
                <EtiquetaPerfil tipoUsuario={tipoUsuario} nomeUnidade={nomeUnidade} />
            </div>

            <nav className="admin__inicial__areas" aria-label="Áreas do painel">
                {areasVisiveis.map(({ tela, titulo, descricao, Icone }) => (
                    <button
                        key={tela}
                        type="button"
                        className="admin__inicial__area"
                        onClick={() => onNavegar(tela)}
                    >
                        <span className="admin__inicial__area-icone">
                            <Icone />
                        </span>
                        <span className="admin__inicial__area-texto">
                            <span className="admin__inicial__area-titulo">{titulo}</span>
                            <span className="admin__inicial__area-descricao">{descricao}</span>
                        </span>
                        <span className="admin__inicial__area-seta">
                            <IconeSetaDireita />
                        </span>
                    </button>
                ))}
            </nav>
        </>
    );
}
