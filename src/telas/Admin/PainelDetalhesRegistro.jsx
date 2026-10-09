import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioPDF } from '../../components/RelatorioPDF';
import * as Formatadores from '../../utils/formatadores';

export function PainelDetalhesRegistro({ registro }) {
    if (!registro) {
        return null;
    }

    const alunos = Array.isArray(registro.alunos_dados) ? registro.alunos_dados : [];
    const eixos = Array.isArray(registro.eixos_tematicos) ? registro.eixos_tematicos : [];

    const dadosRelatorio = {
        data: `${Formatadores.formatarDataIso(registro.data_atividade)} - Turno da ${registro.turno || '-'}`,
        escola: registro.escola_nome ? Formatadores.formatarNome(registro.escola_nome) : '',
        turma: Formatadores.formatarTurmas(registro.turmas),
        profissionaisResponsaveis: registro.profissionais || [],
        Registrador: registro.registrador_nome || '',
        eixosTematicos: eixos,
        observacoes: registro.observacoes || '',
        alunosPresentes: alunos,
    };

    const nomeArquivo = `relatorio-pse-${registro.escola_nome || 'registro'}-${registro.data_atividade || 'data'}.pdf`
        .toLowerCase()
        .replace(/\s+/g, '-');

    return (
        <>
            <p className="app__title">Resumo da Atividade</p>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Data de realização da ação</p>
                <p>
                    {Formatadores.formatarDataIso(registro.data_atividade)} - Turno da {registro.turno || '-'}
                </p>
            </div>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Registrado por</p>
                <p>{registro.registrador_nome || '-'}</p>
            </div>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Responsáveis pela ação</p>
                <p>{Formatadores.formatarProfissionais(registro.profissionais)}</p>
            </div>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Escola</p>
                <p>{registro.escola_nome ? Formatadores.formatarNome(registro.escola_nome) : '-'}</p>
            </div>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Turma</p>
                <p>{Formatadores.formatarTurmas(registro.turmas)}</p>
            </div>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Eixos Selecionados</p>
                <>
                    {eixos.length === 0 && <p>-</p>}
                    {eixos.map((eixo, index) => (
                        <p key={index}>{eixo}</p>
                    ))}
                </>
                {registro.observacoes && <p>Observações: {registro.observacoes}</p>}
            </div>

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Alunos que participaram da ação</p>
                <div className="app__resumo">
                    {alunos.length === 0 && <p>Nenhum aluno registrado.</p>}
                    {alunos.map((aluno, index) => (
                        <div key={aluno.id ?? index} className="app__resumo">
                            <span>{aluno.nome} - </span>
                            <span>{Formatadores.formatarData(aluno.dataNascimento)}</span>
                            {(aluno.peso || aluno.altura) && (
                                <>
                                    {' - '}
                                    {aluno.peso && <span>{aluno.peso}kg</span>}
                                    {aluno.altura && <span> {aluno.altura}cm</span>}
                                </>
                            )}
                            {aluno.vacinado && (
                                <span> - Vacina: {Formatadores.formatarVacinacao(aluno.vacinado)}</span>
                            )}
                            {aluno.saudeOcular && (
                                <span> - Saúde Ocular: {Formatadores.formatarSaudeOcular(aluno.saudeOcular)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="app__footer">
                <PDFDownloadLink
                    document={<RelatorioPDF dados={dadosRelatorio} />}
                    fileName={nomeArquivo}
                    className="app__buttonMain"
                    style={{ textDecoration: 'none' }}
                >
                    {({ loading }) => (
                        <p>{loading ? 'Gerando PDF...' : 'Gerar Relatório em PDF'}</p>
                    )}
                </PDFDownloadLink>
            </div>
        </>
    );
}