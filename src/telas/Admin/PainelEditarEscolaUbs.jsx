import { useState, useEffect } from 'react';
import { carregarEscolasDB, carregarUbsDB, vincularEscolasAUbsDB } from '../../services/supabaseService';

const OPCAO_SEM_UBS = 'Sem UBS (Desvincular)';

export function PainelEditarEscolaUbs({ onSucesso }) {
    const [listaEscolas, setListaEscolas] = useState([]);
    const [listaUbs, setListaUbs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    const [escolasInput, setEscolasInput] = useState(['']);
    const [ubsTexto, setUbsTexto] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            setCarregando(true);
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
                console.error('Erro ao carregar dados:', err);
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarDados();

        return () => {
            ativo = false;
        };
    }, []);

    const handleAlterarEscola = (index, novoValor) => {
        setEscolasInput((prev) => {
            const copia = [...prev];
            copia[index] = novoValor;
            return copia;
        });
        setMensagemErro('');
    };

    const handleAdicionarEscola = () => {
        setEscolasInput((prev) => [...prev, '']);
    };

    const handleRemoverEscola = (indexRemover) => {
        setEscolasInput((prev) => prev.filter((_, index) => index !== indexRemover));
    };

    const ehDesvinculacao = ubsTexto.trim().toLowerCase() === OPCAO_SEM_UBS.toLowerCase();

    const ubsEncontrada = listaUbs.find(
        (u) => u.nome.trim().toLowerCase() === ubsTexto.trim().toLowerCase()
    );

    const escolasValidas = escolasInput
        .map((texto) => {
            const achada = listaEscolas.find(
                (e) => e.nome.trim().toLowerCase() === texto.trim().toLowerCase()
            );
            return achada ? achada.id : null;
        })
        .filter((id) => id !== null);

    const isFormValido = (Boolean(ubsEncontrada) || ehDesvinculacao) && escolasValidas.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValido || salvando || carregando) return;

        setMensagemErro('');
        setSalvando(true);

        const idsUnicos = [...new Set(escolasValidas)];
        const idUbsDestino = ehDesvinculacao ? null : ubsEncontrada.id;

        const resultado = await vincularEscolasAUbsDB(idsUnicos, idUbsDestino);
        setSalvando(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro || 'Falha ao vincular escolas.');
            return;
        }

        alert(ehDesvinculacao ? 'Vínculo removido com sucesso!' : 'Vinculação salva com sucesso!');
        if (onSucesso) {
            onSucesso();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <p className="app__title">Editar Vínculo Escola-UBS</p>
            <p className="admin__usuario__subtitulo">
                Selecione as escolas e a UBS à qual elas serão vinculadas (ou selecione para desvincular):
            </p>

            <datalist id="lista-escolas-datalist">
                {listaEscolas.map((escola) => (
                    <option key={escola.id} value={escola.nome} />
                ))}
            </datalist>

            <datalist id="lista-ubs-datalist">
                <option value={OPCAO_SEM_UBS} />
                {listaUbs.map((ubs) => (
                    <option key={ubs.id} value={ubs.nome} />
                ))}
            </datalist>

            <div className="app__input-group">
                <label>Escolas a vincular / alterar</label>

                {escolasInput.map((escola, index) => (
                    <div key={index} className="app__tela-profissionais__row">
                        <input
                            type="text"
                            placeholder={
                                carregando
                                    ? 'A carregar escolas...'
                                    : `Digite ou selecione a escola ${index + 1}`
                            }
                            list="lista-escolas-datalist"
                            className="app__date-input app__tela-profissionais__input"
                            value={escola}
                            onChange={(e) => handleAlterarEscola(index, e.target.value)}
                            autoComplete="off"
                            disabled={carregando || salvando}
                            required
                        />
                        {escolasInput.length > 1 && (
                            <button
                                type="button"
                                className="app__buttonSecondary app__tela-profissionais__btn-remover"
                                onClick={() => handleRemoverEscola(index)}
                                title="Remover campo"
                                disabled={salvando}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className="app__buttonSecondary app__tela-profissionais__btn-adicionar"
                    onClick={handleAdicionarEscola}
                    disabled={carregando || salvando}
                >
                    + Adicionar outra escola
                </button>
            </div>

            <div className="app__input-group" style={{ marginTop: '1rem' }}>
                <label>UBS Responsável</label>
                <input
                    type="text"
                    placeholder={
                        carregando
                            ? 'A carregar UBSs...'
                            : 'Digite a UBS ou selecione Sem UBS (Desvincular)'
                    }
                    list="lista-ubs-datalist"
                    value={ubsTexto}
                    onChange={(e) => {
                        setUbsTexto(e.target.value);
                        setMensagemErro('');
                    }}
                    autoComplete="off"
                    disabled={carregando || salvando}
                    required
                />
            </div>

            <div className="app__footer">
                {mensagemErro && (
                    <div style={{ color: 'var(--cor-negative, #ff4d4f)' }}>
                        {mensagemErro}
                    </div>
                )}
                <button
                    type="submit"
                    className="app__buttonMain"
                    disabled={!isFormValido || salvando || carregando}
                >
                    <p>{salvando ? 'A guardar alterações...' : 'Salvar Vínculo'}</p>
                </button>
            </div>
        </form>
    );
}