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
            <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app--title'>Selecione a turma em que foi realizada a atividade:</p>

            <SearchableList
                busca={buscaTurma}
                onBuscaChange={setBuscaTurma}
                itens={turmasFiltradas}
                itemSelecionado={turmaSelecionada}
                onSelecionarItem={setTurmaSelecionada}
                formatarNome={formatarNome}
            />

            <div className='app--footer'>
                <button className='app--buttonSecondary' onClick={onCadastroManual}>
                    <p>A turma não está na lista</p>
                </button>
                <button
                    className={turmaSelecionada ? 'app--buttonMain' : 'app--buttonMain__disabled'}
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