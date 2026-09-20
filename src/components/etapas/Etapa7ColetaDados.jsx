import { IconeVoltar } from '../Icones';
import { OpcaoBinariaGroup } from '../OpcaoBinariaGroup';
import * as Constantes from '../../constantes';

export function Etapa7ColetaDados({
    alunoAtualIndex,
    alunosPresentes,
    alunoAtual,
    dadosAlunos,
    handleAtualizarDadosAluno,
    temAntropometria,
    temVacinacao,
    temSaudeOcular,
    alturaInputRef,
    mostrarAlunosPendentes,
    obterAlunosPendentes,
    onSelecionarAlunoPendente,
    onProximo,
    onAnterior,
    onVoltar,
}) {
    const isUltimoAluno = alunoAtualIndex === alunosPresentes.length - 1;
    const pendentes = obterAlunosPendentes();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onProximo();
            }}
            style={{ display: 'contents' }}
        >
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app__title'>Preencha os dados de cada aluno:</p>
            <p className='app__contador'>
                {alunoAtualIndex + 1}/{alunosPresentes.length}
            </p>
            <p className='app__nomeAluno'>{alunoAtual?.nome || ''}</p>

            {alunoAtual && temAntropometria && (
                <>
                    <div className='app__input-group'>
                        <label>Altura (cm)</label>
                        <input
                            ref={alturaInputRef}
                            type="number"
                            placeholder="Digite aqui a altura"
                            value={dadosAlunos[alunoAtual.id]?.altura || ''}
                            onChange={(e) => handleAtualizarDadosAluno('altura', e.target.value)}
                        />
                    </div>
                    <div className='app__input-group'>
                        <label>Peso (kg)</label>
                        <input
                            type="number"
                            placeholder="Digite aqui o peso"
                            value={dadosAlunos[alunoAtual.id]?.peso || ''}
                            onChange={(e) => handleAtualizarDadosAluno('peso', e.target.value)}
                        />
                    </div>
                </>
            )}

            {temVacinacao && alunoAtual && (
                <OpcaoBinariaGroup
                    label="Situação do esquema vacinal:"
                    opcoes={Constantes.OPCOES_VACINACAO}
                    valorAtual={dadosAlunos[alunoAtual.id]?.vacinado}
                    onChange={(novoValor) => handleAtualizarDadosAluno('vacinado', novoValor)}
                />
            )}

            {temSaudeOcular && alunoAtual && (
                <OpcaoBinariaGroup
                    label="Avaliação da saúde ocular:"
                    opcoes={Constantes.OPCOES_SAUDE_OCULAR}
                    valorAtual={dadosAlunos[alunoAtual.id]?.saudeOcular}
                    onChange={(novoValor) => handleAtualizarDadosAluno('saudeOcular', novoValor)}
                />
            )}

            <div className='app__footer'>
                {mostrarAlunosPendentes && pendentes.length > 0 && (
                    <>
                        <div className='app__tela-vacinacao__pendentes'>
                            Os seguintes alunos estão com dados faltando:
                        </div>
                        {pendentes.map((aluno) => (
                            <div
                                key={aluno.id}
                                onClick={() => onSelecionarAlunoPendente(aluno.id)}
                            >
                                <span className='app__tela-vacinacao__pendentes'>{aluno.nome}</span>
                            </div>
                        ))}
                    </>
                )}

                <div className='app__dados-aluno__footer'>
                    <button type="button" className="app__botao-voltar" onClick={onAnterior}>
                        <IconeVoltar />
                    </button>
                    <button type="submit" className='app__buttonMain'>
                        <p>{isUltimoAluno ? 'Avançar' : 'Próximo'}</p>
                    </button>
                </div>
            </div>
        </form>
    );
}