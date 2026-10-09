import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioPDF } from '../../components/RelatorioPDF';
import { IconeCheck } from '../../components/Icones';
import { useAuth } from '../../context/AuthContext';
import { marcarRegistroComoExportadoDB } from '../../services/supabaseService';
import * as Formatadores from '../../utils/formatadores';

export function PainelDetalhesRegistro({ registro: registroInicial }) {
    const { usuarioId, nomeUsuario } = useAuth();
    const [registro, setRegistro] = useState(registroInicial);
    const [marcando, setMarcando] = useState(false);
    const [erro, setErro] = useState('');

    if (!registro) {
        return null;
    }

    const jaExportado = Boolean(registro.exportado_outro_sistema);
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

    const handleMarcarComoLancado = async () => {
        if (jaExportado || marcando) return;

        const confirmou = window.confirm(
            `Deseja marcar este registro como lançado no sistema MV? O responsável pelo lançamento será "${nomeUsuario || 'usuário logado'}".`
        );

        if (!confirmou) return;

        setErro('');
        setMarcando(true);

        const resultado = await marcarRegistroComoExportadoDB(registro.id, usuarioId);
        setMarcando(false);

        if (!resultado.sucesso) {
            setErro(resultado.erro || 'Falha ao marcar o registro no banco.');
            return;
        }

        setRegistro({
            ...resultado.data,
            exportador_nome: nomeUsuario,
        });

        alert('Registro marcado como lançado no sistema MV com sucesso!');
    };

    const formatarDataHoraLancamento = (timestamp) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        const dataFormatada = d.toLocaleDateString('pt-BR');
        const horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${dataFormatada} às ${horaFormatada}`;
    };

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

            <div className="app__resumo">
                <p className="app__resumo__subtitle">Lançamento no Sistema MV</p>
                {jaExportado ? (
                    <div className="admin__detalhes__status-container">
                        <p>
                            Status: <strong>Lançado</strong>
                            {registro.exportado_em && ` em ${formatarDataHoraLancamento(registro.exportado_em)}`}
                            {(registro.exportador_nome || (registro.exportado_por_usuario_id === usuarioId && nomeUsuario)) && (
                                <> por <strong>{registro.exportador_nome || nomeUsuario}</strong></>
                            )}
                        </p>
                         <div className="admin__registro-card__check-badge">
                            <IconeCheck bold />
                        </div>
                    </div>
                ) : (
                    <p>Ainda não lançado no MV</p>
                )}
            </div>

            <div className="app__footer app__footer--extra_margin">
                {erro && (
                    <div className="app__alerta-erro">
                        <p>{erro}</p>
                    </div>
                )}

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

                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={handleMarcarComoLancado}
                    disabled={jaExportado || marcando}
                >
                    <p>
                        {jaExportado
                            ? 'Lançado no Sistema MV'
                            : marcando
                                ? 'Atualizando...'
                                : 'Marcar como lançado no sistema MV'}
                    </p>
                </button>
            </div>
        </>
    );
}