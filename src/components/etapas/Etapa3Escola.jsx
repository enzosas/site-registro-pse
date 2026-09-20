import { IconeVoltar } from '../Icones';
import { SearchableList } from '../SearchableList';

export function Etapa3Escola({
    buscaEscola,
    setBuscaEscola,
    escolasFiltradas,
    escolaSelecionada,
    setEscolaSelecionada,
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

            <p className='app__title'>Selecione sua escola:</p>

            <SearchableList
                busca={buscaEscola}
                onBuscaChange={setBuscaEscola}
                itens={escolasFiltradas}
                itemSelecionado={escolaSelecionada}
                onSelecionarItem={setEscolaSelecionada}
            />

            <div className='app__footer'>
                <button className='app__buttonSecondary' onClick={onCadastroManual}>
                    <p>A escola não está na lista</p>
                </button>
                <button
                    className={'app__buttonMain'}
                    onClick={() => {
                        if (escolaSelecionada) onAvancar();
                    }}
                    disabled={!escolaSelecionada}
                >
                    <p>Avançar</p>
                </button>
            </div>
        </>
    );
}