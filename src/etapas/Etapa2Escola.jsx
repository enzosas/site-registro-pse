import { IconeVoltar } from '../components/Icones';
import { SearchableList } from '../components/SearchableList';

export function Etapa2Escola({
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
            <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app--title'>Selecione sua escola:</p>

            <SearchableList
                busca={buscaEscola}
                onBuscaChange={setBuscaEscola}
                itens={escolasFiltradas}
                itemSelecionado={escolaSelecionada}
                onSelecionarItem={setEscolaSelecionada}
                formatarNome={formatarNome}
            />

            <div className='app--footer'>
                <button className='app--buttonSecondary' onClick={onCadastroManual}>
                    <p>A escola não está na lista</p>
                </button>
                <button
                    className={escolaSelecionada ? 'app--buttonMain' : 'app--buttonMain__disabled'}
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