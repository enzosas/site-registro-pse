import { IconeVoltar } from '../Icones';
import { formatarData, formatarDataHora } from '../../utils/formatadores';

export function Etapa6Presenca({
    alunosOrdenados,
    idsAlunosPresentes,
    toggleAluno,
    alternarPresencaTodos,
    todosEstaoPresentes,
    atualizadoEm,
    onAdicionarAlunoManual,
    onAvancar,
    onVoltar,
}) {
    const temPresentes = idsAlunosPresentes.length > 0;
    const dataFormatada = formatarDataHora(atualizadoEm);

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

                {dataFormatada && (
                    <p className='app__tela-presenca__atualizado-em'>Lista atualizada em: {dataFormatada}</p>
                )}

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