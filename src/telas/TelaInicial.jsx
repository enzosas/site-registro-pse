import '../styles/telas/TelaInicial.css';
import { TIPO_USUARIO } from '../utils/constantes.js';

export function TelaInicial({
    onComecar,
    onAjuda,
    isLoggedIn,
    onLogout,
    tipoUsuario,
    onAdministracao,
    onMeusRegistros,
}) {
    const tipo = tipoUsuario?.toLowerCase();

    const podeAcessarAdmin =
        isLoggedIn &&
        [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS].includes(tipo);

    const isUsuarioComum = isLoggedIn && tipo === TIPO_USUARIO.COMUM;

    return (
        <div className='app__column app__tela-inicial'>
            <div className='app__tela-inicial-content'>
                <p className='app__title app__title__tela-inicial'>
                    Registro PSE<br />Online
                </p>
                <button className='app__buttonMain' onClick={onComecar}>
                    {isLoggedIn ? 'Gerar Registro' : 'Começar'}
                </button>
                <div className='app__tela-inicial__botoes-segundo-nivel'>
                    {podeAcessarAdmin && (
                        <button
                            className='app__buttonSecondary app__tela-inicial__ajuda'
                            onClick={onAdministracao}
                        >
                            Administração
                        </button>
                    )}

                    {isUsuarioComum && (
                        <button
                            className='app__buttonSecondary app__tela-inicial__ajuda'
                            onClick={onMeusRegistros}
                        >
                            Meus Registros
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
            </div>
            <div className='app__tela-inicial__rodape-imagens'>
                <img src={`${import.meta.env.BASE_URL}pseLogo1.png`} alt="Logo PSE" className="app__logo-pse" />
                <img src={`${import.meta.env.BASE_URL}ufsmLogo.png`} alt="Logo UFSM" className="app__logo-pse" />
            </div>
        </div>
    );
}