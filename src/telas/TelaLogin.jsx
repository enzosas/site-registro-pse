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
            <p className='app--title app--title__tela-inicial'>
                Registro PSE<br />Online
            </p>
            <form onSubmit={handleLogin} className='app--card' ref={cardRef}>
                <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app--title'>Login</p>
                <p>Programa Saúde na Escola</p>
                <p>Santa Maria, RS</p>

                <div className='login--input-group'>
                    <div className='app--input-group'>
                        <label>login</label>
                        <input
                            type="text"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                        />
                    </div>
                    <div className='app--input-group'>
                        <label>senha</label>
                        <input
                            type="password"
                            value={senhaInput}
                            onChange={(e) => setSenhaInput(e.target.value)}
                        />
                    </div>
                    {mensagemErro && <p style={{ color: 'red', marginTop: '10px' }}>{mensagemErro}</p>}
                </div>

                <div className='app--footer'>
                    <button type="button" className='app--buttonSecondary' onClick={onEsqueciSenha}>
                        <p>Esqueci a senha</p>
                    </button>
                    <button type="submit" className='app--buttonMain'>
                        <p>Entrar</p>
                    </button>
                </div>
            </form>
        </>
    );
}