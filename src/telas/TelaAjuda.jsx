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

            <div className='app__resumo'>
                <ReactMarkdown
                    components={{
                        h3: ({ children }) => <p className='app__resumo__subtitle'>{children}</p>,
                        h4: ({ children }) => <p className='app__ajuda__subtitulo'>{children}</p>,
                        p: ({ children }) => <p className='app__ajuda__paragrafo'>{children}</p>,
                        li: ({ children }) => <p className='app__ajuda__paragrafo'>•&nbsp; {children}</p>,
                        ul: ({ children }) => <>{children}</>,
                        hr: () => <br />
                    }}
                >
                    {conteudoAjuda}
                </ReactMarkdown>
            </div>
        </div>
    );
}