import { IconePesquisa } from '../../components/Icones';
import { useState, useEffect, useMemo } from 'react';
import { TIPO_USUARIO } from '../../constantes';
import {
    carregarUsuariosDB,
    carregarEscolasDB,
    carregarUbsDB
} from '../../services/supabaseService';

export function PainelUsuarios({
    tipoUsuario,
    escolaId = null,
    ubsId = null,
    onCriarUsuario,
    onSelecionarUsuario
}) {
    const isComum = tipoUsuario === TIPO_USUARIO.COMUM;
    const isAdmin = tipoUsuario === TIPO_USUARIO.ADMIN;

    const [usuarios, setUsuarios] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState(true);

    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEscola, setFiltroEscola] = useState('');
    const [filtroUbs, setFiltroUbs] = useState('');

    const [listaEscolas, setListaEscolas] = useState([]);
    const [listaUbs, setListaUbs] = useState([]);

    useEffect(() => {
        let montado = true;

        async function carregarDadosPainel() {
            setCarregando(true);

            const dadosUsuarios = await carregarUsuariosDB({
                tipoUsuario,
                escolaId,
                ubsId,
            });

            let escolas = [];
            let ubs = [];
            if (isAdmin) {
                const [respEscolas, respUbs] = await Promise.all([
                    carregarEscolasDB(),
                    carregarUbsDB(),
                ]);
                escolas = respEscolas || [];
                ubs = respUbs || [];
            }

            if (montado) {
                setUsuarios(dadosUsuarios || []);
                setListaEscolas(escolas);
                setListaUbs(ubs);
                setCarregando(false);
            }
        }

        if (!isComum) {
            carregarDadosPainel();
        } else {
            setCarregando(false);
        }

        return () => {
            montado = false;
        };
    }, [tipoUsuario, escolaId, ubsId, isAdmin, isComum]);

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((user) => {
            const busca = termoBusca.trim().toLowerCase();
            const bateNome = user.nome.toLowerCase().includes(busca);
            const bateEmail = user.email.toLowerCase().includes(busca);
            const passaBusca = !busca || bateNome || bateEmail;

            const passaTipo = !filtroTipo || user.tipoUsuario === filtroTipo;
            const passaEscola = !filtroEscola || String(user.escolaId) === String(filtroEscola);
            const passaUbs = !filtroUbs || String(user.ubsId) === String(filtroUbs);

            return passaBusca && passaTipo && passaEscola && passaUbs;
        });
    }, [usuarios, termoBusca, filtroTipo, filtroEscola, filtroUbs]);

    if (isComum) {
        return (
            <div>
                <p className="app__title">Acesso restrito</p>
                <p>Você não tem permissão para acessar esta área.</p>
            </div>
        );
    }

    return (
        <>
            <p className="app__title">Gerenciar Usuários</p>

            <div className="admin__grupo-filtros">
                <div className="app__combobox-group">
                    <label>Tipo</label>
                    <select
                        className="app__select"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="">Sem filtro</option>
                        {isAdmin && <option value={TIPO_USUARIO.ADMIN}>Administrador</option>}
                        <option value={TIPO_USUARIO.ESCOLA}>Escola</option>
                        <option value={TIPO_USUARIO.UBS}>UBS</option>
                        <option value={TIPO_USUARIO.COMUM}>Comum</option>
                    </select>
                </div>

                {isAdmin && (
                    <div className="app__combobox-group">
                        <label>Escola</label>
                        <select
                            className="app__select"
                            value={filtroEscola}
                            onChange={(e) => setFiltroEscola(e.target.value)}
                        >
                            <option value="">Sem filtro</option>
                            {listaEscolas.map((escola) => (
                                <option key={escola.id} value={escola.id}>
                                    {escola.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

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

            <div className="app__search-bar">
                <input
                    type="text"
                    placeholder="Digite aqui para pesquisar um usuário"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                />
                <IconePesquisa />
            </div>

            <div className="app__search-list">
                {carregando && (
                    <div>
                        <p>Carregando usuários...</p>
                    </div>
                )}

                {!carregando && usuariosFiltrados.length === 0 && (
                    <div>
                        <p>Nenhum usuário encontrado.</p>
                    </div>
                )}

                {!carregando && usuariosFiltrados.map((user) => (
                    <div
                        key={user.id}
                        className="admin__usuario__tabela__line"
                        onClick={() => onSelecionarUsuario && onSelecionarUsuario(user)}
                    >
                        <p className="admin__usuario__tabela__line__nome">{user.nome}</p>
                        <p className="admin__usuario__tabela__line__email">{user.email}</p>
                        <p className="admin__usuario__tabela__line__info">
                            {user.tipoUsuario}
                        </p>
                    </div>
                ))}
            </div>

            <div className="app__footer">
                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={onCriarUsuario}
                >
                    <p>Criar novo usuário</p>
                </button>
            </div>
        </>
    );
}