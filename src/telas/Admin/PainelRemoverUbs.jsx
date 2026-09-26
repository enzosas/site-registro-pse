import { useState, useEffect } from 'react';
import { carregarUbsDB, deletarUbsDB } from '../../services/supabaseService';

export function PainelRemoverUbs({ onSucesso }) {
    const [ubsTexto, setUbsTexto] = useState('');
    const [listaUbs, setListaUbs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [excluindo, setExcluindo] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            const dados = await carregarUbsDB();
            if (ativo) {
                setListaUbs(dados || []);
                setCarregando(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, []);

    // Identifica se o texto introduzido corresponde a uma UBS válida da lista
    const ubsEncontrada = listaUbs.find(
        (ubs) => ubs.nome.toLowerCase() === ubsTexto.trim().toLowerCase()
    );

    const isFormValido = Boolean(ubsEncontrada);

    const handleExcluir = async (e) => {
        e.preventDefault();
        if (!isFormValido || excluindo || carregando) return;

        const confirmou = window.confirm(
            `Tem a certeza de que deseja eliminar a UBS "${ubsEncontrada.nome}"? As escolas associadas a ela ficarão sem vínculo.`
        );
        if (!confirmou) return;

        setMensagemErro('');
        setExcluindo(true);

        const resultado = await deletarUbsDB(ubsEncontrada.id);
        setExcluindo(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro || 'Falha ao eliminar a UBS.');
            return;
        }

        alert('UBS eliminada com sucesso!');
        if (onSucesso) {
            onSucesso();
        }
    };

    return (
        <form onSubmit={handleExcluir} style={{ display: 'contents' }}>
            <p className="app__title">Remover UBS</p>

            <div className="app__input-group">
                <label>UBS a remover</label>
                <input
                    type="text"
                    placeholder={
                        carregando
                            ? 'A carregar UBSs...'
                            : 'Digite ou selecione a UBS que deseja remover'
                    }
                    list="lista-ubs-datalist"
                    value={ubsTexto}
                    onChange={(e) => {
                        setUbsTexto(e.target.value);
                        setMensagemErro('');
                    }}
                    autoComplete="off"
                    disabled={carregando || excluindo}
                    required
                />
                <datalist id="lista-ubs-datalist">
                    {listaUbs.map((ubs) => (
                        <option key={ubs.id} value={ubs.nome} />
                    ))}
                </datalist>
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
                    disabled={!isFormValido || excluindo || carregando}
                >
                    <p>{excluindo ? 'A eliminar...' : 'Remover UBS'}</p>
                </button>
            </div>
        </form>
    );
}