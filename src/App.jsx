import './App.css';
import { useRegistroPSE } from './hooks/useRegistroPSE';
import { formatarNome } from './utils/formatadores';
import { TELAS } from './constantes';

// Componentes
import { IconeVoltar } from './components/Icones';
import { HeaderRegistro } from './components/HeaderRegistro';

// Telas
import { TelaInicial } from './telas/TelaInicial';
import { TelaAjuda } from './telas/TelaAjuda';
import { TelaLogin } from './telas/TelaLogin';
import { TelaCadastroManual } from './telas/TelaCadastroManual';
import { TelaAddAluno } from './telas/TelaAddAluno';
import { TelaResumo } from './telas/TelaResumo';

// Etapas
import { Etapa1Data } from './etapas/Etapa1Data';
import { Etapa2Escola } from './etapas/Etapa2Escola';
import { Etapa3Turma } from './etapas/Etapa3Turma';
import { Etapa4Eixos } from './etapas/Etapa4Eixos';
import { Etapa5Presenca } from './etapas/Etapa5Presenca';
import { Etapa6ColetaDados } from './etapas/Etapa6ColetaDados';
import { Etapa7Conclusao } from './etapas/Etapa7Conclusao';


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
					<div className='app--input-group'>
						<div className='app--card' ref={p.cardRef}>
							<button
								type="button"
								className="app--botao-voltar"
								onClick={() => p.setTelaAtiva(TELAS.LOGIN)}
							>
								<IconeVoltar />
							</button>
							<div className='app--input-group'>
								<label>Digite seu email</label>
								<input type="text" />
							</div>
						</div>
					</div>
				);

			case TELAS.ADD_ESCOLA:
				return (
					<div className='app--card' ref={p.cardRef}>
						<div className='app--input-group'>
							<button
								type="button"
								className="app--botao-voltar"
								onClick={() => p.setTelaAtiva(TELAS.ETAPAS)}
							>
								<IconeVoltar />
							</button>
							<div className='app--input-group'>
								<label>Digite o nome da Escola</label>
								<input type='text' />
								<button
									className='app--buttonMain'
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
					<>
						<HeaderRegistro etapaAtual={p.etapa} />
						<div className='app--card' ref={p.cardRef}>
							{p.etapa === 1 && (
								<Etapa1Data
									dia={p.dia}
									setDia={p.setDia}
									mes={p.mes}
									setMes={p.setMes}
									ano={p.ano}
									setAno={p.setAno}
									profissionaisResponsaveis={p.profissionaisResponsaveis}
									setProfissionaisResponsaveis={p.setProfissionaisResponsaveis}
									Registrador={p.Registrador}
									setRegistrador={p.setRegistrador}
									onAvancar={p.avancarEtapa}
									onVoltar={() => p.setTelaAtiva(TELAS.INICIAL)}
								/>
							)}

							{p.etapa === 2 && (
								<Etapa2Escola
									buscaEscola={p.buscaEscola}
									setBuscaEscola={p.setBuscaEscola}
									escolasFiltradas={p.escolasFiltradas}
									escolaSelecionada={p.escolaSelecionada}
									setEscolaSelecionada={p.setEscolaSelecionada}
									formatarNome={formatarNome}
									onAvancar={p.avancarEtapa}
									onVoltar={p.voltarEtapa}
									onCadastroManual={() => p.setTelaAtiva(TELAS.CADASTRO_MANUAL)}
								/>
							)}

							{p.etapa === 3 && (
								<Etapa3Turma
									buscaTurma={p.buscaTurma}
									setBuscaTurma={p.setBuscaTurma}
									turmasFiltradas={p.turmasFiltradas}
									turmaSelecionada={p.turmaSelecionada}
									setTurmaSelecionada={p.setTurmaSelecionada}
									formatarNome={formatarNome}
									onAvancar={p.avancarEtapa}
									onVoltar={() => {
										p.setTurmaSelecionada(null);
										p.voltarEtapa();
									}}
									onCadastroManual={() => p.setTelaAtiva(TELAS.CADASTRO_MANUAL)}
								/>
							)}

							{p.etapa === 4 && (
								<Etapa4Eixos
									idsEixosSelecionados={p.idsEixosSelecionados}
									toggleEixo={p.toggleEixo}
									temEixoLocal={p.temEixoLocal}
									nomeEixoLocal={p.nomeEixoLocal}
									handleAtualizarNomeEixoLocal={p.setNomeEixoLocal}
									observacoes={p.observacoes}
									handleAtualizarObservacoes={p.setObservacoes}
									onAvancar={() => {
										p.marcarTodosPresentes();
										p.avancarEtapa();
									}}
									onVoltar={p.voltarEtapa}
								/>
							)}

							{p.etapa === 5 && (
								<Etapa5Presenca
									alunosOrdenados={p.alunosOrdenados}
									idsAlunosPresentes={p.idsAlunosPresentes}
									toggleAluno={p.toggleAluno}
									alternarPresencaTodos={p.alternarPresencaTodos}
									todosEstaoPresentes={p.todosEstaoPresentes}
									onAdicionarAlunoManual={() => p.setTelaAtiva(TELAS.ADD_ALUNO)}
									onAvancar={p.avancarEtapa}
									onVoltar={p.voltarEtapa}
								/>
							)}

							{p.etapa === 6 && (
								<Etapa6ColetaDados
									alunoAtualIndex={p.alunoAtualIndex}
									alunosPresentes={p.alunosPresentes}
									alunoAtual={p.alunoAtualTelaAntropometria}
									dadosAlunos={p.dadosAlunos}
									handleAtualizarDadosAluno={p.handleAtualizarDadosAluno}
									temAntropometria={p.temAntropometria}
									temVacinacao={p.temVacinacao}
									temSaudeOcular={p.temSaudeOcular}
									alturaInputRef={p.alturaInputRef}
									mostrarAlunosPendentes={p.mostrarAlunosPendentes}
									obterAlunosPendentes={p.obterAlunosPendentes}
									onSelecionarAlunoPendente={(id) => {
										const indexAluno = p.alunosPresentes.findIndex((a) => a.id === id);
										p.setAlunoAtualIndex(indexAluno);
										p.setMostrarAlunosPendentes(false);
									}}
									onProximo={p.proximoAluno}
									onAnterior={p.alunoAnterior}
									onVoltar={p.voltarEtapa}
								/>
							)}

							{p.etapa === 7 && (
								<Etapa7Conclusao
									dia={p.dia}
									mes={p.mes}
									ano={p.ano}
									dadosRelatorio={p.gerarObjetoRelatorio()}
									onVerResumo={() => p.setTelaAtiva(TELAS.RESUMO)}
									onReiniciarRegistro={p.reiniciarRegistro}
									onVoltar={p.voltarEtapa}
								/>
							)}
						</div>
					</>
				);
		}
	};

	return (
		<div className='app--background' ref={p.bgRef}>
			<div className='app--column'>{renderizarConteudo()}</div>
		</div>
	);
}

export default App;