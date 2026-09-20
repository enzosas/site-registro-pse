import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import * as Constantes from './constantes';
import { formatarData, formatarProfissionais } from './utils/formatadores';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
        borderBottom: 1,
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 15,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
        backgroundColor: '#f0f0f0',
        padding: 3,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 5,
    },
    columnHeader: {
        fontWeight: 'bold',
        backgroundColor: '#F9F9F9',
    },
    footer: {
        marginTop: 10,
    },
    cellNome: {
        flex: 1,
    },
    cellSecundaria: {
        textAlign: 'center',
        width: 65,
    },
});

export const RelatorioPDF = ({ dados }) => {
    const alunos = dados.alunosPresentes || [];
    const temPeso = alunos.some((a) => a.peso);
    const temAltura = alunos.some((a) => a.altura);
    const temVacina = alunos.some((a) => a.vacinado);
    const temVisao = alunos.some((a) => a.saudeOcular);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Relatório PSE Online</Text>
                </View>

                <View style={styles.section}>
                    <Text>Registrado por: {dados.Registrador || '-'}</Text>
                    <Text>Profissionais que realizaram a ação: {formatarProfissionais(dados.profissionaisResponsaveis)}</Text>
                    <Text>Escola: {dados.escola}</Text>
                    <Text>Turma: {dados.turma}</Text>
                    <Text>Data da atividade: {dados.data}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subTitle}>Eixos Temáticos Trabalhados:</Text>
                    {dados.eixosTematicos.map((eixo, i) => (
                        <Text key={i}>{eixo}</Text>
                    ))}
                    {dados.observacoes && (
                        <Text style={{ marginTop: 4 }}>Observações: {dados.observacoes}</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.subTitle}>Lista de Alunos:</Text>
                    <View style={[styles.row, styles.columnHeader]}>
                        <Text style={styles.cellNome}>Nome</Text>
                        <Text style={styles.cellSecundaria}>Nascimento</Text>
                        {temPeso && <Text style={styles.cellSecundaria}>Peso</Text>}
                        {temAltura && <Text style={styles.cellSecundaria}>Altura</Text>}
                        {temVacina && <Text style={styles.cellSecundaria}>Vacina</Text>}
                        {temVisao && <Text style={styles.cellSecundaria}>Visão</Text>}
                    </View>

                    {alunos.map((aluno, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={styles.cellNome}>{aluno.nome}</Text>
                            <Text style={styles.cellSecundaria}>{formatarData(aluno.dataNascimento)}</Text>
                            {temPeso && (
                                <Text style={styles.cellSecundaria}>{aluno.peso ? `${aluno.peso}kg` : '-'}</Text>
                            )}
                            {temAltura && (
                                <Text style={styles.cellSecundaria}>{aluno.altura ? `${aluno.altura}cm` : '-'}</Text>
                            )}
                            {temVacina && (
                                <Text style={styles.cellSecundaria}>
                                    {Constantes.formatarVacinacao(aluno.vacinado)}
                                </Text>
                            )}
                            {temVisao && (
                                <Text style={styles.cellSecundaria}>
                                    {Constantes.formatarSaudeOcular(aluno.saudeOcular)}
                                </Text>
                            )}
                        </View>
                    ))}

                    <View style={styles.footer}>
                        <Text style={styles.textoFooter}>Quantidade de alunos: {alunos.length}</Text>
                        <Text style={styles.textoFooter}>
                            Relatório gerado em: {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};