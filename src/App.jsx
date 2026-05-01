import './App.css'
import { useState } from 'react'

export function IconeVoltar({ onClick }) {
	return (
		<svg onClick={onClick} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function App() {

	const [etapa, setEtapa] = useState(1)

	const avancar = () => {
		setEtapa(etapa + 1)
	}

	const voltar = () => {
		setEtapa(etapa - 1)
	}


	return (
		<>
			<div className='app--background'>
				<div className='app--column'>
					<p className='app--header'>Geração de Relatório</p>
					<div className='app--card'>
						{etapa === 1 && (
							<>
								<IconeVoltar className="icone-voltar" onClick={voltar}/>
								<p className='app--title'>Digite a data de hoje:</p>
								<div className='app--date-group'>
									<input type="text" placeholder="DD" maxLength="2" className='app--date-input' />
									<input type="text" placeholder="MM" maxLength="2" className='app--date-input' />
									<input type="text" placeholder="AAAA" maxLength="4" className='app--date-input' />
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
										<p>Escola 7</p>
										<p>Escola 8</p>
									</div>
								</div>

								<div className='app--footer'>
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
						{etapa === 5 && (
							<>
								<IconeVoltar className="icone-voltar" onClick={voltar} />
								<p className='app--title'>Preencha os dados de cada aluno:</p>

								<div className='app--footer'>
									<div className='app--buttonMain' onClick={avancar}>
										<p>Avançar</p>
									</div>
								</div>
							</>
						)}
						{etapa === 6 && (
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
				</div>
			</div>
		</>
	)
}

export default App
