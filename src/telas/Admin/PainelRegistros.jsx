import { useState, useEffect, useMemo } from 'react';
import { IconePesquisa, IconeCheck } from '../../components/Icones';
import { TIPO_USUARIO } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';
import { carregarRegistrosAtividadeDB } from '../../services/supabaseService';
import {
    formatarTurmas,
    formatarDataIso,
} from '../../utils/formatadores';

export function PainelRegistros({ onSelecionarRegistro }) {
    const { tipoUsuario } = useAuth();
    const isAdmin = tipoUsuario === TIPO_USUARIO.ADMIN;
    const isComum = tipoUsuario === TIPO_USUARIO.COMUM;

    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [termoBusca, setTermoBusca] = useState('');
    const [filtroRegistrador, setFiltroRegistrador] = useState('');
    const [filtroEscola, setFiltroEscola] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    useEffect(() => {
        let montado = true;
        async function carregar() {
            setCarregando(true);
            const resultado = await carregarRegistrosAtividadeDB();
            if (!montado) return;
            setRegistros(resultado.data || []);
            setErro(resultado.sucesso ? '' : resultado.erro);
            setCarregando(false);
        }
        carregar();
        return () => {
            montado = false;
        };
    }, []);

    const registradores = useMemo(() => {
        const nomes = registros.map((r) => r.registrador_nome).filter(Boolean);
        return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));
    }, [registros]);

    const escolas = useMemo(() => {
        const nomes = registros.map((r) => r.escola_nome).filter(Boolean);
        return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));
    }, [registros]);

    const registrosFiltrados = useMemo(() => {
        const busca = termoBusca.trim().toLowerCase();
        return registros.filter((r) => {
            const passaBusca =
                !busca ||
                (r.escola_nome || '').toLowerCase().includes(busca) ||
                formatarTurmas(r.turmas).toLowerCase().includes(busca) ||
                (r.registrador_nome || '').toLowerCase().includes(busca);
            const passaRegistrador = !filtroRegistrador || r.registrador_nome === filtroRegistrador;
            const passaEscola = !filtroEscola || r.escola_nome === filtroEscola;
            const passaInicio = !dataInicio || r.data_atividade >= dataInicio;
            const passaFim = !dataFim || r.data_atividade <= dataFim;
            return passaBusca && passaRegistrador && passaEscola && passaInicio && passaFim;
        });
    }, [registros, termoBusca, filtroRegistrador, filtroEscola, dataInicio, dataFim]);

    const temFiltroAtivo = termoBusca || filtroRegistrador || filtroEscola || dataInicio || dataFim;

    const limparFiltros = () => {
        setTermoBusca('');
        setFiltroRegistrador('');
        setFiltroEscola('');
        setDataInicio('');
        setDataFim('');
    };

    return (
        <>
            <p className="app__title">Gerenciar Registros</p>
            <p className="admin__usuario__subtitulo">
                {isAdmin
                    ? 'Exibindo os registros de todos os usuários'
                    : isComum
                        ? 'Exibindo os registros feitos por você'
                        : 'Exibindo os registros da sua unidade'}
            </p>

            {isAdmin && (
                <div className="admin__grupo-filtros">
                    <div className="app__combobox-group">
                        <label>Registrador</label>
                        <select
                            className="app__select"
                            value={filtroRegistrador}
                            onChange={(e) => setFiltroRegistrador(e.target.value)}
                        >
                            <option value="">Sem filtro</option>
                            {registradores.map((nome) => (
                                <option key={nome} value={nome}>{nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="app__combobox-group">
                        <label>Escola</label>
                        <select
                            className="app__select"
                            value={filtroEscola}
                            onChange={(e) => setFiltroEscola(e.target.value)}
                        >
                            <option value="">Sem filtro</option>
                            {escolas.map((nome) => (
                                <option key={nome} value={nome}>{nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="app__combobox-group">
                        <label>De</label>
                        <input
                            type="date"
                            className="app__select"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                        />
                    </div>
                    <div className="app__combobox-group">
                        <label>Até</label>
                        <input
                            type="date"
                            className="app__select"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="app__search-bar">
                <input
                    type="text"
                    placeholder="Pesquisar por escola, turma ou registrador"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                />
                <IconePesquisa />
            </div>

            {carregando && <p className="admin__escola_ubs__vazio">Carregando registros...</p>}
            {!carregando && erro && (
                <p className="admin__alerta-erro">Não foi possível carregar os registros: {erro}</p>
            )}
            {!carregando && !erro && registrosFiltrados.length === 0 && (
                <p className="admin__escola_ubs__vazio">
                    {temFiltroAtivo
                        ? 'Nenhum registro encontrado com esses filtros.'
                        : 'Nenhum registro encontrado.'}
                </p>
            )}

            <div className="admin__registros__grid">
                {!carregando && registrosFiltrados.map((r) => {
                    const totalAlunos = Array.isArray(r.alunos_dados) ? r.alunos_dados.length : 0;
                    const isLancado = Boolean(r.exportado_outro_sistema);

                    return (
                        <button
                            key={r.id}
                            type="button"
                            className={`admin__registro-card ${isLancado ? 'admin__registro-card--lancado' : ''}`}
                            onClick={() => onSelecionarRegistro && onSelecionarRegistro(r)}
                        >
                            <div className="admin__registro-card__header">
                                <div className="admin__registro-card__header-top">
                                    <p className="admin__registro-card__escola">{r.escola_nome}</p>
                                    {isLancado && (
                                        <div className="admin__registro-card__check-badge" title="Lançado no Sistema MV">
                                            <IconeCheck bold />
                                        </div>
                                    )}
                                </div>
                                <p className="admin__registro-card__turma">{formatarTurmas(r.turmas)}</p>
                            </div>

                            <div className="admin__registro-card__tags">
                                <span className="admin__registro-card__badge">
                                    {formatarDataIso(r.data_atividade)} - {r.turno}
                                </span>
                                <span className="admin__registro-card__badge admin__registro-card__badge--destaque">
                                    {totalAlunos} {totalAlunos === 1 ? 'aluno' : 'alunos'}
                                </span>
                            </div>

                            <div className="admin__registro-card__footer">
                                <p className="admin__registro-card__autor">
                                    Registrado por: <span>{r.registrador_nome || '-'}</span>
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {!carregando && temFiltroAtivo && (
                <div className="app__footer">
                    <button type="button" className="app__buttonMain" onClick={limparFiltros}>
                        <p>Limpar filtros</p>
                    </button>
                </div>
            )}
        </>
    );
}