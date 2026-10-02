import { IconeVoltar } from '../Icones';
import { SearchableMultiList } from '../SearchableMultiList';

export function Etapa4Turma({
    buscaTurma,
    setBuscaTurma,
    turmasFiltradas,
    turmasSelecionadas = [],
    toggleTurma,
    onAvancar,
    onVoltar,
    onCadastroManual,
}) {
    const temTurmasSelecionadas = turmasSelecionadas.length > 0;
    const temMultiplasTurmas = turmasSelecionadas.length > 1;

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Selecione as turmas em que foi realizada a atividade:</p>
            <SearchableMultiList
                busca={buscaTurma}
                onBuscaChange={setBuscaTurma}
                itens={turmasFiltradas}
                itensSelecionados={turmasSelecionadas}
                onToggleItem={toggleTurma}
            />
            <div className='app__footer'>
                <button className='app__buttonSecondary' onClick={onCadastroManual}>
                    <p>A turma não está na lista</p>
                </button>
                <button
                    className={'app__buttonMain'}
                    onClick={() => {
                        if (temTurmasSelecionadas) onAvancar();
                    }}
                    disabled={!temTurmasSelecionadas}
                >
                    {temMultiplasTurmas ? 'Avançar com múltiplas turmas' : 'Avançar'}
                </button>
            </div>
        </>
    );
}