import '../styles/telas/TelaInicial.css';

export function TelaInicial({ onComecar, onAjuda, isLoggedIn, onLogout }) {
    return (
        <div className='app__column app__tela-inicial'>
            <div className='app__tela-inicial-content'>
                <p className='app__title app__title__tela-inicial'>
                    Registro PSE<br />Online
                </p>
                <button className='app__buttonMain' onClick={onComecar}>
                    Começar
                </button>
                <button className='app__buttonSecondary app__tela-inicial__ajuda' onClick={onAjuda}>
                    Ajuda
                </button>
                {isLoggedIn && (
                    <button
                        className='app__buttonSecondary app__tela-inicial__ajuda'
                        onClick={onLogout}
                    >
                        Sair
                    </button>
                )}
            </div>
            <div className='app__tela-inicial__rodape-imagens'>
                <img src={`${import.meta.env.BASE_URL}pseLogo1.png`} alt="Logo PSE" className="app__logo-pse" />
                <img src={`${import.meta.env.BASE_URL}ufsmLogo.png`} alt="Logo PSE" className="app__logo-pse" />
            </div>
        </div>
    );
}