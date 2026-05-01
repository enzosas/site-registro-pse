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
								<IconeVoltar className="icone-voltar" onClick={voltar} />
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
								<p className='app--title'>Defina o eixo temático:</p>
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
				</div>
			</div>
		</>
	)
}

export default App
