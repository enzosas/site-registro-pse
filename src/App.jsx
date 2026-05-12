import { use } from 'react'
import './App.css'
import { useState } from 'react'
import db from './db.json'

export function IconeVoltar({ onClick }) {
	return (
		<svg onClick={onClick} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className='app--botao-voltar'>
			<path d="M20.625 11H1.375M1.375 11L11 20.625M1.375 11L11 1.375" stroke="#1E1E1E" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	)
}

export function IconePesquisa() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12.8 12.8L9.90005 9.89999M11.4667 6.13332C11.4667 9.07884 9.0789 11.4667 6.13338 11.4667C3.18786 11.4667 0.800049 9.07884 0.800049 6.13332C0.800049 3.1878 3.18786 0.799988 6.13338 0.799988C9.0789 0.799988 11.4667 3.1878 11.4667 6.13332Z" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	)
}

export function IconeCheck({ className }) {
	return (
		<svg className={className} width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M1.5 5.5L4.5 8.5L12.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export function BarraProgresso({ etapaAtual, totalEtapas }) {
	const passos = Array.from({ length: totalEtapas }, (_, i) => i + 1)

	return (
		<div className="app--progress-bar">
			{passos.map((passo, index) => {
				let statusClass = 'pending'
				if (passo < etapaAtual) statusClass = 'completed'
				if (passo === etapaAtual) statusClass = 'current'

				return (
					<div key={passo} className="app--progress-step-container">
						<div className={`app--progress-step ${statusClass}`}>
							{statusClass === 'completed' && <IconeCheck />}
						</div>
						{index < totalEtapas - 1 && (
							<div className={`app--progress-line ${passo < etapaAtual ? 'completed' : 'pending'}`} />
						)}
					</div>
				)
			})}
		</div>
	)
}

const eixosTematicosLista = [
	{ id: 1, label: "1. Saúde ambiental (ações de combate ao mosquito Aedes aegypti)" },
	{ id: 2, label: "2. Promoção da atividade física (práticas corporais)" },
	{ id: 3, label: "3. Alimentação saudável e prevenção da obesidade (antropometria)" },
	{ id: 4, label: "4. Promoção da cultura de paz e direitos humanos" },
	{ id: 5, label: "5. Prevenção das violências e dos acidentes" },
	{ id: 6, label: "6. Prevenção de doenças negligenciadas" },
	{ id: 7, label: "7. Verificação da situação vacinal" },
	{ id: 8, label: "8. Saúde sexual e reprodutiva e prevenção do HIV/IST" },
	{ id: 9, label: "9. Prevenção ao uso de álcool, tabaco e outras drogas" },
	{ id: 10, label: "10. Saúde bucal (aplicação tópica de flúor/ escovação supervisionada)" },
	{ id: 11, label: "11. Saúde auditiva" },
	{ id: 12, label: "12. Saúde ocular" },
	{ id: 13, label: "13. Prevenção à covid-19" },
	{ id: 14, label: "14. Cuidados com higiene pessoal" },
	{ id: 15, label: "15. Prevenção à toxoplasmose" }
]

const formatarData = (data) => {
	if (!data) return ''
	const partes = data.split('-')
	return `${partes[2]}/${partes[1]}/${partes[0]}`
}

function App() {
	
	// carrega as escolas mock do db.json
	const [escolas, setEscolas] = useState(db.escolas)
	
	// gerenciadores das escolas
	const [buscaEscola, setBuscaEscola] = useState('')
	const [escolaSelecionada, setEscolaSelecionada] = useState(null)
	
	// gerenciadores das turmas
	const [buscaTurma, setBuscaTurma] = useState('')
	const [turmaSelecionada, setTurmaSelecionada] = useState(null)
	
	// estado para controlar os alunos presentes
	const [alunosPresentes, setAlunosPresentes] = useState([])

	// estados do preenchimento do peso e altura
	const [alunoAtualIndex, setAlunoAtualIndex] = useState(0)
	const [dadosAlunos, setDadosAlunos] = useState({})
	const alunosSelecionados = turmaSelecionada?.alunos.filter(aluno => alunosPresentes.includes(aluno.id)) || []
	const alunoAtual = alunosSelecionados[alunoAtualIndex]
	
	// guarda a etapa do processo de preenchimento do registro
	// define a etapa para mostrar na tela
	const [etapa, setEtapa] = useState(1)

	// funcao para avancar etapa, tipo ir de colocar a data para escolher a escola
	const avancar = () => {
		setEtapa(etapa + 1)
	}

	// mesma coisa so que de ré
	const voltar = () => {
		if (etapa === 6) {
			setAlunoAtualIndex(0)
		}
		setEtapa(etapa - 1)
	}

	const valida = () => {
		setIsLoggedIn(true);
	}

	// geracao automatica do dia de hoje para mostrar no preenchimento
	// armazenamento da data da atividade
	const hoje = new Date()
	const [dia, setDia] = useState(String(hoje.getDate()).padStart(2, '0'))
	const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, '0'))
	const [ano, setAno] = useState(String(hoje.getFullYear()))

	// estado para controlar o render da tela inicial
	const [telaInicial, setTelaInicial] = useState(true)

	const [telaSenha, setTelaSenha] = useState(false);

	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const[telaAddEscola, setTelaEscola] = useState(false);

	const[telaAddAluno, setTelaAddAluno] = useState(false);

	// funcao para escolher as escolas que aparecem ao digitar algum nome na barra de pesquisa
	const escolasFiltradas = escolas.filter(escola =>
		escola.nome.toLowerCase().includes(buscaEscola.toLowerCase())
	)

	// funcao para escolher as turmas que aparecem ao digitar algum nome na barra de pesquisa
	const turmasFiltradas = escolaSelecionada?.turmas.filter(turma =>
		turma.nome.toLowerCase().includes(buscaTurma.toLowerCase())
	) || []

	// remove ou adiciona o aluno presente
	const toggleAluno = (idAluno) => {
		setAlunosPresentes(prev =>
			prev.includes(idAluno)
				? prev.filter(id => id !== idAluno)
				: [...prev, idAluno]
		)
	}

	// define todos alunos como presentes
	const iniciaTodosAlunosPresentes = () => {
		if (turmaSelecionada) {
			setAlunosPresentes(turmaSelecionada.alunos.map(aluno => aluno.id))
		}
	}

	// preenche dados peso altura
	const handleMudancaDados = (campo, valor) => {
		setDadosAlunos(prev => ({
			...prev,
			[alunoAtual.id]: {
				...prev[alunoAtual.id],
				[campo]: valor
			}
		}))
	}

	// vai ou volta na tela do peso altura
	const proximoAluno = () => {
		if (alunoAtualIndex < alunosSelecionados.length - 1) {
			setAlunoAtualIndex(alunoAtualIndex + 1)
		} else {
			avancar()
		}
	}
	const alunoAnterior = () => {
		if (alunoAtualIndex > 0) {
			setAlunoAtualIndex(alunoAtualIndex - 1)
		} else {
			voltar()
		}
	}

	// controle dos eixos selecionados
	const [eixosSelecionados, setEixosSelecionados] = useState([])
	const toggleEixo = (idEixo) => {
		setEixosSelecionados(prev =>
			prev.includes(idEixo)
				? prev.filter(id => id !== idEixo)
				: [...prev, idEixo]
		)
	}

	const renderizarConteudo = () => {
		if (telaInicial) {
			return (
				<div className='app--column app--tela-inicial'>
					<div className='app--tela-inicial-content'>
						<p className='app--title app--title__tela-inicial'>Relatório PSE<br />Online</p>
						<div className='app--buttonMain' onClick={() => setTelaInicial(false)}>
							<p>Gerar Relatório</p>
						</div>
					</div>
					<img src="/pseLogo1.png" alt="Logo PSE" className="app--logo-pse" />
				</div>
			)
		}
		
		else if (telaSenha) {
			return (
			<>
				<div className='app--input-group'>
					<div className='app--card'>
						<IconeVoltar className="icone-voltar" onClick={() => setTelaSenha(false)} />
						<div className='app--input-group'>
							<label>Digite seu email</label>
							<input type="text" />
						</div>
					</div>
				</div>
				
			</>	
			)
		}

		else if(telaAddEscola) {
			return(
		<>
			<div className='app--card'>
				<div className='app--input-group'>
					<IconeVoltar className="icone-voltar" onClick={() => setTelaEscola(false)} />
					<div className='app--input-group'>
						<label> Digite o nome da Escola </label>
							<input type='text' />
					<div className='app--buttonMain' onClick={() => setTelaEscola(false)}>
						<label> Cadastrar Escola </label>
						 </div>
					</div>
				</div>
			</div>
		</>
			)
		}

		else if(telaAddAluno) {
			return(
		<>
			<div className='app--card'>
				<div className='app--input-group'> 	
					<IconeVoltar className="icone-voltar" onClick={() => setTelaAddAluno(false)} />
				<div className='app--input-group' >
					<label> Nome </label>
						<input type="text" />
					<label> Idade </label>
						<input type="text"/>
					<label> Peso </label>
						<input type="text"/>
				<div className='app--buttonMain' OnClick={() => setTelaAddAluno(false)}>
					<label> Adicionar Aluno </label>
						</div>
					</div>
				</div>
			</div>
		</>
			)
		}

		else if (!isLoggedIn) {
			return (
				<>
					<p className='app--title app--title__tela-inicial'>Relatório PSE<br />Online</p>
					<div className='app--card'>
						<IconeVoltar className="icone-voltar" onClick={() => setTelaInicial(true)} />
						<p className='app--title'>Login</p>
						<p>Programa Saúde nas Escolas</p>
						<p>Santa Maria, RS</p>
						<div className='login--input-group'>
							<div className='app--input-group'>
								<label>Login</label>
								<input type="text" />
							</div>
							<div className='app--input-group'>
								<label>Senha</label>
								<input type="password" />
							</div>
						</div>
						<div className='app--footer'>
							<div className='app--buttonSecondary' onClick={() => setTelaSenha(true)}>
								<p>Esqueci a senha</p>
							</div>
							<div className='app--buttonMain' onClick={valida}>
								<p>Entrar</p>
							</div>
						</div>
					</div>
				</>
			)
		}

		else return (
			<>
				<div className='app--header-container'>
					<p className='app--header'>Geração de Relatório</p>
					<img src="/pseLogo2.png" alt="Logo" className="app--header-logo" />
				</div>
				<BarraProgresso etapaAtual={etapa} totalEtapas={6} />
				<div className='app--card'>
					{etapa === 1 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={() => setTelaInicial(true)} />
							<p className='app--title'>Digite a data da atividade:</p>
							<div className='app--date-group'>
								<input type="text" placeholder="DD" maxLength="2" className='app--date-input' value={dia} onChange={(e) => setDia(e.target.value)} />
								<input type="text" placeholder="MM" maxLength="2" className='app--date-input' value={mes} onChange={(e) => setMes(e.target.value)} />
								<input type="text" placeholder="AAAA" maxLength="4" className='app--date-input' value={ano} onChange={(e) => setAno(e.target.value)} />
							</div>
							<div className='app--footer'>
								<div className='app--buttonMain' onClick={avancar}>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 2 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Selecione sua escola:</p>

							<div className='app--search-container'>
								<div className='app--search-bar'>
									<input
										type="text"
										placeholder="Digite aqui para pesquisar"
										value={buscaEscola}
										onChange={(e) => setBuscaEscola(e.target.value)}
									/>
									<IconePesquisa />
								</div>
								<div className='app--search-list'>
									{escolasFiltradas.map((escola) => (
										<div
											key={escola.id}
											onClick={() => setEscolaSelecionada(escolaSelecionada?.id === escola.id ? null : escola)}
											className='app--search-list--unidade'
										>
											{escolaSelecionada?.id === escola.id ? <IconeCheck /> : <></>}
											{escola.nome}
										</div>
									))}
								</div>
							</div>

							<div className='app--footer'>
								<div className='app--buttonSecondary' onClick={() => setTelaEscola(true)}>
									<p>A escola não está na lista</p>
								</div>
								<div
									className={escolaSelecionada ? 'app--buttonMain' : 'app--buttonMain__disabled'}
									onClick={() => {
										if (escolaSelecionada) avancar()
									}}
								>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 3 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={() => {setTurmaSelecionada(null); voltar();}} />
							<p className='app--title'>Selecione sua turma:</p>

							<div className='app--search-container'>
								<div className='app--search-bar'>
									<input
										type="text"
										placeholder="Digite aqui para pesquisar"
										value={buscaTurma}
										onChange={(e) => setBuscaTurma(e.target.value)}
									/>
									<IconePesquisa />
								</div>
								<div className='app--search-list'>
									{turmasFiltradas.map((turma) => (
										<div
											key={turma.id}
											onClick={() => setTurmaSelecionada(turmaSelecionada?.id === turma.id ? null : turma)}
											className='app--search-list--unidade'
										>
											{turmaSelecionada?.id === turma.id ? <IconeCheck /> : <></>}
											{turma.nome}
										</div>
									))}
								</div>
							</div>

							<div className='app--footer'>
								<div
									className={turmaSelecionada ? 'app--buttonMain' : 'app--buttonMain__disabled'}
									onClick={() => {
										if (turmaSelecionada) avancar()
									}}
								>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 4 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Defina os eixos temáticos:</p>
							<div className='app--list'>
								{eixosTematicosLista.map((eixo) => (
									<label key={eixo.id}>
										<input
											type="checkbox"
											checked={eixosSelecionados.includes(eixo.id)}
											onChange={() => toggleEixo(eixo.id)}
										/>
										{eixo.label}
									</label>
								))}
							</div>
							<div className='app--footer'>
								<div className='app--buttonMain' onClick={() => {iniciaTodosAlunosPresentes(); avancar();}}>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 5 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Defina a lista de presença:</p>
							<div className='app--list'>
								{turmaSelecionada?.alunos.map((aluno) => (
										<label key={aluno.id}>
											<input
												type="checkbox"
												checked={alunosPresentes.includes(aluno.id)}
												onChange={() => toggleAluno(aluno.id)}
											/>
											<div className='app--list--aluno-nascimento'>
												{aluno.nome}
												<p className='app--list--aluno-nascimento--nascimento'>{formatarData(aluno.dataNascimento)}</p>
											</div>
										</label>
										
								))}
							</div>
							<div className='app--footer'>
								<div className='app--buttonSecondary' onClick={() => setTelaAddAluno(true)}>
									<p>Adicionar aluno manualmente</p>
								</div>
								<div
									className={alunosPresentes.length > 0 ? 'app--buttonMain' : 'app--buttonMain__disabled'}
									onClick={() => {
										if (alunosPresentes.length > 0) avancar()
									}}
								>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 6 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Preencha os dados de cada aluno:</p>

							<p className='app--contador'>{alunoAtualIndex + 1}/{alunosSelecionados.length}</p>

							<p className='app--nomeAluno'>{alunoAtual.nome}</p>

							<div className='app--input-group'>
								<label>Altura (cm)</label>
								<input
									type="number"
									placeholder="Digite aqui a altura"
									value={dadosAlunos[alunoAtual.id]?.altura || ''}
									onChange={(e) => handleMudancaDados('altura', e.target.value)}
								/>
							</div>

							<div className='app--input-group'>
								<label>Peso (kg)</label>
								<input
									type="number"
									placeholder="Digite aqui o peso"
									value={dadosAlunos[alunoAtual.id]?.peso || ''}
									onChange={(e) => handleMudancaDados('peso', e.target.value)}
								/>
							</div>

							<div className='app--dados-aluno--footer'>
								<IconeVoltar className="icone-voltar" onClick={alunoAnterior} />
								<div className='app--buttonMain' onClick={proximoAluno}>
									<p>{alunoAtualIndex === alunosSelecionados.length - 1 ? 'Avançar' : 'Próximo'}</p>
								</div>
							</div>
						</>
					)}
					{etapa === 7 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Tudo pronto!</p>

							<div className='app--footer'>
								<div className='app--buttonMain' onClick={avancar}>
									<p>Enviar Relatório</p>
								</div>
							</div>
						</>
					)}
				</div>
			</>
		)
	}

	return (
		<>
			<div className='app--background'>
				<div className='app--column'>
					{renderizarConteudo()}
				</div>
			</div>
		</>
	)
}

export default App
