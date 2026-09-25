import { useState, useEffect } from 'react';
import { TIPO_USUARIO } from '../../constantes';
import {
    carregarEscolasDB,
    carregarUbsDB,
    criarNovoUsuarioAdmin
} from '../../services/supabaseService';

export function PainelCriarUsuario({ tipoUsuarioLogado, onSucesso }) {

    const [tipoNovoUsuario, setTipoNovoUsuario] = useState(TIPO_USUARIO.COMUM);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [unidadeTexto, setUnidadeTexto] = useState('');

    const [listaEscolas, setListaEscolas] = useState([]);
    const [listaUbs, setListaUbs] = useState([]);
    const [carregandoDados, setCarregandoDados] = useState(false);

    const [salvando, setSalvando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    useEffect(() => {
        let ativo = true;

        async function buscarUnidades() {
            setCarregandoDados(true);
            try {
                const [escolas, ubs] = await Promise.all([
                    carregarEscolasDB(),
                    carregarUbsDB(),
                ]);

                if (ativo) {
                    setListaEscolas(escolas || []);
                    setListaUbs(ubs || []);
                }
            } catch (err) {
                console.error('Erro ao buscar unidades:', err);
            } finally {
                if (ativo) setCarregandoDados(false);
            }
        }

        buscarUnidades();

        return () => {
            ativo = false;
        };
    }, []);

    const precisaUnidade = tipoNovoUsuario !== TIPO_USUARIO.ADMIN;

    let opcoesDatalist = [];
    if (tipoNovoUsuario === TIPO_USUARIO.ESCOLA) {
        opcoesDatalist = listaEscolas.map((e) => ({
            valorFormatado: e.nome,
            id: e.id,
            tipo: 'escola',
        }));
    } else if (tipoNovoUsuario === TIPO_USUARIO.UBS) {
        opcoesDatalist = listaUbs.map((u) => ({
            valorFormatado: u.nome,
            id: u.id,
            tipo: 'ubs',
        }));
    } else if (tipoNovoUsuario === TIPO_USUARIO.COMUM) {
        opcoesDatalist = [
            ...listaEscolas.map((e) => ({
                valorFormatado: `${e.nome}`,
                nomeOriginal: e.nome,
                id: e.id,
                tipo: 'escola',
            })),
            ...listaUbs.map((u) => ({
                valorFormatado: `${u.nome}`,
                nomeOriginal: u.nome,
                id: u.id,
                tipo: 'ubs',
            })),
        ];
    }

    const isFormValido =
        nome.trim().length > 2 &&
        email.trim().includes('@') &&
        senha.trim().length >= 6 &&
        (!precisaUnidade ? true : unidadeTexto.trim().length > 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValido || salvando || carregandoDados) return;

        setMensagemErro('');
        setSalvando(true);

        let escolaId = null;
        let ubsId = null;

        if (precisaUnidade) {
            const digitado = unidadeTexto.trim().toLowerCase();

            const opcaoEncontrada = opcoesDatalist.find((op) => {
                const matchFormatado = op.valorFormatado.toLowerCase() === digitado;
                const matchOriginal = op.nomeOriginal && op.nomeOriginal.toLowerCase() === digitado;
                return matchFormatado || matchOriginal;
            });

            if (!opcaoEncontrada) {
                setSalvando(false);
                setMensagemErro('Por favor, selecione uma unidade válida a partir da lista.');
                return;
            }

            if (opcaoEncontrada.tipo === 'escola') {
                escolaId = opcaoEncontrada.id;
            } else if (opcaoEncontrada.tipo === 'ubs') {
                ubsId = opcaoEncontrada.id;
            }
        }

        const resultado = await criarNovoUsuarioAdmin({
            nome: nome.trim(),
            email: email.trim(),
            password: senha,
            tipoUsuario: tipoNovoUsuario,
            escolaId,
            ubsId,
        });

        setSalvando(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro || 'Falha ao criar o utilizador.');
            return;
        }

        alert('Utilizador criado com sucesso!');
        if (onSucesso) {
            onSucesso();
        }
    };

    return (
        <>
            <p className="app__title">Criar Utilizador</p>

            

            <div className="app__combobox-group">
                <label>Tipo de utilizador</label>
                <select
                    className="app__select"
                    value={tipoNovoUsuario}
                    onChange={(e) => {
                        setTipoNovoUsuario(e.target.value);
                        setUnidadeTexto('');
                        setMensagemErro('');
                    }}
                >
                    <option value={TIPO_USUARIO.COMUM}>Comum</option>
                    <option value={TIPO_USUARIO.ESCOLA}>Escola</option>
                    <option value={TIPO_USUARIO.UBS}>UBS</option>
                    <option value={TIPO_USUARIO.ADMIN}>Administrador</option>
                </select>
            </div>

            <div className="app__input-group">
                <label>Nome Completo</label>
                <input
                    type="text"
                    placeholder="Escreva aqui o nome completo do novo utilizador"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />
            </div>

            {precisaUnidade && (
                <div className="app__input-group">
                    <label>
                        {tipoNovoUsuario === TIPO_USUARIO.COMUM
                            ? 'Escola ou UBS'
                            : tipoNovoUsuario === TIPO_USUARIO.ESCOLA
                                ? 'Escola'
                                : 'UBS'}
                    </label>
                    <input
                        type="text"
                        placeholder={
                            carregandoDados
                                ? 'A carregar opções...'
                                : tipoNovoUsuario === TIPO_USUARIO.COMUM
                                    ? 'Digite ou selecione o nome da escola ou UBS'
                                    : `Digite ou selecione a ${tipoNovoUsuario === TIPO_USUARIO.ESCOLA ? 'escola' : 'UBS'}`
                        }
                        list="lista-unidades-datalist"
                        value={unidadeTexto}
                        onChange={(e) => setUnidadeTexto(e.target.value)}
                        autoComplete="off"
                        disabled={carregandoDados}
                        required
                    />
                    <datalist id="lista-unidades-datalist">
                        {opcoesDatalist.map((opcao) => (
                            <option key={`${opcao.tipo}-${opcao.id}`} value={opcao.valorFormatado} />
                        ))}
                    </datalist>
                </div>
            )}

            <div className="app__input-group">
                <label>E-mail</label>
                <input
                    type="email"
                    placeholder="Escreva aqui o e-mail do novo utilizador"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="app__input-group">
                <label>Senha</label>
                <input
                    type="password"
                    placeholder="Digite aqui a senha (mínimo 6 caracteres)"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />
            </div>

            <div className="app__footer">
                {mensagemErro && (
                    <div style={{ color: 'var(--cor-erro, #ff4d4f)'}}>
                        {mensagemErro}
                    </div>
                )}
            <button
                    className="app__buttonMain"
                    disabled={!isFormValido || salvando || carregandoDados}
                    onClick={handleSubmit}
                >
                    <p>{salvando ? 'Registrando...' : 'Criar Utilizador'}</p>
                </button>
            </div>
        </>
    );
}