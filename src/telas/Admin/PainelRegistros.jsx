import { useState, useEffect, useMemo } from 'react';
import { IconePesquisa } from '../../components/Icones';
import { TIPO_USUARIO } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';
import { carregarRegistrosAtividadeDB } from '../../services/supabaseService';
import {
    formatarProfissionais,
    formatarTurmas,
    formatarDataIso,
    formatarListaParaTexto,
} from '../../utils/formatadores';

export function PainelRegistros() {
    const { tipoUsuario } = useAuth();
    const isAdmin = tipoUsuario === TIPO_USUARIO.ADMIN;
    const isComum = tipoUsuario === TIPO_USUARIO.COMUM;

    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [selecionado, setSelecionado] = useState(null);

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
            setRegistros(resultado.data);
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

    if (selecionado) {
        const alunos = Array.isArray(selecionado.alunos_dados) ? selecionado.alunos_dados : [];
        return (
            <>
                <p className="app__title">Detalhes do registro</p>
                <div className="app__search-list">
                    <p><strong>Escola:</strong> {selecionado.escola_nome || '-'}</p>
                    <p><strong>Turma(s):</strong> {formatarTurmas(selecionado.turmas)}</p>
                    <p><strong>Data:</strong> {formatarDataIso(selecionado.data_atividade)} - Turno da {selecionado.turno || '-'}</p>
                    <p><strong>Registrado por:</strong> {selecionado.registrador_nome || '-'}</p>
                    <p><strong>Profissionais:</strong> {formatarProfissionais(selecionado.profissionais)}</p>
                    <p><strong>Eixos temáticos:</strong> {formatarListaParaTexto(selecionado.eixos_tematicos)}</p>
                    <p><strong>Observações:</strong> {selecionado.observacoes || '-'}</p>
                    <p><strong>Alunos presentes ({alunos.length}):</strong></p>
                    {alunos.map((a, i) => (
                        <p key={a.id ?? i}>- {a.nome}</p>
                    ))}
                </div>
                <div className="app__footer">
                    <button type="button" className="app__buttonMain" onClick={() => setSelecionado(null)}>
                        <p>Voltar à lista</p>
                    </button>
                </div>
            </>
        );
    }

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
                        <label>Registrado por</label>
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
                    return (
                        <button
                            key={r.id}
                            type="button"
                            className="admin__registro-card"
                            onClick={() => setSelecionado(r)}
                        >
                            <div className="admin__registro-card__header">
                                <p className="admin__registro-card__escola">{r.escola_nome}</p>
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