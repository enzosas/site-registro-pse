import '../styles/telas/TelaInicial.css';
import { TIPO_USUARIO } from '../utils/constantes.js';
import { AvisoCartao } from '../components/AvisoCartao';
import { useTema } from '../context/TemaContext';

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
    const { tema, alternarTema } = useTema();
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
                    <AvisoCartao
                        tipo="pendente"
                        titulo="Aguardando envio"
                        acoes={
                            <button type="button" className="aviso-cartao__botao aviso-cartao__botao--principal" onClick={onEnviarFila}>
                                Enviar agora
                            </button>
                        }
                    >
                        <p>
                            {pendentes.length === 1
                                ? '1 registro será enviado automaticamente assim que a conexão voltar.'
                                : `${pendentes.length} registros serão enviados automaticamente assim que a conexão voltar.`}
                        </p>
                    </AvisoCartao>
                )}
                {comErro.length > 0 && (
                    <AvisoCartao tipo="erro" titulo="Envio não concluído">
                        {comErro.length > 1 && <p>{comErro.length} registros não foram enviados.</p>}
                        {comErro.map((item) => (
                            <div key={item.idCliente} className="aviso-cartao__item">
                                <p>{item.resumo}.</p>
                                {item.explicacao ? (
                                    <>
                                        <p>{item.explicacao.porque}</p>
                                        <p>{item.explicacao.oQueFazer}</p>
                                        <p className="aviso-cartao__codigo">Código: {item.explicacao.codigo}</p>
                                    </>
                                ) : (
                                    <p>{item.erro}</p>
                                )}
                                <div className="aviso-cartao__acoes">
                                    <button type="button" className="aviso-cartao__botao aviso-cartao__botao--principal" onClick={() => onTentarNovamente(item.idCliente)}>
                                        Tentar de novo
                                    </button>
                                    <button type="button" className="aviso-cartao__botao" onClick={() => onDescartarDaFila(item.idCliente)}>
                                        Descartar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </AvisoCartao>
                )}
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
                    <button
                        className='app__buttonSecondary app__tela-inicial__ajuda'
                        onClick={alternarTema}
                    >
                        {tema === 'escuro' ? 'Modo claro' : 'Modo escuro'}
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