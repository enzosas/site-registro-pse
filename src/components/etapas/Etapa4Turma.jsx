import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import { SearchableMultiList } from '../SearchableMultiList';
import { TELAS } from '../../utils/constantes';

export function Etapa4Turma() {
    const {
        buscaTurma,
        setBuscaTurma,
        turmasFiltradas,
        turmaSelecionada,
        setTurmaSelecionada,
        toggleTurma,
        avancarEtapa,
        voltarEtapa,
        setTelaAtiva,
    } = useRegistro();

    const temTurmasSelecionadas = turmaSelecionada.length > 0;
    const temMultiplasTurmas = turmaSelecionada.length > 1;

    return (
        <>
            <button
                type="button"
                className="app__botao-voltar"
                onClick={() => {
                    setTurmaSelecionada([]);
                    voltarEtapa();
                }}
            >
                <IconeVoltar />
            </button>
            <p className='app__title'>Selecione as turmas em que foi realizada a atividade:</p>
            <SearchableMultiList
                busca={buscaTurma}
                onBuscaChange={setBuscaTurma}
                itens={turmasFiltradas}
                itensSelecionados={turmaSelecionada}
                onToggleItem={toggleTurma}
            />
            <div className='app__footer'>
                <button
                    className='app__buttonSecondary'
                    onClick={() => setTelaAtiva(TELAS.CADASTRO_MANUAL)}
                >
                    <p>A turma não está na lista</p>
                </button>
                <button
                    className={'app__buttonMain'}
                    onClick={() => {
                        if (temTurmasSelecionadas) avancarEtapa();
                    }}
                    disabled={!temTurmasSelecionadas}
                >
                    {temMultiplasTurmas ? 'Avançar com múltiplas turmas' : 'Avançar'}
                </button>
            </div>
        </>
    );
}