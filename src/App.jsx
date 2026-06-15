import { use } from 'react'
import './App.css'
import { useState, useRef } from 'react'
import db from './db.json'
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioPDF } from './RelatorioPDF';
import { supabase } from './supabase';

export function IconeVoltar() {
	return (
		<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M20.625 11H1.375M1.375 11L11 20.625M1.375 11L11 1.375" stroke="#1E1E1E" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export function IconePesquisa() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12.8 12.8L9.90005 9.89999M11.4667 6.13332C11.4667 9.07884 9.0789 11.4667 6.13338 11.4667C3.18786 11.4667 0.800049 9.07884 0.800049 6.13332C0.800049 3.1878 3.18786 0.799988 6.13338 0.799988C9.0789 0.799988 11.4667 3.1878 11.4667 6.13332Z" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export function IconeCheck({ className, bold = false }) {
	return (
		<svg className={className} width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M1.5 5.5L4.5 8.5L12.5 1.5" stroke="currentColor" strokeWidth={bold ? "3" : "1.5"} strokeLinecap="round" strokeLinejoin="round"
			/>
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
							{statusClass === 'completed' && <IconeCheck bold/>}
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
	return data
}

function App() {

	// carrega as escolas mock do db.json
	const [escolas, setEscolas] = useState([])

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

	// funcao para buscar o json com as turmas no supabase
	const buscarDados = async () => {
		const { data, error } = await supabase
			.from('dados')
			.select('json')
			.eq('id', 1)
			.single()

		if (error) {
			console.error("Erro ao buscar dados do Supabase:", error)
		} else {
			setEscolas(data.json.escolas)
		}
	}

	const [loginInput, setLoginInput] = useState('')
	const [senhaInput, setSenhaInput] = useState('')
	const [erroLogin, setErroLogin] = useState(false)
	const [mensagemErro, setMensagemErro] = useState('')

	const validaLogin = async (e) => {
		if (e) e.preventDefault()
		setMensagemErro('')

		const { data, error } = await supabase.auth.signInWithPassword({
			email: loginInput,
			password: senhaInput,
		})

		if (error) {
			if (error.status === 400 || error.message.includes('Invalid login credentials')) {
				setMensagemErro('credenciais inválidas')
			} else if (error.status >= 500) {
				setMensagemErro('servidor fora do ar. tente novamente mais tarde')
			} else {
				setMensagemErro('erro de conexão. verifique sua internet')
			}
		} else {
			setIsLoggedIn(true)
			setMensagemErro('')
			buscarDados()
		}
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

	const [telaAddEscola, setTelaEscola] = useState(false);

	const [telaAddAluno, setTelaAddAluno] = useState(false);

	// funcao para escolher as escolas que aparecem ao digitar algum nome na barra de pesquisa
	const escolasFiltradas = escolas
		.filter(escola => escola.nome.toLowerCase().includes(buscaEscola.toLowerCase()))
		.sort((a, b) => a.nome.localeCompare(b.nome))

	// funcao para escolher as turmas que aparecem ao digitar algum nome na barra de pesquisa
	const turmasFiltradas = escolaSelecionada?.turmas
		.filter(turma => turma.nome.toLowerCase().includes(buscaTurma.toLowerCase()))
		.sort((a, b) => a.nome.localeCompare(b.nome)) || []

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
			setTimeout(() => {
				if (alturaInputRef.current) alturaInputRef.current.focus()
			}, 10)
		} else {
			avancar()
		}
	}
	const alunoAnterior = () => {
		if (alunoAtualIndex > 0) {
			setAlunoAtualIndex(alunoAtualIndex - 1)
			setTimeout(() => {
				if (alturaInputRef.current) alturaInputRef.current.focus()
			}, 10)
		} else {
			voltar()
		}
	}
	const pularPreenchimentoPesoAltura = () => {
		avancar()
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

	// variaveis para armazenar temporariamente dados do novo aluno
	const [novoAlunoNome, setNovoAlunoNome] = useState('')
	const [novoAlunoDataNascimento, setNovoAlunoDataNascimento] = useState('')

	// escreve se o aluno foi adicionado ao clicar
	const [alunoAdicionadoAnim, setAlunoAdicionadoAnim] = useState(false)

	// cria a referência para o campo de nome
	const nomeInputRef = useRef(null)

	// cria a referência para o campo de altura
	const alturaInputRef = useRef(null)

	// funcao para adicionar novo aluno
	const handleAdicionarAluno = () => {
		if (!novoAlunoNome || !turmaSelecionada) return

		const dataFormatada = novoAlunoDataNascimento
		const novoAlunoId = Date.now()
		const novoAluno = {
			id: novoAlunoId,
			nome: novoAlunoNome,
			dataNascimento: dataFormatada
		}

		setTurmaSelecionada(prev => ({
			...prev,
			alunos: [...prev.alunos, novoAluno]
		}))
		setAlunosPresentes(prev => [...prev, novoAlunoId])

		setNovoAlunoNome('')
		setNovoAlunoDataNascimento('')

		setAlunoAdicionadoAnim(true)
		setTimeout(() => setAlunoAdicionadoAnim(false), 2000)
		setTimeout(() => {
			if (nomeInputRef.current) {
				nomeInputRef.current.focus()
			}
		}, 10)
	}
	// variaveis para definicao manual do nome da escola e turma
	const [telaCadastroManual, setTelaCadastroManual] = useState(false)
	const [escolaManual, setEscolaManual] = useState('')
	const [turmaManual, setTurmaManual] = useState('')

	const handleSalvarManual = () => {
		setEscolaSelecionada({ id: 'manual_escola', nome: escolaManual, turmas: [] })
		setTurmaSelecionada({ id: 'manual_turma', nome: turmaManual, alunos: [] })
		setAlunosPresentes([])
		setEtapa(4)
		setTelaCadastroManual(false)
	}

	const obterRelatorioJSON = () => {
		return {
			data: `${dia}/${mes}/${ano}`,
			escola: escolaSelecionada?.nome || '',
			turma: turmaSelecionada?.nome || '',
			eixosTematicos: eixosTematicosLista
				.filter(eixo => eixosSelecionados.includes(eixo.id))
				.map(eixo => eixo.label),
			alunosPresentes: (turmaSelecionada?.alunos || [])
				.filter(aluno => alunosPresentes.includes(aluno.id))
				.map(aluno => ({
					id: aluno.id,
					nome: aluno.nome,
					dataNascimento: aluno.dataNascimento,
					altura: dadosAlunos[aluno.id]?.altura || null,
					peso: dadosAlunos[aluno.id]?.peso || null
				}))
		}
	}

	// controla render tela resumo final
	const [telaResumo, setTelaResumo] = useState(false)

	// controla erro de area de transferencia
	const [copiado, setCopiado] = useState(false)

	const handleCopiarResumo = async () => {
		const dados = obterRelatorioJSON()
		const linhas = [
			'Resumo da Visita',
			'',
			`Escola: ${dados.escola}`,
			`Turma: ${dados.turma}`,
			`Data: ${dados.data}`,
			'',
			'Eixos Selecionados:',
			...dados.eixosTematicos.map(eixo => `- ${eixo}`),
			'',
			'Alunos:'
		]

		dados.alunosPresentes.forEach(aluno => {
			let linhaAluno = `- ${aluno.nome} (${formatarData(aluno.dataNascimento)})`
			if (aluno.peso || aluno.altura) {
				const antropometria = []
				if (aluno.peso) antropometria.push(`${aluno.peso}kg`)
				if (aluno.altura) antropometria.push(`${aluno.altura}cm`)
				linhaAluno += ` [${antropometria.join(' - ')}]`
			}
			linhas.push(linhaAluno)
		})

		try {
			await navigator.clipboard.writeText(linhas.join('\n'))
			setCopiado(true)
			setTimeout(() => setCopiado(false), 2000)
		} catch (erro) {
			console.error('Erro ao copiar', erro)
		}
	}

	const formatarNome = (nome) => {
		const siglas = ['EMEF', 'EMEI', 'EE', 'CMEI']
		const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e']
		const regexRomano = /^(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)$/i

		return nome
			.toLowerCase()
			.split(' ')
			.map((palavra, index) => {
				const palavraMaiuscula = palavra.toUpperCase()

				if (siglas.includes(palavraMaiuscula) || regexRomano.test(palavra)) {
					return palavraMaiuscula
				}

				if (preposicoes.includes(palavra) && index !== 0) {
					return palavra
				}

				return palavra.charAt(0).toUpperCase() + palavra.slice(1)
			})
			.join(' ')
	}

	const renderizarConteudo = () => {
		if (telaInicial) {
			return (
				<div className='app--column app--tela-inicial'>
					<div className='app--tela-inicial-content'>
						<p className='app--title app--title__tela-inicial'>Relatório PSE<br />Online</p>
						<button className='app--buttonMain' onClick={() => setTelaInicial(false)}>
							<p>Gerar Relatório</p>
						</button>
					</div>
					<img src={`${import.meta.env.BASE_URL}pseLogo1.png`} alt="Logo PSE" className="app--logo-pse" />
				</div>
			)
		}

		else if (telaSenha) {
			return (
				<>
					<div className='app--input-group'>
						<div className='app--card'>
							<button type="button" className="app--botao-voltar" onClick={() => setTelaSenha(false)}>
								<IconeVoltar />
							</button>
							<div className='app--input-group'>
								<label>Digite seu email</label>
								<input type="text" />
							</div>
						</div>
					</div>

				</>
			)
		}

		else if (telaAddEscola) {
			return (
				<>
					<div className='app--card'>
						<div className='app--input-group'>
							<button type="button" className="app--botao-voltar" onClick={() => setTelaEscola(false)}>
								<IconeVoltar />
							</button>
							<div className='app--input-group'>
								<label> Digite o nome da Escola </label>
								<input type='text' />
								<button className='app--buttonMain' onClick={() => setTelaEscola(false)}>
									<label> Cadastrar Escola </label>
								</button>
							</div>
						</div>
					</div>
				</>
			)
		}

		else if (telaCadastroManual) {
			return (
				<>
					<div className='app--header-container'>
						<p className='app--header'>Geração de Relatório</p>
						<img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app--header-logo" />
					</div>
					<BarraProgresso etapaAtual={etapa} totalEtapas={6} />
					<form
						className='app--card'
						onSubmit={(e) => {
							e.preventDefault();
							if (!escolaManual.trim() || !turmaManual.trim()) return;
							handleSalvarManual();
						}}
					>
						<button type="button" className="app--botao-voltar" onClick={() => setTelaCadastroManual(false)}>
							<IconeVoltar />
						</button>
						<p className='app--title'>Cadastro Manual</p>
						<div className='app--input-group'>
							<label> Nome da Escola </label>
							<input type='text' value={escolaManual} onChange={(e) => setEscolaManual(e.target.value)} />
						</div>
						<div className='app--input-group'>
							<label> Nome da Turma </label>
							<input type='text' value={turmaManual} onChange={(e) => setTurmaManual(e.target.value)} />
						</div>
						<div className='app--footer'>
							<button
								type="submit"
								className={(!escolaManual.trim() || !turmaManual.trim()) ? 'app--buttonMain__disabled' : 'app--buttonMain'}
								disabled={!escolaManual.trim() || !turmaManual.trim()}
							>
								<p>Avançar</p>
							</button>
						</div>
					</form>
				</>
			)
		}

		else if (telaAddAluno) {
			return (
				<>
					<div className='app--header-container'>
						<p className='app--header'>Geração de Relatório</p>
						<img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app--header-logo" />
					</div>
					<BarraProgresso etapaAtual={etapa} totalEtapas={6} />
					<form
						className='app--card'
						onSubmit={(e) => {
							e.preventDefault();
							if (!novoAlunoNome.trim() || !novoAlunoDataNascimento.trim()) return;
							handleAdicionarAluno();
						}}
					>
						<button type="button" className="app--botao-voltar" onClick={() => setTelaAddAluno(false)}>
							<IconeVoltar />
						</button>
						<p className='app--title'>Adicionar aluno</p>
						<div className='app--input-group'>
							<label>Nome</label>
							<input
								ref={nomeInputRef}
								type="text"
								value={novoAlunoNome}
								onChange={(e) => setNovoAlunoNome(e.target.value)}
								placeholder="Digite aqui o nome completo"
							/>
						</div>
						<div className='app--input-group'>
							<label>Data de Nascimento</label>
							<input
								type="text"
								value={novoAlunoDataNascimento}
								onChange={(e) => setNovoAlunoDataNascimento(e.target.value)}
								placeholder="DD/MM/AAAA"
							/>
						</div>
						<div className='app--footer'>
							<button
								type="submit"
								className={!novoAlunoNome.trim() || !novoAlunoDataNascimento.trim() ? 'app--buttonMain__disabled' : 'app--buttonMain'}
								disabled={!novoAlunoNome.trim() || !novoAlunoDataNascimento.trim()}
							>
								<p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
									{alunoAdicionadoAnim ? 'Aluno Adicionado' : 'Adicionar Aluno'}
									{alunoAdicionadoAnim && <IconeCheck bold />}
								</p>
							</button>
						</div>
					</form>
				</>
			)
		}

		else if (!isLoggedIn) {
			return (
				<>
					<p className='app--title app--title__tela-inicial'>Relatório PSE<br />Online</p>
					<form onSubmit={validaLogin} className='app--card'>
						<button type="button" className="app--botao-voltar" onClick={() => { setTelaInicial(true); setErroLogin(false); }}>
							<IconeVoltar />
						</button>
						<p className='app--title'>Login</p>
						<p>Programa Saúde nas Escolas</p>
						<p>Santa Maria, RS</p>
						<div className='login--input-group'>
							<div className='app--input-group'>
								<label>login</label>
								<input
									type="text"
									value={loginInput}
									onChange={(e) => setLoginInput(e.target.value)}
								/>
							</div>
							<div className='app--input-group'>
								<label>senha</label>
								<input
									type="password"
									value={senhaInput}
									onChange={(e) => setSenhaInput(e.target.value)}
								/>
							</div>
							{mensagemErro && <p style={{ color: 'red', marginTop: '10px' }}>{mensagemErro}</p>}
						</div>
						<div className='app--footer'>
							<button type="button" className='app--buttonSecondary' onClick={() => setTelaSenha(true)}>
								<p>Esqueci a senha</p>
							</button>

							<button type="submit" className='app--buttonMain'>
								<p>Entrar</p>
							</button>
						</div>
					</form>
				</>
			)
		}

		else if (telaResumo) {
			const dados = obterRelatorioJSON()
			return (
				<>
					<div className='app--header-container'>
						<p className='app--header'>Geração de Relatório</p>
						<img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app--header-logo" />
					</div>
					<BarraProgresso etapaAtual={etapa} totalEtapas={6} />
					<div className='app--card'>
						<button type="button" className="app--botao-voltar" onClick={() => setTelaResumo(false)}>
							<IconeVoltar />
						</button>
						<p className='app--title'>Resumo da Visita</p>


						<div className='app--resumo'>
							<p className='app--resumo--subtitle'>Escola</p>
							<p>{dados.escola}</p>
						</div>
						<div className='app--resumo'>
							<p className='app--resumo--subtitle'>Turma</p>
							<p>{dados.turma}</p>
						</div>
						<div className='app--resumo'>
							<p className='app--resumo--subtitle'>Data</p>
							<p>{dados.data}</p>
						</div>
						<div className='app--resumo'>
							<p className='app--resumo--subtitle'>Eixos Selecionados</p>
							<>
								{dados.eixosTematicos.map((eixo, index) => (
									<p key={index}>{eixo}</p>
								))}
							</>
						</div>
						<div className='app--resumo'>
							<p className='app--resumo--subtitle'>Alunos</p>
							<div className='app--resumo'>
								{dados.alunosPresentes.map((aluno) => (
									<div key={aluno.id} className='app--resumo'>
											<span>{aluno.nome} - </span>
											<span className=''> {formatarData(aluno.dataNascimento)}</span>
										{(aluno.peso || aluno.altura) && (
											<>
												{aluno.peso && <span> {aluno.peso}kg</span>}
												{aluno.altura && <span> {aluno.altura}cm</span>}
											</>
										)}
									</div>
								))}
							</div>
						</div>
						<div className='app--footer'>
							<button className='app--buttonMain' onClick={() => {
								const dadosJSON = obterRelatorioJSON()
								console.log(JSON.stringify(dadosJSON, null, 2))
								handleCopiarResumo();
							}}>
								<p>{copiado ? 'Copiado!' : 'Copiar Resumo'}</p>
							</button>
						</div>
					</div>
				</>
			)
		}

		else return (
			<>
				<div className='app--header-container'>
					<p className='app--header'>Geração de Relatório</p>
					<img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app--header-logo" />
				</div>
				<BarraProgresso etapaAtual={etapa} totalEtapas={6} />
				<div className='app--card'>
					{etapa === 1 && (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								// trava de segurança para o enter não enviar se faltar dados
								if (!dia.trim() || !mes.trim() || !ano.trim()) return;
								avancar();
							}}
							style={{ display: 'contents' }}
						>
							<button type="button" className="app--botao-voltar" onClick={() => setTelaInicial(true)}>
								<IconeVoltar />
							</button>
							<p className='app--title'>Digite a data da atividade:</p>
							<div className='app--date-group'>
								<input
									type="text"
									placeholder="DD"
									maxLength="2"
									className='app--date-input'
									value={dia}
									onChange={(e) => setDia(e.target.value)}
								/>
								<input
									type="text"
									placeholder="MM"
									maxLength="2"
									className='app--date-input'
									value={mes}
									onChange={(e) => setMes(e.target.value)}
								/>
								<input
									type="text"
									placeholder="AAAA"
									maxLength="4"
									className='app--date-input'
									value={ano}
									onChange={(e) => setAno(e.target.value)}
								/>
							</div>
							<div className='app--footer'>
								<button
									type="submit"
									className={(!dia.trim() || !mes.trim() || !ano.trim()) ? 'app--buttonMain__disabled' : 'app--buttonMain'}
									disabled={!dia.trim() || !mes.trim() || !ano.trim()}
								>
									<p>Avançar</p>
								</button>
							</div>
						</form>
					)}
					{etapa === 2 && (
						<>
							<button type="button" className="app--botao-voltar" onClick={voltar}>
								<IconeVoltar />
							</button>
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
											{formatarNome(escola.nome)}
										</div>
									))}
								</div>
							</div>

							<div className='app--footer'>
								<button className='app--buttonSecondary' onClick={() => setTelaCadastroManual(true)}>
									<p>A escola não está na lista</p>
								</button>
								<button
									className={escolaSelecionada ? 'app--buttonMain' : 'app--buttonMain__disabled'}
									onClick={() => {
										if (escolaSelecionada) avancar()
									}}
								>
									<p>Avançar</p>
								</button>
							</div>
						</>
					)}
					{etapa === 3 && (
						<>
							<button type="button" className="app--botao-voltar" onClick={() => {setTurmaSelecionada(null); voltar(); }}>
								<IconeVoltar />
							</button>
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
											{formatarNome(turma.nome)}
										</div>
									))}
								</div>
							</div>

							<div className='app--footer'>
								<button className='app--buttonSecondary' onClick={() => setTelaCadastroManual(true)}>
									<p>A turma não está na lista</p>
								</button>
								<button
									className={turmaSelecionada ? 'app--buttonMain' : 'app--buttonMain__disabled'}
									onClick={() => {
										if (turmaSelecionada) avancar()
									}}
								>
									<p>Avançar</p>
								</button>
							</div>
						</>
					)}
					{etapa === 4 && (
						<>
							<button type="button" className="app--botao-voltar" onClick={voltar}>
								<IconeVoltar />
							</button>
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
								<button
									className={eixosSelecionados.length === 0 ? 'app--buttonMain__disabled' : 'app--buttonMain'}
									onClick={() => { iniciaTodosAlunosPresentes(); avancar(); }}
									disabled={eixosSelecionados.length === 0}
								>
									<p>Avançar</p>
								</button>
							</div>
						</>
					)}
					{etapa === 5 && (
						<>
							<button type="button" className="app--botao-voltar" onClick={voltar}>
								<IconeVoltar />
							</button>
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
								<button className='app--buttonSecondary' onClick={() => setTelaAddAluno(true)}>
									<p>Adicionar aluno manualmente</p>
								</button>
								<button
									className={alunosPresentes.length > 0 ? 'app--buttonMain' : 'app--buttonMain__disabled'}
									onClick={() => {
										if (alunosPresentes.length > 0) avancar()
									}}
								>
									<p>Avançar</p>
								</button>
							</div>
						</>
					)}
					{etapa === 6 && (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								proximoAluno();
							}}
							style={{ display: 'contents' }}
						>
							<button type="button" className="app--botao-voltar" onClick={voltar}>
								<IconeVoltar />
							</button>
							<p className='app--title'>Preencha os dados de cada aluno:</p>

							<p className='app--contador'>{alunoAtualIndex + 1}/{alunosSelecionados.length}</p>

							<p className='app--nomeAluno'>{alunoAtual.nome}</p>

							<div className='app--input-group'>
								<label>Altura (cm)</label>
								<input
									ref={alturaInputRef}
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

							<div className='app--footer'>
								{alunoAtualIndex == 0 && (
									<button type="button" className='app--buttonSecondary' onClick={() => pularPreenchimentoPesoAltura()}>
										<p>Pular preenchimento de dados antropométricos</p>
									</button>
								)}
								<div className='app--dados-aluno--footer'>
									<button type="button" className="app--botao-voltar" onClick={alunoAnterior}>
										<IconeVoltar />
									</button>
									<button type="submit" className='app--buttonMain'>
										<p>{alunoAtualIndex === alunosSelecionados.length - 1 ? 'Avançar' : 'Próximo'}</p>
									</button>
								</div>
							</div>
						</form>
					)}
					{etapa === 7 && (
						<>
							<button type="button" className="app--botao-voltar" onClick={voltar}>
								<IconeVoltar />
							</button>
							<p className='app--title'>Tudo pronto!</p>

							<div className='app--footer'>
								<button className='app--buttonMain' onClick={() => setTelaResumo(true)}>
									<p>Ver resumo</p>
								</button>
								<PDFDownloadLink
									document={<RelatorioPDF dados={obterRelatorioJSON()} />}
									fileName={`Relatorio_PSE_${dia}_${mes}_${ano}.pdf`}
									style={{ textDecoration: 'none', display: 'block', width: '100%' }}
								>
									{({ loading }) => (
										<button className='app--buttonMain'>
											<p>Gerar Relatório PDF</p>
										</button>
									)}
								</PDFDownloadLink>
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
