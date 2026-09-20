import { IconePesquisa, IconeCheck } from './Icones';
import '../styles/components/SearchableList.css';

export function SearchableList({ busca, onBuscaChange, itens, itemSelecionado, onSelecionarItem, formatarNome }) {
    return (
        <div className='app--search-container'>
            <div className='app--search-bar'>
                <input
                    type="text"
                    placeholder="Digite aqui para pesquisar"
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                />
                <IconePesquisa />
            </div>
            <div className='app--search-list'>
                {itens.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelecionarItem(itemSelecionado?.id === item.id ? null : item)}
                        className='app--search-list--unidade'
                    >
                        {itemSelecionado?.id === item.id ? <IconeCheck /> : null}
                        {formatarNome(item.nome)}
                    </div>
                ))}
            </div>
        </div>
    );
}