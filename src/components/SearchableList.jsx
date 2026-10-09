import { IconePesquisa, IconeCheck } from './Icones';
import '../styles/components/SearchableList.css';
import { formatarNome } from '../utils/formatadores';

export function SearchableList({ busca, onBuscaChange, itens, itemSelecionado, onSelecionarItem }) {
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
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelecionarItem(itemSelecionado?.id === item.id ? null : item)}
                        className='app__search-list__unidade'
                    >
                        {itemSelecionado?.id === item.id ? <IconeCheck /> : null}
                        <span>{formatarNome(item.nome)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}