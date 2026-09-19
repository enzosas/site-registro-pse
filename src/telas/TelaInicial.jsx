export function TelaInicial({ onComecar, onAjuda }) {
    return (
        <div className='app--column app--tela-inicial'>
            <div className='app--tela-inicial-content'>
                <p className='app--title app--title__tela-inicial'>
                    Registro PSE<br />Online
                </p>
                <button className='app--buttonMain' onClick={onComecar}>
                    <p>Começar</p>
                </button>
                <button className='app--buttonSecondary app--tela-inicial--ajuda' onClick={onAjuda}>
                    <p>Ajuda</p>
                </button>
            </div>
            <div className='app--tela-inicial--rodape-imagens'>
                <img src={`${import.meta.env.BASE_URL}pseLogo1.png`} alt="Logo PSE" className="app--logo-pse" />
                <img src={`${import.meta.env.BASE_URL}ufsmLogo.png`} alt="Logo PSE" className="app--logo-pse" />
            </div>
        </div>
    );
}