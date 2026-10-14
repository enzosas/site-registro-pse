import ReactMarkdown from 'react-markdown';
import { IconeVoltar } from '../components/Icones';
import conteudoAjuda from '../content/ajuda.md?raw';

export function TelaAjuda({ onVoltar, cardRef }) {
    return (
        <div className='app__card' ref={cardRef}>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Ajuda</p>

            <div className='markdown'>
                <ReactMarkdown>
                    {conteudoAjuda}
                </ReactMarkdown>
            </div>
        </div>
    );
}