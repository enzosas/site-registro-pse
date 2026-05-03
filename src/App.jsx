import { use } from 'react'
import './App.css'
import { useState } from 'react'

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

export function IconeCheck() {
	return (
		<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M1.5 5.5L4.5 8.5L12.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

function App() {

	// guarda a etapa do processo de preenchimento do registro
	// define a etapa para mostrar na tela
	const [etapa, setEtapa] = useState(1)

	// funcao para avancar etapa, tipo ir de colocar a data para escolher a escola
	const avancar = () => {
		setEtapa(etapa + 1)
	}

	// mesma coisa so que de ré
	const voltar = () => {
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
									<input type="text" placeholder="Digite aqui para pesquisar" />
									<IconePesquisa />
								</div>
								<div className='app--search-list'>
									<p>Escola 1</p>
									<p>Escola 2</p>
									<p>Escola 3</p>
									<p>Escola 4</p>
									<p>Escola 5</p>
									<p>Escola 6</p>
								</div>
							</div>

							<div className='app--footer'>
								<div className='app--buttonSecondary'>
									<p>A escola não está na lista</p>
								</div>
								<div className='app--buttonMain' onClick={avancar}>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 3 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Selecione sua turma:</p>

							<div className='app--search-container'>
								<div className='app--search-bar'>
									<input type="text" placeholder="Digite aqui para pesquisar" />
									<IconePesquisa />
								</div>
								<div className='app--search-list'>
									<p>Turma 21 2026</p>
									<p>Turma 22 2026</p>
									<p>Turma 31 2026</p>
									<p>Turma 32 2026</p>
									<p>Turma 33 2026</p>
								</div>
							</div>

							<div className='app--footer'>
								<div className='app--buttonMain' onClick={avancar}>
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
								<label>
									<input type="checkbox" />
									1. Saúde ambiental (ações de combate ao mosquito Aedes aegypti)
								</label>
								<label>
									<input type="checkbox" />
									2. Promoção da atividade física (práticas corporais)
								</label>
								<label>
									<input type="checkbox" />
									3. Alimentação saudável e prevenção da obesidade (antropometria)
								</label>
								<label>
									<input type="checkbox" />
									4. Promoção da cultura de paz e direitos humanos
								</label>
								<label>
									<input type="checkbox" />
									5. Prevenção das violências e dos acidentes
								</label>
								<label>
									<input type="checkbox" />
									6. Prevenção de doenças negligenciadas
								</label>
								<label>
									<input type="checkbox" />
									7. Verificação da situação vacinal
								</label>
								<label>
									<input type="checkbox" />
									8. Saúde sexual e reprodutiva e prevenção do HIV/IST
								</label>
								<label>
									<input type="checkbox" />
									9. Prevenção ao uso de álcool, tabaco e outras drogas
								</label>
								<label>
									<input type="checkbox" />
									10. Saúde bucal (aplicação tópica de flúor/ escovação supervisionada)
								</label>
								<label>
									<input type="checkbox" />
									11. Saúde auditiva
								</label>
								<label>
									<input type="checkbox" />
									12. Saúde ocular
								</label>
								<label>
									<input type="checkbox" />
									13. Prevenção à covid-19
								</label>
								<label>
									<input type="checkbox" />
									14. Cuidados com higiene pessoal
								</label>
								<label>
									<input type="checkbox" />
									15. Prevenção à toxoplasmose
								</label>
							</div>
							<div className='app--footer'>
								<div className='app--buttonMain' onClick={avancar}>
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
								<label>
									<input type="checkbox" />
									Aluno Importado 1
								</label>
								<label>
									<input type="checkbox" />
									Aluno Importado 2
								</label>
								<label>
									<input type="checkbox" />
									Aluno Importado 3
								</label>
								<label>
									<input type="checkbox" />
									Aluno Importado 4
								</label>
							</div>
							<div className='app--footer'>
								<div className='app--buttonSecondary'>
									<p>Adicionar aluno manualmente</p>
								</div>
								<div className='app--buttonMain' onClick={avancar}>
									<p>Avançar</p>
								</div>
							</div>
						</>
					)}
					{etapa === 6 && (
						<>
							<IconeVoltar className="icone-voltar" onClick={voltar} />
							<p className='app--title'>Preencha os dados de cada aluno:</p>

							<p className='app--contador'>1/5</p>

							<p className='app--nomeAluno'>Aluno Importado 1</p>

							<div className='app--input-group'>
								<label>Altura (cm)</label>
								<input type="text" placeholder="Digite aqui a altura" />
							</div>

							<div className='app--input-group'>
								<label>Peso (kg)</label>
								<input type="text" placeholder="Digite aqui a altura" />
							</div>

							<div className='app--dados-aluno--footer'>
								<IconeVoltar className="icone-voltar" onClick={voltar} />
								<div className='app--buttonMain' onClick={avancar}>
									<p>Próximo</p>
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
