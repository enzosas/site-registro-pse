import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegistro } from '../context/RegistroPSEContext';
import { IconeVoltar } from '../components/Icones';
import { TELAS, TIPO_USUARIO } from '../constantes';

export function TelaLogin({ onVoltar, onEsqueciSenha }) {
    const { login, mensagemErro } = useAuth();
    const { setTelaAtiva, cardRef } = useRegistro();

    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (carregando) return;

        setCarregando(true);
        const sucesso = await login(loginInput, senhaInput);
        setCarregando(false);

        if (sucesso) {
            setTelaAtiva(TELAS.INICIAL);
        }
    };

    return (
        <>
            <p className='app__title app__title__tela-inicial'>
                Registro PSE<br />Online
            </p>
            <form onSubmit={handleSubmit} className='app__card' ref={cardRef}>
                <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app__title'>Login</p>
                <p>Programa Saúde na Escola</p>
                <p>Santa Maria, RS</p>
                <div className='login__input-group'>
                    <div className='app__input-group'>
                        <label>login</label>
                        <input
                            type="text"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            required
                        />
                    </div>
                    <div className='app__input-group'>
                        <label>senha</label>
                        <input
                            type="password"
                            value={senhaInput}
                            onChange={(e) => setSenhaInput(e.target.value)}
                            required
                        />
                    </div>
                    {mensagemErro && <p style={{ color: 'red', marginTop: '10px' }}>{mensagemErro}</p>}
                </div>
                <div className='app__footer'>
                    <button type="button" className='app__buttonSecondary' onClick={onEsqueciSenha}>
                        <p>Esqueci a senha</p>
                    </button>
                    <button type="submit" className='app__buttonMain' disabled={carregando}>
                        <p>{carregando ? 'Entrando...' : 'Entrar'}</p>
                    </button>
                </div>
            </form>
        </>
    );
}