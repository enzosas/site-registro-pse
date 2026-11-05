import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegistro } from '../context/RegistroPSEContext';
import { IconeVoltar } from '../components/Icones';
import { MensagemErro } from '../components/MensagemErro';
import { solicitarRecuperacaoSenhaDB } from '../services/supabaseService';

const SEGUNDOS_ENTRE_ENVIOS = 60;

export function TelaEsqueciSenha({ onVoltar }) {
    const { cardRef } = useRegistro();
    const { linkRecuperacaoInvalido } = useAuth();

    const [email, setEmail] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [erro, setErro] = useState('');
    const [segundosRestantes, setSegundosRestantes] = useState(0);

    // Contagem regressiva para evitar reenvios em sequência
    useEffect(() => {
        if (segundosRestantes <= 0) return undefined;
        const id = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000);
        return () => clearTimeout(id);
    }, [segundosRestantes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando || segundosRestantes > 0) return;

        setErro('');
        setEnviando(true);
        const resultado = await solicitarRecuperacaoSenhaDB(email);
        setEnviando(false);

        if (!resultado.sucesso) {
            setErro(resultado.erro);
            return;
        }

        setEnviado(true);
        setSegundosRestantes(SEGUNDOS_ENTRE_ENVIOS);
    };

    const textoBotao = enviando
        ? 'Enviando...'
        : segundosRestantes > 0
            ? `Reenviar em ${segundosRestantes}s`
            : enviado
                ? 'Reenviar link'
                : 'Enviar link';

    return (
        <form onSubmit={handleSubmit} className='app__card' ref={cardRef}>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Recuperar senha</p>
            <p>Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.</p>

            <div className='login__input-group'>
                {linkRecuperacaoInvalido && (
                    <MensagemErro mensagem='O link de recuperação expirou ou já foi usado. Solicite um novo abaixo.' />
                )}

                <div className='app__input-group'>
                    <label>e-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                {enviado && (
                    <div className='app__mensagem-sucesso'>
                        Se este e-mail estiver cadastrado, você receberá um link em instantes.
                        Confira também a caixa de spam. Se a mensagem parecer em branco, abra os
                        três pontinhos (...) no fim dela para ver o conteúdo.
                    </div>
                )}
                <MensagemErro mensagem={erro} />
            </div>

            <div className='app__footer'>
                <button type="button" className='app__buttonSecondary' onClick={onVoltar}>
                    <p>Voltar ao login</p>
                </button>
                <button
                    type="submit"
                    className='app__buttonMain'
                    disabled={enviando || segundosRestantes > 0}
                >
                    <p>{textoBotao}</p>
                </button>
            </div>
        </form>
    );
}
