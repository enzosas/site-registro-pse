import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import { formatarData, formatarDataHora } from '../../utils/formatadores';
import { TELAS } from '../../utils/constantes';

export function Etapa6Presenca() {
    const {
        alunosOrdenados,
        idsAlunosPresentes,
        toggleAluno,
        alternarPresencaTodos,
        todosEstaoPresentes,
        escolaSelecionada,
        avancarEtapa,
        voltarEtapa,
        setTelaAtiva,
    } = useRegistro();

    const temPresentes = idsAlunosPresentes.length > 0;
    const dataFormatada = formatarDataHora(escolaSelecionada?.atualizadoEm);

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={voltarEtapa}>
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
                    {(() => {
                        const gruposPorTurma = Object.entries(
                            alunosOrdenados.reduce((acc, aluno) => {
                                const turma = aluno.turmaNome || 'Sem turma';
                                if (!acc[turma]) acc[turma] = [];
                                acc[turma].push(aluno);
                                return acc;
                            }, {})
                        );
                        const temMultiplasTurmas = gruposPorTurma.length > 1;

                        return gruposPorTurma.map(([nomeTurma, alunosDaTurma]) => (
                            <div key={nomeTurma} className='app__list__bloco_interno_turma'>
                                {temMultiplasTurmas && (
                                    <p className='app__list__subtitle'>
                                        {nomeTurma}
                                    </p>
                                )}
                                {alunosDaTurma.map((aluno) => (
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
                        ));
                    })()}
                </div>
                {dataFormatada && (
                    <p className='app__tela-presenca__atualizado-em'>Lista atualizada em: {dataFormatada}</p>
                )}
                <div className='app__footer'>
                    <button
                        className='app__buttonSecondary'
                        onClick={() => setTelaAtiva(TELAS.ADD_ALUNO)}
                    >
                        <p>Adicionar aluno manualmente</p>
                    </button>
                    <button
                        className={'app__buttonMain'}
                        onClick={() => {
                            if (temPresentes) avancarEtapa();
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