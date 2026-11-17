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
    filaEnvio = [],
    onEnviarFila,
    onTentarNovamente,
    onDescartarDaFila,
}) {
    const tipo = tipoUsuario?.toLowerCase();

    const podeAcessarAdmin =
        isLoggedIn &&
        [TIPO_USUARIO.ADMIN, TIPO_USUARIO.ESCOLA, TIPO_USUARIO.UBS].includes(tipo);

    const isUsuarioComum = isLoggedIn && tipo === TIPO_USUARIO.COMUM;

    // Registros guardados no aparelho por falta de internet
    const pendentes = isLoggedIn ? filaEnvio.filter((item) => item.status !== 'erro') : [];
    const comErro = isLoggedIn ? filaEnvio.filter((item) => item.status === 'erro') : [];

    return (
        <div className='app__column app__tela-inicial'>
            <div className='app__tela-inicial-content'>
                <p className='app__title app__title__tela-inicial'>
                    Registro PSE<br />Online
                </p>
                {pendentes.length > 0 && (
                    <div className='app__fila-envio' role="status">
                        <p>
                            {pendentes.length === 1
                                ? '1 registro aguardando envio.'
                                : `${pendentes.length} registros aguardando envio.`}{' '}
                            Ele{pendentes.length > 1 ? 's serão enviados' : ' será enviado'} automaticamente quando houver internet.
                        </p>
                        <button type="button" className='app__buttonSecondary' onClick={onEnviarFila}>
                            Enviar agora
                        </button>
                    </div>
                )}
                {comErro.map((item) => (
                    <div key={item.idCliente} className='app__fila-envio app__fila-envio--erro' role="alert">
                        <p>
                            Não foi possível enviar o registro <strong>{item.resumo}</strong>: {item.erro}
                        </p>
                        <div className='app__fila-envio__acoes'>
                            <button type="button" className='app__buttonSecondary' onClick={() => onTentarNovamente(item.idCliente)}>
                                Tentar de novo
                            </button>
                            <button type="button" className='app__buttonSecondary' onClick={() => onDescartarDaFila(item.idCliente)}>
                                Descartar
                            </button>
                        </div>
                    </div>
                ))}
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