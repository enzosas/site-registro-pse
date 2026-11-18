import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useRegistro } from './context/RegistroPSEContext';
import { TELAS, TELAS_GESTAO } from './utils/constantes';
import { RenderizadorEtapas } from './components/etapas/RenderizadorEtapas';

// Telas
import { TelaInicial } from './telas/TelaInicial';
import { TelaAjuda } from './telas/TelaAjuda';
import { TelaLogin } from './telas/TelaLogin';
import { TelaEsqueciSenha } from './telas/TelaEsqueciSenha';
import { TelaRedefinirSenha } from './telas/TelaRedefinirSenha';
import { TelaCadastroManual } from './telas/TelaCadastroManual';
import { TelaAddAluno } from './telas/TelaAddAluno';
import { TelaResumo } from './telas/TelaResumo';
import { TelaGestao } from './telas/Admin/TelaGestao';

function App() {
    const {
        isLoggedIn,
        tipoUsuario,
        restaurandoSessao,
        recuperandoSenha,
        linkRecuperacaoInvalido,
        verificandoLink,
        setLinkRecuperacaoInvalido,
    } = useAuth();
    const {
        telaAtiva,
        setTelaAtiva,
        handleLogout,
        cardRef,
        bgRef,
        iniciarOuRetomarRegistro,
        filaEnvio,
        processarFila,
        tentarEnviarNovamente,
        descartarDaFila,
    } = useRegistro();
    const [subtelaGestao, setSubtelaGestao] = useState(TELAS_GESTAO.PAINEL_INICIAL);

    const renderizarConteudo = () => {
        // Confirmando se o link já usado ainda pode ser retomado (dura uma fração de segundo)
        if (verificandoLink) {
            return (
                <div className='app__card' ref={cardRef}>
                    <p className='app__title'>Aguarde...</p>
                </div>
            );
        }

        // Quem abre o link do e-mail de recuperação vai direto para a tela certa
        let tela = telaAtiva;
        if (recuperandoSenha) {
            tela = TELAS.REDEFINIR_SENHA;
        } else if (linkRecuperacaoInvalido && telaAtiva === TELAS.INICIAL) {
            tela = TELAS.ESQUECI_SENHA;
        }

        switch (tela) {
            case TELAS.INICIAL:
                return (
                    <TelaInicial
                        isLoggedIn={isLoggedIn}
                        tipoUsuario={tipoUsuario}
                        onLogout={handleLogout}
                        onAdministracao={() => {
                            setSubtelaGestao(TELAS_GESTAO.PAINEL_INICIAL);
                            setTelaAtiva(TELAS.ADMIN);
                        }}
                        onMeusRegistros={() => {
                            setSubtelaGestao(TELAS_GESTAO.PAINEL_REGISTROS);
                            setTelaAtiva(TELAS.ADMIN);
                        }}
                        filaEnvio={filaEnvio}
                        onEnviarFila={processarFila}
                        onTentarNovamente={tentarEnviarNovamente}
                        onDescartarDaFila={descartarDaFila}
                        onComecar={() => {
                            if (isLoggedIn) {
                                iniciarOuRetomarRegistro();
                            } else {
                                setTelaAtiva(TELAS.LOGIN);
                            }
                        }}
                        onAjuda={() => setTelaAtiva(TELAS.AJUDA)}
                    />
                );

            case TELAS.AJUDA:
                return <TelaAjuda onVoltar={() => setTelaAtiva(TELAS.INICIAL)} cardRef={cardRef} />;

			case TELAS.LOGIN:
				return (
					<TelaLogin
						onVoltar={() => setTelaAtiva(TELAS.INICIAL)}
						onEsqueciSenha={() => setTelaAtiva(TELAS.ESQUECI_SENHA)}
					/>
				);

            case TELAS.ESQUECI_SENHA:
                return (
                    <TelaEsqueciSenha
                        onVoltar={() => {
                            setLinkRecuperacaoInvalido(false);
                            setTelaAtiva(TELAS.LOGIN);
                        }}
                    />
                );

            case TELAS.REDEFINIR_SENHA:
                return <TelaRedefinirSenha />;

			case TELAS.CADASTRO_MANUAL:
				return <TelaCadastroManual />;

			case TELAS.ADD_ALUNO:
				return <TelaAddAluno />;

			case TELAS.RESUMO:
				return <TelaResumo />;

            case TELAS.ADMIN:
                return (
                    <TelaGestao
                        onVoltar={() => setTelaAtiva(TELAS.INICIAL)}
                        cardRef={cardRef}
                        subtelaInicial={subtelaGestao}
                    />
                );

			case TELAS.ETAPAS:
			default:
				return <RenderizadorEtapas />;
		}
	};

	return (
		<div className='app__background' ref={bgRef}>
			{/* Enquanto verifica se há sessão salva, não mostra a tela de "Começar" */}
			<div className='app__column'>{restaurandoSessao ? null : renderizarConteudo()}</div>
		</div>
	);
}

export default App;