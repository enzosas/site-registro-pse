import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegistro } from '../context/RegistroPSEContext';
import { AvisoErro } from '../components/AvisoErro';
import { TELAS } from '../utils/constantes';
import { erroDeValidacao } from '../utils/mensagensErro';
import { redefinirSenhaDB, deslogarUsuario } from '../services/supabaseService';

const TAMANHO_MINIMO = 6;

export function TelaRedefinirSenha() {
    const { cardRef, setTelaAtiva } = useRegistro();
    const { finalizarRecuperacao, cancelarRecuperacao, recuperacaoExpirada } = useAuth();

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null); // explicação do erro (cartão)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (salvando) return;

        if (novaSenha.length < TAMANHO_MINIMO) {
            setErro(erroDeValidacao({ oQue: `A senha deve ter pelo menos ${TAMANHO_MINIMO} caracteres.` }));
            return;
        }
        if (novaSenha !== confirmacao) {
            setErro(erroDeValidacao({
                oQue: 'As senhas não são iguais.',
                oQueFazer: 'Digite a mesma senha nos dois campos.',
            }));
            return;
        }

        setErro(null);
        setSalvando(true);
        const resultado = await redefinirSenhaDB(novaSenha);

        if (!resultado.sucesso) {
            setSalvando(false);
            if (resultado.sessaoExpirada) {
                await recuperacaoExpirada();
                setTelaAtiva(TELAS.ESQUECI_SENHA, true);
                return;
            }
            setErro(resultado.explicacao || null);
            return;
        }

        // Encerra a sessão temporária criada pelo link e manda a pessoa entrar com a nova senha
        await deslogarUsuario();
        setTelaAtiva(TELAS.LOGIN, true);
        finalizarRecuperacao('Senha redefinida com sucesso! Entre com a sua nova senha.');
    };

    const handleCancelar = async () => {
        await cancelarRecuperacao();
        setTelaAtiva(TELAS.INICIAL, true);
    };

    return (
        <form onSubmit={handleSubmit} className='app__card' ref={cardRef}>
            <p className='app__title'>Nova senha</p>
            <p>Escolha uma nova senha para a sua conta (mínimo de {TAMANHO_MINIMO} caracteres).</p>

            <div className='login__input-group'>
                <div className='app__input-group'>
                    <label>nova senha</label>
                    <input
                        type="password"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </div>
                <div className='app__input-group'>
                    <label>confirmar nova senha</label>
                    <input
                        type="password"
                        value={confirmacao}
                        onChange={(e) => setConfirmacao(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </div>
                <AvisoErro explicacao={erro} emFundoBranco />
            </div>

            <div className='app__footer'>
                <button type="button" className='app__buttonSecondary' onClick={handleCancelar} disabled={salvando}>
                    <p>Cancelar</p>
                </button>
                <button type="submit" className='app__buttonMain' disabled={salvando}>
                    <p>{salvando ? 'Salvando...' : 'Salvar senha'}</p>
                </button>
            </div>
        </form>
    );
}
