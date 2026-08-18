import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { formatarVacinacao } from './constantes';

const formatarData = (data) => {
    if (!data) return ''
    return data
}

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
    cellNome: { width: '35%' },
    cellNasc: { width: '20%' },
    cellPeso: { width: '15%', textAlign: 'center' },
    cellAlt: { width: '15%', textAlign: 'center' },
    cellVacina: { width: '15%', textAlign: 'center' },
});

export const RelatorioPDF = ({ dados }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Relatório PSE Online</Text>
            </View>

            <View style={styles.section}>
                <Text>Escola: {dados.escola}</Text>
                <Text>Turma: {dados.turma}</Text>
                <Text>Data: {dados.data}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subTitle}>Eixos Temáticos Trabalhados:</Text>
                {dados.eixosTematicos.map((eixo, i) => (
                    <Text key={i}>{eixo}</Text>
                ))}
                {dados.observacoes && (
                    <Text>Observações: {dados.observacoes}</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.subTitle}>Lista de Alunos:</Text>
                <View style={[styles.row, styles.columnHeader]}>
                    <Text style={styles.cellNome}>Nome</Text>
                    <Text style={styles.cellNasc}>Nascimento</Text>
                    <Text style={styles.cellPeso}>Peso</Text>
                    <Text style={styles.cellAlt}>Altura</Text>
                    <Text style={styles.cellVacina}>Vacina</Text>
                </View>
                {dados.alunosPresentes.map((aluno, i) => (
                    <View key={i} style={styles.row}>
                        <Text style={styles.cellNome}>{aluno.nome}</Text>
                        <Text style={styles.cellNasc}>{formatarData(aluno.dataNascimento)}</Text>
                        <Text style={styles.cellPeso}>{aluno.peso ? `${aluno.peso}kg` : '-'}</Text>
                        <Text style={styles.cellAlt}>{aluno.altura ? `${aluno.altura}cm` : '-'}</Text>
                        <Text style={styles.cellVacina}>
                            {formatarVacinacao(aluno.vacinado)}
                        </Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);