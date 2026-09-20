import { IconeVoltar } from '../components/Icones';
import { formatarData } from '../utils/formatadores';

export function Etapa5Presenca({
    alunosOrdenados,
    idsAlunosPresentes,
    toggleAluno,
    alternarPresencaTodos,
    todosEstaoPresentes,
    onAdicionarAlunoManual,
    onAvancar,
    onVoltar,
}) {
    const temPresentes = idsAlunosPresentes.length > 0;

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app__title'>Selecione os alunos que participaram da ação:</p>

            <button
                className='app__buttonSecondary app__buttonSecondary__left-anchor'
                onClick={alternarPresencaTodos}
            >
                <p>{todosEstaoPresentes ? 'Desmarcar todos' : 'Marcar todos'}</p>
            </button>

            <div className='app__tela-com-lista__gap'>
                <div className='app__list'>
                    {alunosOrdenados.map((aluno) => (
                        <label key={aluno.id}>
                            <input
                                type="checkbox"
                                checked={idsAlunosPresentes.includes(aluno.id)}
                                onChange={() => toggleAluno(aluno.id)}
                            />
                            <div className='app__list__aluno-nascimento'>
                                {aluno.nome}
                                <p className='app__list__aluno-nascimento__nascimento'>
                                    {formatarData(aluno.dataNascimento)}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className='app__footer'>
                    <button className='app__buttonSecondary' onClick={onAdicionarAlunoManual}>
                        <p>Adicionar aluno manualmente</p>
                    </button>
                    <button
                        className={'app__buttonMain'}
                        onClick={() => {
                            if (temPresentes) onAvancar();
                        }}
                        disabled={!temPresentes}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </div>
        </>
    );
}