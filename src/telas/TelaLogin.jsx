import { IconeVoltar } from '../components/Icones';

export function TelaLogin({
    loginInput,
    setLoginInput,
    senhaInput,
    setSenhaInput,
    mensagemErro,
    handleLogin,
    onVoltar,
    onEsqueciSenha,
    cardRef,
}) {
    return (
        <>
            <p className='app__title app__title__tela-inicial'>
                Registro PSE<br />Online
            </p>
            <form onSubmit={handleLogin} className='app__card' ref={cardRef}>
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
                        />
                    </div>
                    <div className='app__input-group'>
                        <label>senha</label>
                        <input
                            type="password"
                            value={senhaInput}
                            onChange={(e) => setSenhaInput(e.target.value)}
                        />
                    </div>
                    {mensagemErro && <p style={{ color: 'red', marginTop: '10px' }}>{mensagemErro}</p>}
                </div>

                <div className='app__footer'>
                    <button type="button" className='app__buttonSecondary' onClick={onEsqueciSenha}>
                        <p>Esqueci a senha</p>
                    </button>
                    <button type="submit" className='app__buttonMain'>
                        <p>Entrar</p>
                    </button>
                </div>
            </form>
        </>
    );
}