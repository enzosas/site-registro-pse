import './App.css';
import { useRegistroPSE } from './hooks/useRegistroPSE';
import { formatarNome } from './utils/formatadores';
import { TELAS } from './constantes';
import { RenderizadorEtapas } from './components/etapas/EtapasForm';

// Componentes
import { IconeVoltar } from './components/Icones';

// Telas
import { TelaInicial } from './telas/TelaInicial';
import { TelaAjuda } from './telas/TelaAjuda';
import { TelaLogin } from './telas/TelaLogin';
import { TelaCadastroManual } from './telas/TelaCadastroManual';
import { TelaAddAluno } from './telas/TelaAddAluno';
import { TelaResumo } from './telas/TelaResumo';


function App() {
	const p = useRegistroPSE();

	const renderizarConteudo = () => {
		switch (p.telaAtiva) {
			case TELAS.INICIAL:
				return (
					<TelaInicial
						onComecar={() => {
							if (p.isLoggedIn) {
								p.setTelaAtiva(TELAS.ETAPAS);
							} else {
								p.setTelaAtiva(TELAS.LOGIN);
							}
						}}
						onAjuda={() => p.setTelaAtiva(TELAS.AJUDA)}
					/>
				);

			case TELAS.AJUDA:
				return (
					<TelaAjuda
						onVoltar={() => p.setTelaAtiva(TELAS.INICIAL)}
						cardRef={p.cardRef}
					/>
				);

			case TELAS.LOGIN:
				return (
					<TelaLogin
						loginInput={p.loginInput}
						setLoginInput={p.setLoginInput}
						senhaInput={p.senhaInput}
						setSenhaInput={p.setSenhaInput}
						mensagemErro={p.mensagemErro}
						handleLogin={p.handleLogin}
						onVoltar={() => {
							p.setMensagemErro('');
							p.setTelaAtiva(TELAS.INICIAL);
						}}
						onEsqueciSenha={() => p.setTelaAtiva(TELAS.ESQUECI_SENHA)}
						cardRef={p.cardRef}
					/>
				);

			case TELAS.ESQUECI_SENHA:
				return (
					<div className='app__input-group'>
						<div className='app__card' ref={p.cardRef}>
							<button
								type="button"
								className="app__botao-voltar"
								onClick={() => p.setTelaAtiva(TELAS.LOGIN)}
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

			case TELAS.ADD_ESCOLA:
				return (
					<div className='app__card' ref={p.cardRef}>
						<div className='app__input-group'>
							<button
								type="button"
								className="app__botao-voltar"
								onClick={() => p.setTelaAtiva(TELAS.ETAPAS)}
							>
								<IconeVoltar />
							</button>
							<div className='app__input-group'>
								<label>Digite o nome da Escola</label>
								<input type='text' />
								<button
									className='app__buttonMain'
									onClick={() => p.setTelaAtiva(TELAS.ETAPAS)}
								>
									<label>Cadastrar Escola</label>
								</button>
							</div>
						</div>
					</div>
				);

			case TELAS.CADASTRO_MANUAL:
				return (
					<TelaCadastroManual
						etapa={p.etapa}
						escolaManual={p.escolaManual}
						setEscolaManual={p.setEscolaManual}
						turmaManual={p.turmaManual}
						setTurmaManual={p.setTurmaManual}
						onSalvarManual={p.handleSalvarManual}
						onVoltar={() => p.setTelaAtiva(TELAS.ETAPAS)}
						cardRef={p.cardRef}
					/>
				);

			case TELAS.ADD_ALUNO:
				return (
					<TelaAddAluno
						etapa={p.etapa}
						novoAlunoNome={p.novoAlunoNome}
						setNovoAlunoNome={p.setNovoAlunoNome}
						novoAlunoDataNascimento={p.novoAlunoDataNascimento}
						setNovoAlunoDataNascimento={p.setNovoAlunoDataNascimento}
						alunoAdicionadoAnim={p.alunoAdicionadoAnim}
						onAdicionarAluno={p.handleAdicionarAluno}
						onVoltar={() => p.setTelaAtiva(TELAS.ETAPAS)}
						nomeInputRef={p.nomeInputRef}
						cardRef={p.cardRef}
					/>
				);

			case TELAS.RESUMO: {
				const dados = p.gerarObjetoRelatorio();
				return (
					<TelaResumo
						etapa={p.etapa}
						dados={dados}
						observacoes={p.observacoes}
						copiado={p.copiado}
						onCopiarResumo={() => {
							console.log(JSON.stringify(dados, null, 2));
							p.handleCopiarResumo();
						}}
						onVoltar={() => p.setTelaAtiva(TELAS.ETAPAS)}
						cardRef={p.cardRef}
					/>
				);
			}

			case TELAS.ETAPAS:
			default:
				return (
					<RenderizadorEtapas form={p} />
				);
		}
	};

	return (
		<div className='app__background' ref={p.bgRef}>
			<div className='app__column'>{renderizarConteudo()}</div>
		</div>
	);
}

export default App;