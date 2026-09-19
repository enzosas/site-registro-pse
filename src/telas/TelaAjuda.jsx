import ReactMarkdown from 'react-markdown';
import { IconeVoltar } from '../components/Icones';
import conteudoAjuda from '../content/ajuda.md?raw';

export function TelaAjuda({ onVoltar, cardRef }) {
    return (
        <div className='app--card' ref={cardRef}>
            <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>
            <p className='app--title'>Ajuda</p>

            <div className='app--resumo'>
                <ReactMarkdown
                    components={{
                        h3: ({ children }) => <p className='app--resumo--subtitle'>{children}</p>,
                        h4: ({ children }) => <p className='app--ajuda--subtitulo'>{children}</p>,
                        p: ({ children }) => <p className='app--ajuda--paragrafo'>{children}</p>,
                        li: ({ children }) => <p className='app--ajuda--paragrafo'>•&nbsp; {children}</p>,
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