import { IconeVoltar } from '../components/Icones';
import { SearchableList } from '../components/SearchableList';

export function Etapa3Turma({
    buscaTurma,
    setBuscaTurma,
    turmasFiltradas,
    turmaSelecionada,
    setTurmaSelecionada,
    formatarNome,
    onAvancar,
    onVoltar,
    onCadastroManual,
}) {
    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app__title'>Selecione a turma em que foi realizada a atividade:</p>

            <SearchableList
                busca={buscaTurma}
                onBuscaChange={setBuscaTurma}
                itens={turmasFiltradas}
                itemSelecionado={turmaSelecionada}
                onSelecionarItem={setTurmaSelecionada}
                formatarNome={formatarNome}
            />

            <div className='app__footer'>
                <button className='app__buttonSecondary' onClick={onCadastroManual}>
                    <p>A turma não está na lista</p>
                </button>
                <button
                    className={'app__buttonMain'}
                    onClick={() => {
                        if (turmaSelecionada) onAvancar();
                    }}
                    disabled={!turmaSelecionada}
                >
                    <p>Avançar</p>
                </button>
            </div>
        </>
    );
}