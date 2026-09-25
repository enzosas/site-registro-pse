import '../styles/telas/TelaInicial.css';
import { TIPO_USUARIO } from '../constantes';

export function TelaInicial({ onComecar, onAjuda, isLoggedIn, onLogout, tipoUsuario, onAdministracao }) {
    
    const podeAcessarAdmin =
        isLoggedIn &&
        [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS].includes(tipoUsuario?.toLowerCase());
    
    return (
        <div className='app__column app__tela-inicial'>
            <div className='app__tela-inicial-content'>
                <p className='app__title app__title__tela-inicial'>
                    Registro PSE<br />Online
                </p>
                <button className='app__buttonMain' onClick={onComecar}>
                    {isLoggedIn ? "Gerar Registro" : "Começar"}
                </button>
                {podeAcessarAdmin && (
                    <button
                        className='app__buttonSecondary app__tela-inicial__ajuda'
                        onClick={onAdministracao}
                    >
                        Administração
                    </button>
                )}
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