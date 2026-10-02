import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import { SearchableList } from '../SearchableList';
import { TELAS } from '../../utils/constantes';

export function Etapa3Escola() {
    const {
        buscaEscola,
        setBuscaEscola,
        escolasFiltradas,
        escolaSelecionada,
        setEscolaSelecionada,
        avancarEtapa,
        voltarEtapa,
        setTelaAtiva,
    } = useRegistro();

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={voltarEtapa}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Selecione sua escola:</p>
            <SearchableList
                busca={buscaEscola}
                onBuscaChange={setBuscaEscola}
                itens={escolasFiltradas}
                itemSelecionado={escolaSelecionada}
                onSelecionarItem={setEscolaSelecionada}
            />
            <div className='app__footer'>
                <button
                    className='app__buttonSecondary'
                    onClick={() => setTelaAtiva(TELAS.CADASTRO_MANUAL)}
                >
                    <p>A escola não está na lista</p>
                </button>
                <button
                    className={'app__buttonMain'}
                    onClick={() => {
                        if (escolaSelecionada) avancarEtapa();
                    }}
                    disabled={!escolaSelecionada}
                >
                    <p>Avançar</p>
                </button>
            </div>
        </>
    );
}