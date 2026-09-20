import { IconePesquisa, IconeCheck } from './Icones';
import '../styles/components/SearchableList.css';

export function SearchableList({ busca, onBuscaChange, itens, itemSelecionado, onSelecionarItem, formatarNome }) {
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
                {itens.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelecionarItem(itemSelecionado?.id === item.id ? null : item)}
                        className='app__search-list__unidade'
                    >
                        {itemSelecionado?.id === item.id ? <IconeCheck /> : null}
                        {formatarNome(item.nome)}
                    </div>
                ))}
            </div>
        </div>
    );
}