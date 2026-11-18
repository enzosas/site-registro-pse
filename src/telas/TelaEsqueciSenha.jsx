import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegistro } from '../context/RegistroPSEContext';
import { IconeVoltar } from '../components/Icones';
import { AvisoCartao } from '../components/AvisoCartao';
import { AvisoErro } from '../components/AvisoErro';
import { solicitarRecuperacaoSenhaDB } from '../services/supabaseService';
import { erroLocal } from '../utils/mensagensErro';

const SEGUNDOS_ENTRE_ENVIOS = 60;

const ERRO_LINK_EXPIRADO = erroLocal({
    oQue: 'O link de recuperação expirou ou já foi usado.',
    porque: 'Cada link vale por 1 hora e só pode ser aberto uma vez.',
    oQueFazer: 'Peça um novo link abaixo.',
    codigo: 'LINK-EXPIRADO',
});

export function TelaEsqueciSenha({ onVoltar }) {
    const { cardRef } = useRegistro();
    const { linkRecuperacaoInvalido } = useAuth();

    const [email, setEmail] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [erro, setErro] = useState(null); // explicação do erro (cartão)
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

        setErro(null);
        setEnviando(true);
        const resultado = await solicitarRecuperacaoSenhaDB(email);
        setEnviando(false);

        if (!resultado.sucesso) {
            setErro(resultado.explicacao || null);
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
                {linkRecuperacaoInvalido && <AvisoErro explicacao={ERRO_LINK_EXPIRADO} emFundoBranco />}

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
                    <AvisoCartao
                        tipo="sucesso"
                        titulo="Pedido enviado"
                        emFundoBranco
                    >
                        <p>Se este e-mail estiver cadastrado, você receberá um link em instantes.</p>
                        <p>
                            Confira também a caixa de spam. Se a mensagem parecer em branco, abra os
                            três pontinhos (...) no fim dela para ver o conteúdo.
                        </p>
                    </AvisoCartao>
                )}
                <AvisoErro explicacao={erro} emFundoBranco />
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
