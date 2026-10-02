import { IconePesquisa, IconeCheck } from './Icones';
import '../styles/components/SearchableList.css';
import { formatarNome } from '../utils/formatadores';

export function SearchableMultiList({
    busca,
    onBuscaChange,
    itens,
    itensSelecionados = [],
    onToggleItem,
}) {
    return (
        <div className='app__search-container'>
            <div className='app__search-bar'>
                <input
                    type="text"
                    placeholder="Digite aqui para pesquisar"
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                />
                <IconePesquisa />
            </div>
            <div className='app__search-list'>
                {itens.map((item) => {
                    const isSelecionado = itensSelecionados.some((i) => i.id === item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => onToggleItem(item)}
                            className='app__search-list__unidade'
                        >
                            {isSelecionado ? <IconeCheck /> : null}
                            {formatarNome(item.nome)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}