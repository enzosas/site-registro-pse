import { IconeVoltar } from '../components/Icones';

export function TelaAjuda({ onVoltar, cardRef }) {
    return (
        <div className='app--card' ref={cardRef}>
            <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>
            <p className='app--title'>Ajuda</p>

            <div className='app--resumo'>
                <p className='app--resumo--subtitle'>Bem vindo!</p>
                <p className='app--ajuda--paragrafo'>
                    Este aplicativo foi criado para tornar o registro das ações do Programa Saúde na Escola (PSE) mais simples, rápido e organizado.
                </p>
                <p className='app--ajuda--paragrafo'>Durante a atividade, você pode:</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; &nbsp;Registrar a presença dos participantes</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; &nbsp;Selecionar os eixos temáticos abordados</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; &nbsp;Informar os dados coletados, como peso e altura</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; &nbsp;Salvar todas as informações diretamente pelo celular</p>
                <p className='app--ajuda--paragrafo'>
                    Ao finalizar, o aplicativo gera automaticamente um relatório, que pode ser copiado ou salvo em PDF para facilitar o registro das ações.
                </p>
                <p className='app--ajuda--paragrafo'>
                    Assim, você economiza tempo, reduz o uso de papel e mantém os registros das atividades organizados e padronizados.
                </p>
            </div>

            <div className='app--resumo'>
                <p className='app--resumo--subtitle'>Guia prático de preenchimento</p>
                <p className='app--ajuda--subtitulo'>Escola e turma</p>
                <p className='app--ajuda--paragrafo'>
                    Selecione a escola e a turma pesquisando na lista. Se não encontrar, clique em "A escola/turma não está na lista" para realizar o cadastro manual.
                </p>

                <p className='app--ajuda--subtitulo'>Eixos temáticos</p>
                <p className='app--ajuda--paragrafo'>
                    Selecione um ou mais eixos temáticos abordados durante a atividade. Marque todas as opções que correspondem aos temas trabalhados na visita.
                </p>

                <p className='app--ajuda--subtitulo'>Lista de presença</p>
                <p className='app--ajuda--paragrafo'>
                    A lista de estudantes da turma será exibida automaticamente. Basta marcar os participantes presentes.
                </p>
                <p className='app--ajuda--paragrafo'>
                    Caso algum estudante não esteja na lista, clique em "Adicionar estudante manualmente" e informe o nome e a data de nascimento.
                </p>

                <p className='app--ajuda--subtitulo'>Coleta de dados</p>
                <p className='app--ajuda--paragrafo'>
                    Se a sua atividade conter um ou mais eixos temáticos com este tipo de atividade, você deverá preencher, para cada aluno presente na atividade, em ordem alfabética, as informações solicitadas.
                </p>

                <p className='app--ajuda--subtitulo'>Gerando o relatório</p>
                <p className='app--ajuda--paragrafo'>Ao finalizar o preenchimento, escolha uma das opções:</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; Gerar relatório em PDF: salva o relatório no seu dispositivo.</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; Ver resumo: exibe um resumo da atividade.</p>
                <p className='app--ajuda--paragrafo'>•&nbsp; Copiar resumo: copia o texto para ser colado em aplicativos como WhatsApp, e-mail ou outros sistemas.</p>

                <p className='app--ajuda--subtitulo'>Suporte</p>
                <p className='app--ajuda--paragrafo'>
                    Em caso de dificuldades de acesso, erros no aplicativo ou dúvidas sobre o preenchimento, entre em contato com a coordenação do Programa Saúde na Escola (PSE) pelo e-mail: enzo.silveira@ufsm.br
                </p>
            </div>
        </div>
    );
}