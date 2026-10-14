import { useState, useEffect, useMemo } from 'react';
import { IconePesquisa, IconeCheck } from '../../components/Icones';
import { TIPO_USUARIO, EIXOS_TEMATICOS } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';
import { useDados } from '../../context/DadosContext';
import { carregarRegistrosAtividadeDB } from '../../services/supabaseService';
import {
    formatarTurmas,
    formatarDataIso,
    compactarEixo,
} from '../../utils/formatadores';

export function PainelRegistros({ onSelecionarRegistro }) {
    const { tipoUsuario, usuarioId, escolaIdUsuario, ubsIdUsuario } = useAuth();
    const { escolas: listaEscolas, listaUbs } = useDados();

    const isAdmin = tipoUsuario === TIPO_USUARIO.ADMIN;
    const isEscola = tipoUsuario === TIPO_USUARIO.ESCOLA;
    const isUbs = tipoUsuario === TIPO_USUARIO.UBS;
    const isComum = tipoUsuario === TIPO_USUARIO.COMUM;

    const escolasPermitidasUbs = useMemo(() => {
        if (!isUbs || !ubsIdUsuario) return listaEscolas;
        return listaEscolas.filter(
            (e) => String(e.ubs_responsavel) === String(ubsIdUsuario)
        );
    }, [isUbs, ubsIdUsuario, listaEscolas]);

    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroEixo, setFiltroEixo] = useState('');
    const [filtroEscola, setFiltroEscola] = useState('');
    const [filtroUbs, setFiltroUbs] = useState('');
    const [filtroRegistrador, setFiltroRegistrador] = useState('');
    const [filtroLancadoPor, setFiltroLancadoPor] = useState('');
    const [filtroStatusMv, setFiltroStatusMv] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    useEffect(() => {
        let montado = true;
        async function carregar() {
            setCarregando(true);
            const resultado = await carregarRegistrosAtividadeDB({
                tipoUsuario,
                escolaId: escolaIdUsuario,
                ubsId: ubsIdUsuario,
                usuarioId,
            });
            if (!montado) return;
            setRegistros(resultado.data || []);
            setErro(resultado.sucesso ? '' : resultado.erro);
            setCarregando(false);
        }
        carregar();
        return () => {
            montado = false;
        };
    }, [tipoUsuario, escolaIdUsuario, ubsIdUsuario, usuarioId]);

    const registradores = useMemo(() => {
        const nomes = registros.map((r) => r.registrador_nome).filter(Boolean);
        return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));
    }, [registros]);

    const lancadores = useMemo(() => {
        const nomes = registros.map((r) => r.exportador_nome).filter(Boolean);
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

            const eixosLista = Array.isArray(r.eixos_tematicos) ? r.eixos_tematicos : [];
            const passaEixo = !filtroEixo || eixosLista.some((eixo) =>
                String(eixo).toLowerCase().includes(filtroEixo.toLowerCase())
            );

            const passaEscola = !filtroEscola || String(r.escola_id) === String(filtroEscola);
            const passaUbs = !filtroUbs || String(r.ubs_id) === String(filtroUbs);
            const passaRegistrador = !filtroRegistrador || r.registrador_nome === filtroRegistrador;
            const passaLancadoPor = !filtroLancadoPor || r.exportador_nome === filtroLancadoPor;

            const passaStatusMv =
                !filtroStatusMv ||
                (filtroStatusMv === 'lancado' && Boolean(r.exportado_outro_sistema)) ||
                (filtroStatusMv === 'nao_lancado' && !r.exportado_outro_sistema);

            const passaInicio = !dataInicio || r.data_atividade >= dataInicio;
            const passaFim = !dataFim || r.data_atividade <= dataFim;

            return (
                passaBusca &&
                passaEixo &&
                passaEscola &&
                passaUbs &&
                passaRegistrador &&
                passaLancadoPor &&
                passaStatusMv &&
                passaInicio &&
                passaFim
            );
        });
    }, [
        registros,
        termoBusca,
        filtroEixo,
        filtroEscola,
        filtroUbs,
        filtroRegistrador,
        filtroLancadoPor,
        filtroStatusMv,
        dataInicio,
        dataFim,
    ]);

    const subtituloContexto = useMemo(() => {
        const partesFiltro = [];

        if (filtroEixo) {
            partesFiltro.push(`no eixo "${compactarEixo(filtroEixo)}"`);
        }

        if (filtroEscola) {
            const escolaObj = listaEscolas.find((e) => String(e.id) === String(filtroEscola));
            partesFiltro.push(`na escola "${escolaObj ? escolaObj.nome : 'selecionada'}"`);
        }

        if (filtroUbs) {
            const ubsObj = listaUbs.find((u) => String(u.id) === String(filtroUbs));
            partesFiltro.push(`da UBS "${ubsObj ? ubsObj.nome : 'selecionada'}"`);
        }

        if (filtroRegistrador) {
            partesFiltro.push(`registrados por "${filtroRegistrador}"`);
        }

        if (filtroLancadoPor) {
            partesFiltro.push(`lançados por "${filtroLancadoPor}"`);
        }

        if (filtroStatusMv === 'lancado') {
            partesFiltro.push('lançados no MV');
        } else if (filtroStatusMv === 'nao_lancado') {
            partesFiltro.push('não lançados no MV');
        }

        if (dataInicio && dataFim) {
            partesFiltro.push(`no período de ${formatarDataIso(dataInicio)} até ${formatarDataIso(dataFim)}`);
        } else if (dataInicio) {
            partesFiltro.push(`a partir de ${formatarDataIso(dataInicio)}`);
        } else if (dataFim) {
            partesFiltro.push(`até ${formatarDataIso(dataFim)}`);
        }

        let baseTexto = 'Exibindo todos os registros';
        if (isEscola) {
            const escolaLogada = listaEscolas.find((e) => String(e.id) === String(escolaIdUsuario));
            baseTexto = `Exibindo registros da sua escola (${escolaLogada?.nome || 'vinculada'})`;
        } else if (isUbs) {
            const ubsLogada = listaUbs.find((u) => String(u.id) === String(ubsIdUsuario));
            baseTexto = `Exibindo registros das escolas da UBS ${ubsLogada?.nome || 'vinculada'}`;
        } else if (isComum) {
            baseTexto = 'Exibindo apenas os seus registros de atividade';
        }

        if (partesFiltro.length === 0) {
            return `${baseTexto}.`;
        }

        return `${baseTexto} ${partesFiltro.join(', ')}.`;
    }, [
        filtroEixo,
        filtroEscola,
        filtroUbs,
        filtroRegistrador,
        filtroLancadoPor,
        filtroStatusMv,
        dataInicio,
        dataFim,
        listaEscolas,
        listaUbs,
        isEscola,
        isUbs,
        isComum,
        escolaIdUsuario,
        ubsIdUsuario,
    ]);

    const temFiltroAtivo =
        termoBusca ||
        filtroEixo ||
        filtroEscola ||
        filtroUbs ||
        filtroRegistrador ||
        filtroLancadoPor ||
        filtroStatusMv ||
        dataInicio ||
        dataFim;

    const limparFiltros = () => {
        setTermoBusca('');
        setFiltroEixo('');
        setFiltroEscola('');
        setFiltroUbs('');
        setFiltroRegistrador('');
        setFiltroLancadoPor('');
        setFiltroStatusMv('');
        setDataInicio('');
        setDataFim('');
    };

    return (
        <>
            <p className="app__title">Gerenciar Registros</p>
            <p className="admin__usuario__subtitulo">{subtituloContexto}</p>

            <button
                type="button"
                className="app__buttonSecondary"
                onClick={() => setMostrarFiltros((prev) => !prev)}
            >
                <p>{mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}</p>
            </button>

            {mostrarFiltros && (
                <div className="admin__filtros-container">
                    <div className="admin__filtros-linha">
                        <div className="app__combobox-group">
                            <label>Eixo Temático</label>
                            <select
                                className="app__select"
                                value={filtroEixo}
                                onChange={(e) => setFiltroEixo(e.target.value)}
                            >
                                <option value="">Sem filtro</option>
                                {EIXOS_TEMATICOS.map((eixo) => (
                                    <option key={eixo.id} value={eixo.label}>
                                        {compactarEixo(eixo.label)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(isAdmin || isUbs) && (
                        <div className="admin__filtros-linha">
                            <div className="app__combobox-group">
                                <label>Escola</label>
                                <select
                                    className="app__select"
                                    value={filtroEscola}
                                    onChange={(e) => setFiltroEscola(e.target.value)}
                                >
                                    <option value="">Sem filtro</option>
                                    {(isUbs ? escolasPermitidasUbs : listaEscolas).map((escola) => (
                                        <option key={escola.id} value={escola.id}>
                                            {escola.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isAdmin && (
                                <div className="app__combobox-group">
                                    <label>UBS</label>
                                    <select
                                        className="app__select"
                                        value={filtroUbs}
                                        onChange={(e) => setFiltroUbs(e.target.value)}
                                    >
                                        <option value="">Sem filtro</option>
                                        {listaUbs.map((ubs) => (
                                            <option key={ubs.id} value={ubs.id}>
                                                {ubs.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="admin__filtros-linha">
                        {!isComum && (
                            <div className="app__combobox-group">
                                <label>Registrado por</label>
                                <select
                                    className="app__select"
                                    value={filtroRegistrador}
                                    onChange={(e) => setFiltroRegistrador(e.target.value)}
                                >
                                    <option value="">Sem filtro</option>
                                    {registradores.map((nome) => (
                                        <option key={nome} value={nome}>
                                            {nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="app__combobox-group">
                            <label>Lançado por</label>
                            <select
                                className="app__select"
                                value={filtroLancadoPor}
                                onChange={(e) => setFiltroLancadoPor(e.target.value)}
                            >
                                <option value="">Sem filtro</option>
                                {lancadores.map((nome) => (
                                    <option key={nome} value={nome}>
                                        {nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Linha 4: Situacao no MV */}
                    <div className="admin__filtros-linha">
                        <div className="app__combobox-group">
                            <label>Situação no MV</label>
                            <select
                                className="app__select"
                                value={filtroStatusMv}
                                onChange={(e) => setFiltroStatusMv(e.target.value)}
                            >
                                <option value="">Ambos (Todos)</option>
                                <option value="lancado">Lançados no MV</option>
                                <option value="nao_lancado">Não lançados no MV</option>
                            </select>
                        </div>
                    </div>

                    {/* Linha 5: De e Ate */}
                    <div className="admin__filtros-linha">
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

                    {/* Linha 6: Botao Limpar Filtros */}
                    <div className="admin__filtros-linha">
                        <button
                            type="button"
                            className="app__buttonSecondary"
                            onClick={limparFiltros}
                            disabled={!temFiltroAtivo}
                        >
                            <p>Limpar Filtros</p>
                        </button>
                    </div>
                </div>
            )}

            <div className="app__search-bar">
                <input
                    type="text"
                    placeholder="Pesquisar por escola, turma ou responsável"
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
                {!carregando &&
                    registrosFiltrados.map((r) => {
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
                                            <div
                                                className="admin__registro-card__check-badge"
                                                title="Lançado no Sistema MV"
                                            >
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
        </>
    );
}