import { useState } from 'react';
import { criarUbsDB } from '../../services/supabaseService';
import { useDados } from '../../context/DadosContext';

export function PainelCriarUbs({ onSucesso }) {
    const { recarregarUbs } = useDados();
    const [nome, setNome] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    const isFormValido = nome.trim().length >= 3;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValido || salvando) return;
        setMensagemErro('');
        setSalvando(true);

        const resultado = await criarUbsDB(nome);
        setSalvando(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro || 'Falha ao cadastrar a UBS.');
            return;
        }

        await recarregarUbs();
        alert('UBS cadastrada com sucesso!');
        if (onSucesso) {
            onSucesso();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <p className="app__title">Cadastrar UBS</p>
            <div className="app__input-group">
                <label>Nome da UBS</label>
                <input
                    type="text"
                    placeholder="Digite o nome da nova UBS"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={salvando}
                    autoFocus
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
                    disabled={!isFormValido || salvando}
                >
                    <p>{salvando ? 'Salvando...' : 'Salvar UBS'}</p>
                </button>
            </div>
        </form>
    );
}