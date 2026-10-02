import { useState } from 'react';
import { deletarUbsDB } from '../../services/supabaseService';
import { useDados } from '../../context/DadosContext';

export function PainelRemoverUbs({ onSucesso }) {
    const { listaUbs, recarregarUbs, carregandoDados: carregando } = useDados();

    const [ubsTexto, setUbsTexto] = useState('');
    const [excluindo, setExcluindo] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

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

        await recarregarUbs();
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