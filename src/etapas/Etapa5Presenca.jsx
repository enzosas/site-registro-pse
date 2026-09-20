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
            <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app--title'>Selecione os alunos que participaram da ação:</p>

            <button
                className='app--buttonSecondary app--buttonSecondary__left-anchor'
                onClick={alternarPresencaTodos}
            >
                <p>{todosEstaoPresentes ? 'Desmarcar todos' : 'Marcar todos'}</p>
            </button>

            <div className='app--tela-com-lista--gap'>
                <div className='app--list'>
                    {alunosOrdenados.map((aluno) => (
                        <label key={aluno.id}>
                            <input
                                type="checkbox"
                                checked={idsAlunosPresentes.includes(aluno.id)}
                                onChange={() => toggleAluno(aluno.id)}
                            />
                            <div className='app--list--aluno-nascimento'>
                                {aluno.nome}
                                <p className='app--list--aluno-nascimento--nascimento'>
                                    {formatarData(aluno.dataNascimento)}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className='app--footer'>
                    <button className='app--buttonSecondary' onClick={onAdicionarAlunoManual}>
                        <p>Adicionar aluno manualmente</p>
                    </button>
                    <button
                        className={'app--buttonMain'}
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