import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import { SearchableList } from '../SearchableList';
import { TELAS } from '../../utils/constantes';
import { useDados } from '../../context/DadosContext';
import { AvisoErro } from '../AvisoErro';

export function Etapa3Escola() {
    const {
        buscaEscola,
        setBuscaEscola,
        escolasFiltradas,
        escolaSelecionada,
        selecionarEscola,
        avancarEtapa,
        voltarEtapa,
        setTelaAtiva,
    } = useRegistro();
    const { erroDados, recarregarTodosDados } = useDados();

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={voltarEtapa}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Selecione sua escola:</p>
            <AvisoErro explicacao={erroDados} onTentarNovamente={recarregarTodosDados} emFundoBranco />
            <SearchableList
                busca={buscaEscola}
                onBuscaChange={setBuscaEscola}
                itens={escolasFiltradas}
                itemSelecionado={escolaSelecionada}
                onSelecionarItem={selecionarEscola}
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