import './App.css'

function App() {

	return (
		<>
			<div className='app--background'>
				<div className='app--column'>
					<p>Geração de Relatório</p>
					<div className='app--card'>
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
							<div className='app--buttonMain'>
								<p>Avançar</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default App
