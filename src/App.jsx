import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useRegistro } from './context/RegistroPSEContext';
import { TELAS, TELAS_GESTAO } from './utils/constantes';
import { RenderizadorEtapas } from './components/etapas/RenderizadorEtapas';
import { IconeVoltar } from './components/Icones';

// Telas
import { TelaInicial } from './telas/TelaInicial';
import { TelaAjuda } from './telas/TelaAjuda';
import { TelaLogin } from './telas/TelaLogin';
import { TelaCadastroManual } from './telas/TelaCadastroManual';
import { TelaAddAluno } from './telas/TelaAddAluno';
import { TelaResumo } from './telas/TelaResumo';
import { TelaGestao } from './telas/Admin/TelaGestao';

function App() {
    const { isLoggedIn, tipoUsuario } = useAuth();
    const { telaAtiva, setTelaAtiva, handleLogout, cardRef, bgRef } = useRegistro();
    const [subtelaGestao, setSubtelaGestao] = useState(TELAS_GESTAO.PAINEL_INICIAL);

    const renderizarConteudo = () => {
        switch (telaAtiva) {
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
                        onComecar={() => {
                            if (isLoggedIn) {
                                setTelaAtiva(TELAS.ETAPAS);
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
                    <div className='app__input-group'>
                        <div className='app__card' ref={cardRef}>
                            <button
                                type="button"
                                className="app__botao-voltar"
                                onClick={() => setTelaAtiva(TELAS.LOGIN)}
                            >
                                <IconeVoltar />
                            </button>
                            <div className='app__input-group'>
                                <label>Digite seu email</label>
                                <input type="text" />
                            </div>
                        </div>
                    </div>
                );

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
			<div className='app__column'>{renderizarConteudo()}</div>
		</div>
	);
}

export default App;