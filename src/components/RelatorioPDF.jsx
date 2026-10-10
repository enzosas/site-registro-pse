import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import * as Formatadores from '../utils/formatadores';

export const CORES_RELATORIO = {
    // identidade visual pse sus
    verdePrincipal: '#16a34a',
    laranjaPrincipal: '#ea770c',
    amareloDestaque: '#f59e0b',
    azulPrincipal: '#2563eb',

    // tipografia e tons neutros
    textoPrincipal: '#1e293b',
    textoTituloEscuro: '#334155',
    textoSecundario: '#475569',
    textoSuave: '#64748b',
    textoMudo: '#94a3b8',
    branco: '#ffffff',

    // estrutura e linhas
    borda: '#cbd5e1',
    bordaSuave: '#e2e8f0',
    bordaLinha: '#f1f5f9',
    fundoLinhaZebra: '#f8fafc',
};

export const FONTE_TAMANHO = {
    mini: 8,
    tabela: 12,
    rotulo: 12,
    padrao: 12,
    subtitulo: 20,
    titulo: 25,
};

export const FONTE_PESO = {
    regular: 'Helvetica',
    negrito: 'Helvetica-Bold',
};

export const ESPACO_RELATORIO = {
    faixaTopoAltura: 6,
    raioBordaSuave: 4,
    raioBordaCard: 8,
    raioDot: 3,
    tamanhoDot: 6,
    logoDimensao: 55,
    cardMinAltura: 32,
};

export const LARGURAS_TABELA = {
    nome: 2.8,
    nascimento: 1.3,
    medida: 1.0,
    status: 1.2,
};

export const TEXTOS_RELATORIO = {
    tituloPrincipal: 'RELATÓRIO DE AÇÃO',
    subtituloPrincipal: 'PROGRAMA SAÚDE NA ESCOLA',
    rotuloData: 'Data:',
    rotuloEscola: 'Escola:',
    rotuloTurmaSingular: 'Turma:',
    rotuloTurmaPlural: 'Turmas:',
    rotuloRegistrador: 'Registrado por:',
    rotuloEquipe: 'Equipe:',
    secaoEixos: 'EIXOS TEMÁTICOS TRABALHADOS',
    secaoAlunos: 'ALUNOS',
    observacoes: 'OBSERVAÇÕES',
    semEixos: 'Nenhum eixo selecionado.',
    colNome: 'ALUNO',
    colNascimento: 'NASCIMENTO',
    colPeso: 'PESO',
    colAltura: 'ALTURA',
    colVacina: 'VACINA',
    colVisao: 'VISÃO',
    traçoVazio: '-',
    totalAlunos: 'Total de alunos:',
};

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 40,
        paddingHorizontal: 36,
        fontSize: FONTE_TAMANHO.padrao,
        fontFamily: FONTE_PESO.regular,
        color: CORES_RELATORIO.textoPrincipal,
        backgroundColor: CORES_RELATORIO.branco,
    },

    // faixa superior tricolor
    faixaTopo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: ESPACO_RELATORIO.faixaTopoAltura,
        flexDirection: 'row',
    },
    faixaTercoVerde: {
        flex: 1,
        backgroundColor: CORES_RELATORIO.verdePrincipal,
    },
    faixaTercoLaranja: {
        flex: 1,
        backgroundColor: CORES_RELATORIO.laranjaPrincipal,
    },
    faixaTercoAzul: {
        flex: 1,
        backgroundColor: CORES_RELATORIO.azulPrincipal,
    },

    // cabecalho e titulo
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        marginTop: 6,
    },
    headerTituloBloco: {
        flex: 1,
        paddingRight: 12,
    },
    headerTituloDestaque: {
        fontSize: FONTE_TAMANHO.titulo,
        fontFamily: FONTE_PESO.negrito,
        color: CORES_RELATORIO.azulPrincipal,
        letterSpacing: 0.5,
        lineHeight: 1.1,
    },
    headerTituloSub: {
        fontSize: FONTE_TAMANHO.subtitulo,
        fontFamily: FONTE_PESO.negrito,
        color: CORES_RELATORIO.textoTituloEscuro,
        letterSpacing: 0.5,
        marginTop: 2,
    },

    // logo
    logoContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoPSE: {
        width: ESPACO_RELATORIO.logoDimensao,
        height: ESPACO_RELATORIO.logoDimensao,
        objectFit: 'contain',
    },

    // badge com data
    dateBadge: {
        backgroundColor: CORES_RELATORIO.azulPrincipal,
        borderRadius: ESPACO_RELATORIO.raioBordaSuave,
        paddingVertical: 4,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    dateBadgeLabel: {
        color: CORES_RELATORIO.branco,
        fontFamily: FONTE_PESO.negrito,
        fontSize: FONTE_TAMANHO.rotulo,
        marginRight: 6,
    },
    dateBadgeValue: {
        color: CORES_RELATORIO.branco,
        fontSize: FONTE_TAMANHO.rotulo,
    },

    // cards pills de informacoes gerais
    pillsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 10,
        marginBottom: 10,
    },
    pillBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: CORES_RELATORIO.borda,
        borderRadius: ESPACO_RELATORIO.raioBordaCard,
        paddingVertical: 6,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: ESPACO_RELATORIO.cardMinAltura,
    },
    pillLabel: {
        color: CORES_RELATORIO.azulPrincipal,
        fontFamily: FONTE_PESO.negrito,
        fontSize: FONTE_TAMANHO.rotulo,
        marginRight: 6,
        flexShrink: 0,
    },
    pillValue: {
        color: CORES_RELATORIO.textoPrincipal,
        fontSize: FONTE_TAMANHO.rotulo,
        flex: 1,
        lineHeight: 1.25,
    },

    // secao eixos tematicos verde
    secaoEixosHeader: {
        flexDirection: 'row',
        backgroundColor: CORES_RELATORIO.verdePrincipal,
        borderTopLeftRadius: ESPACO_RELATORIO.raioBordaSuave,
        borderTopRightRadius: ESPACO_RELATORIO.raioBordaSuave,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginTop: 4,
    },
    secaoEixosTitulo: {
        color: CORES_RELATORIO.branco,
        fontFamily: FONTE_PESO.negrito,
        fontSize: FONTE_TAMANHO.padrao,
        textTransform: 'uppercase',
    },
    secaoEixosCorpo: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: CORES_RELATORIO.borda,
        borderBottomLeftRadius: ESPACO_RELATORIO.raioBordaSuave,
        borderBottomRightRadius: ESPACO_RELATORIO.raioBordaSuave,
        padding: 8,
        paddingTop: 3,
        flexDirection: 'column',
        marginBottom: 12,
    },
    eixoItem: {
        width: '100%',
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletEixo: {
        width: 12,
        color: CORES_RELATORIO.verdePrincipal,
        fontFamily: FONTE_PESO.negrito,
    },
    eixoTexto: {
        flex: 1,
        fontSize: FONTE_TAMANHO.rotulo,
        color: CORES_RELATORIO.textoTituloEscuro,
        lineHeight: 1.25,
    },

    // card de observacoes
    notesBox: {
        borderWidth: 1,
        borderColor: CORES_RELATORIO.borda,
        borderRadius: ESPACO_RELATORIO.raioBordaSuave,
        padding: 8,
        marginBottom: 12,
    },
    notesTitle: {
        color: CORES_RELATORIO.azulPrincipal,
        fontFamily: FONTE_PESO.negrito,
        fontSize: FONTE_TAMANHO.rotulo,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    notesText: {
        fontSize: FONTE_TAMANHO.rotulo,
        color: CORES_RELATORIO.textoSecundario,
        lineHeight: 1.25,
    },

    // secao tabela de alunos laranja
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: CORES_RELATORIO.laranjaPrincipal,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderTopLeftRadius: ESPACO_RELATORIO.raioBordaSuave,
        borderTopRightRadius: ESPACO_RELATORIO.raioBordaSuave,
    },
    tableHeaderCell: {
        color: CORES_RELATORIO.branco,
        fontFamily: FONTE_PESO.negrito,
        fontSize: FONTE_TAMANHO.tabela,
        textTransform: 'uppercase',
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: CORES_RELATORIO.borda,
        borderTopWidth: 0,
        overflow: 'hidden',
        borderBottomLeftRadius: ESPACO_RELATORIO.raioBordaSuave,
        borderBottomRightRadius: ESPACO_RELATORIO.raioBordaSuave,
        flexDirection: 'column',
        marginBottom: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: CORES_RELATORIO.bordaSuave,
        paddingVertical: 5,
        paddingHorizontal: 8,
        backgroundColor: CORES_RELATORIO.branco,
    },
    tableRowEven: {
        backgroundColor: CORES_RELATORIO.fundoLinhaZebra,
    },
    tableCell: {
        fontSize: FONTE_TAMANHO.tabela,
        color: CORES_RELATORIO.textoPrincipal,
    },

    // total de alunos abaixo da tabela
    totalAlunosTexto: {
        fontSize: FONTE_TAMANHO.padrao,
        fontFamily: FONTE_PESO.regular,
        color: CORES_RELATORIO.textoSecundario,
        marginBottom: 12,
        paddingHorizontal: 2,
    },

    // colunas da tabela
    colNome: { flex: LARGURAS_TABELA.nome },
    colNascimento: { flex: LARGURAS_TABELA.nascimento, textAlign: 'center' },
    colMedidas: { flex: LARGURAS_TABELA.medida, textAlign: 'center' },
    colStatus: { flex: LARGURAS_TABELA.status, textAlign: 'center' },

    // rodape
    footer: {
        position: 'absolute',
        bottom: 18,
        left: 36,
        right: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: CORES_RELATORIO.bordaLinha,
        paddingTop: 8,
    },
    footerInfo: {
        fontSize: FONTE_TAMANHO.mini,
        color: CORES_RELATORIO.textoMudo,
    },
    footerDots: {
        flexDirection: 'row',
        gap: 5,
    },
    dot: {
        width: ESPACO_RELATORIO.tamanhoDot,
        height: ESPACO_RELATORIO.tamanhoDot,
        borderRadius: ESPACO_RELATORIO.raioDot,
    },
});

// desativa hifenizacao de palavras
const semHifenizacao = (word) => [word];

export const RelatorioPDF = ({ dados }) => {
    const alunos = dados.alunosPresentes || [];
    const temPeso = alunos.some((a) => a.peso);
    const temAltura = alunos.some((a) => a.altura);
    const temVacina = alunos.some((a) => a.vacinado);
    const temVisao = alunos.some((a) => a.saudeOcular);

    const profissionaisTexto = Array.isArray(dados.profissionaisResponsaveis)
        ? dados.profissionaisResponsaveis.join(', ')
        : dados.profissionaisResponsaveis || TEXTOS_RELATORIO.traçoVazio;

    const temMultiplasTurmas = (() => {
        if (!dados.turma) return false;
        if (Array.isArray(dados.turma)) return dados.turma.length > 1;
        if (typeof dados.turma === 'string') {
            return dados.turma.includes(',') || dados.turma.includes(';');
        }
        return false;
    })();

    const labelTurma = temMultiplasTurmas
        ? TEXTOS_RELATORIO.rotuloTurmaPlural
        : TEXTOS_RELATORIO.rotuloTurmaSingular;

    const logoPseUrl = `${import.meta.env.BASE_URL}pseLogo1.png`;

    return (
        <Document>
            <Page size="A4" style={styles.page} hyphenationCallback={semHifenizacao}>
                {/* faixa superior tricolor */}
                <View style={styles.faixaTopo} fixed>
                    <View style={styles.faixaTercoVerde} />
                    <View style={styles.faixaTercoLaranja} />
                    <View style={styles.faixaTercoAzul} />
                </View>

                {/* cabecalho */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerTituloBloco}>
                        <Text style={styles.headerTituloDestaque}>{TEXTOS_RELATORIO.tituloPrincipal}</Text>
                        <Text style={styles.headerTituloSub}>{TEXTOS_RELATORIO.subtituloPrincipal}</Text>
                    </View>

                    <View style={styles.logoContainer}>
                        <Image style={styles.logoPSE} src={logoPseUrl} />
                    </View>
                </View>

                {/* badge com data */}
                <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeLabel}>{TEXTOS_RELATORIO.rotuloData}</Text>
                    <Text style={styles.dateBadgeValue}>{dados.data || TEXTOS_RELATORIO.traçoVazio}</Text>
                </View>

                {/* cards de identificacao */}
                <View style={styles.pillsRow}>
                    <View style={styles.pillBox}>
                        <Text style={styles.pillLabel}>{TEXTOS_RELATORIO.rotuloEscola}</Text>
                        <Text style={styles.pillValue}>{dados.escola || TEXTOS_RELATORIO.traçoVazio}</Text>
                    </View>
                    <View style={styles.pillBox}>
                        <Text style={styles.pillLabel}>{labelTurma}</Text>
                        <Text style={styles.pillValue}>{dados.turma || TEXTOS_RELATORIO.traçoVazio}</Text>
                    </View>
                </View>

                <View style={styles.pillsRow}>
                    <View style={styles.pillBox}>
                        <Text style={styles.pillLabel}>{TEXTOS_RELATORIO.rotuloRegistrador}</Text>
                        <Text style={styles.pillValue}>{dados.Registrador || TEXTOS_RELATORIO.traçoVazio}</Text>
                    </View>
                    <View style={styles.pillBox}>
                        <Text style={styles.pillLabel}>{TEXTOS_RELATORIO.rotuloEquipe}</Text>
                        <Text style={styles.pillValue}>{profissionaisTexto}</Text>
                    </View>
                </View>

                {/* eixos tematicos */}
                <View style={styles.secaoEixosHeader}>
                    <Text style={styles.secaoEixosTitulo}>{TEXTOS_RELATORIO.secaoEixos}</Text>
                </View>
                <View style={styles.secaoEixosCorpo}>
                    {dados.eixosTematicos && dados.eixosTematicos.length > 0 ? (
                        dados.eixosTematicos.map((eixo, i) => (
                            <View key={i} style={styles.eixoItem}>
                                <Text style={styles.bulletEixo}>•</Text>
                                <Text style={styles.eixoTexto}>{eixo}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ fontSize: FONTE_TAMANHO.tabela, color: CORES_RELATORIO.textoSuave }}>
                            {TEXTOS_RELATORIO.semEixos}
                        </Text>
                    )}
                </View>

                {/* observacoes */}
                {dados.observacoes && (
                    <View style={styles.notesBox}>
                        <Text style={styles.notesTitle}>{TEXTOS_RELATORIO.observacoes}</Text>
                        <Text style={styles.notesText}>{dados.observacoes}</Text>
                    </View>
                )}

                {/* tabela de alunos */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colNome]}>{TEXTOS_RELATORIO.colNome}</Text>
                    <Text style={[styles.tableHeaderCell, styles.colNascimento]}>{TEXTOS_RELATORIO.colNascimento}</Text>
                    {temPeso && <Text style={[styles.tableHeaderCell, styles.colMedidas]}>{TEXTOS_RELATORIO.colPeso}</Text>}
                    {temAltura && <Text style={[styles.tableHeaderCell, styles.colMedidas]}>{TEXTOS_RELATORIO.colAltura}</Text>}
                    {temVacina && <Text style={[styles.tableHeaderCell, styles.colStatus]}>{TEXTOS_RELATORIO.colVacina}</Text>}
                    {temVisao && <Text style={[styles.tableHeaderCell, styles.colStatus]}>{TEXTOS_RELATORIO.colVisao}</Text>}
                </View>
                <View style={styles.tableContainer}>
                    {alunos.map((aluno, i) => (
                        <View
                            key={i}
                            style={[
                                styles.tableRow,
                                i % 2 === 1 ? styles.tableRowEven : {},
                                i === alunos.length - 1 ? { borderBottomWidth: 0 } : {},
                            ]}
                            wrap={false}
                        >
                            <Text style={[styles.tableCell, styles.colNome]}>{aluno.nome}</Text>
                            <Text style={[styles.tableCell, styles.colNascimento]}>
                                {Formatadores.formatarData(aluno.dataNascimento)}
                            </Text>
                            {temPeso && (
                                <Text style={[styles.tableCell, styles.colMedidas]}>
                                    {aluno.peso ? `${aluno.peso}kg` : TEXTOS_RELATORIO.traçoVazio}
                                </Text>
                            )}
                            {temAltura && (
                                <Text style={[styles.tableCell, styles.colMedidas]}>
                                    {aluno.altura ? `${aluno.altura}cm` : TEXTOS_RELATORIO.traçoVazio}
                                </Text>
                            )}
                            {temVacina && (
                                <Text style={[styles.tableCell, styles.colStatus]}>
                                    {Formatadores.formatarVacinacao(aluno.vacinado)}
                                </Text>
                            )}
                            {temVisao && (
                                <Text style={[styles.tableCell, styles.colStatus]}>
                                    {Formatadores.formatarSaudeOcular(aluno.saudeOcular)}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* total de alunos abaixo da tabela */}
                <Text style={styles.totalAlunosTexto}>
                    {TEXTOS_RELATORIO.totalAlunos} {alunos.length}
                </Text>

                {/* rodape com informacoes e bolinhas */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerInfo}>
                        Gerado em: {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                    <View style={styles.footerDots}>
                        <View style={[styles.dot, { backgroundColor: CORES_RELATORIO.verdePrincipal }]} />
                        <View style={[styles.dot, { backgroundColor: CORES_RELATORIO.laranjaPrincipal }]} />
                        <View style={[styles.dot, { backgroundColor: CORES_RELATORIO.azulPrincipal }]} />
                    </View>
                </View>
            </Page>
        </Document>
    );
};