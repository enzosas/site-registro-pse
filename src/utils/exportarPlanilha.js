// Exportação dos registros de atividade para planilha Excel (.xlsx).
//
// Gera duas abas:
//   Registros – uma linha por registro de atividade
//   Alunos    – uma linha por aluno presente em cada registro
//
// Datas e números são gravados como valores do Excel (não como texto),
// para que possam ser ordenados, filtrados e somados.

import * as XLSX from 'xlsx/xlsx.mjs';
import {
    compactarEixo,
    formatarSaudeAuditiva,
    formatarSaudeOcular,
    formatarTurmas,
    formatarVacinacao,
} from './formatadores';

const FORMATO_DATA = 'dd/mm/yyyy';
const FORMATO_DATA_HORA = 'dd/mm/yyyy hh:mm';
const DIA_EM_MS = 24 * 60 * 60 * 1000;
const INICIO_EXCEL = Date.UTC(1899, 11, 30);

// "2026-11-17" -> número de série do Excel (sem fuso horário, para não mudar o dia)
function serialDeDataIso(dataIso) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dataIso || ''));
    if (!partes) return null;
    const [, ano, mes, dia] = partes.map(Number);
    return (Date.UTC(ano, mes - 1, dia) - INICIO_EXCEL) / DIA_EM_MS;
}

// carimbo de data/hora -> série do Excel no horário local de quem exporta
function serialDeDataHora(carimbo) {
    if (!carimbo) return null;
    const data = new Date(carimbo);
    if (isNaN(data.getTime())) return null;
    const local = Date.UTC(
        data.getFullYear(), data.getMonth(), data.getDate(),
        data.getHours(), data.getMinutes()
    );
    return (local - INICIO_EXCEL) / DIA_EM_MS;
}

function celulaData(dataIso) {
    const serial = serialDeDataIso(dataIso);
    return serial === null ? '' : { t: 'n', v: serial, z: FORMATO_DATA };
}

function celulaDataHora(carimbo) {
    const serial = serialDeDataHora(carimbo);
    return serial === null ? '' : { t: 'n', v: serial, z: FORMATO_DATA_HORA };
}

function numeroOuVazio(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    const numero = Number(String(valor).replace(',', '.'));
    return Number.isFinite(numero) ? numero : '';
}

function idadeNaData(nascimentoIso, dataIso) {
    const nasc = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(nascimentoIso || ''));
    const ref = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dataIso || ''));
    if (!nasc || !ref) return '';
    const [, an, mn, dn] = nasc.map(Number);
    const [, ar, mr, dr] = ref.map(Number);
    let idade = ar - an;
    if (mr < mn || (mr === mn && dr < dn)) idade -= 1;
    return idade >= 0 && idade < 120 ? idade : '';
}

function lista(valor, separador = '; ') {
    if (!valor) return '';
    if (Array.isArray(valor)) {
        return valor.map((item) => String(item || '').trim()).filter(Boolean).join(separador);
    }
    return String(valor).trim();
}

function semTraco(texto) {
    return texto === '-' ? '' : texto;
}

// Monta a aba a partir das colunas: [{ titulo, largura, valor: (linha) => ... }]
function montarAba(XLSX, colunas, linhas) {
    const cabecalho = colunas.map((coluna) => coluna.titulo);
    const corpo = linhas.map((linha) => colunas.map((coluna) => {
        const valor = coluna.valor(linha);
        return valor === null || valor === undefined ? '' : valor;
    }));

    const aba = XLSX.utils.aoa_to_sheet([cabecalho, ...corpo]);
    aba['!cols'] = colunas.map((coluna) => ({ wch: coluna.largura }));
    if (linhas.length > 0) {
        aba['!autofilter'] = {
            ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: linhas.length, c: colunas.length - 1 } }),
        };
    }
    return aba;
}

/**
 * Monta a pasta de trabalho (sem salvar).
 * @param XLSX       biblioteca SheetJS (recebida por parâmetro para facilitar testes)
 * @param registros  registros como vêm de carregarRegistrosAtividadeDB
 * @param opcoes.nomeUbs  (registro) => nome da UBS responsável
 */
export function montarPastaDeTrabalho(XLSX, registros, { nomeUbs = () => '' } = {}) {
    const colunasRegistros = [
        { titulo: 'Nº do registro', largura: 12, valor: (r) => r.id },
        { titulo: 'Data', largura: 11, valor: (r) => celulaData(r.data_atividade) },
        { titulo: 'Turno', largura: 8, valor: (r) => r.turno || '' },
        { titulo: 'Escola', largura: 34, valor: (r) => r.escola_nome || '' },
        { titulo: 'UBS', largura: 24, valor: (r) => nomeUbs(r) || '' },
        { titulo: 'Turmas', largura: 16, valor: (r) => semTraco(formatarTurmas(r.turmas)) },
        {
            titulo: 'Eixos temáticos',
            largura: 40,
            valor: (r) => lista((Array.isArray(r.eixos_tematicos) ? r.eixos_tematicos : []).map(compactarEixo)),
        },
        { titulo: 'Profissionais', largura: 30, valor: (r) => lista(r.profissionais, ', ') },
        { titulo: 'Registrado por', largura: 20, valor: (r) => r.registrador_nome || '' },
        { titulo: 'Nº de alunos', largura: 11, valor: (r) => (Array.isArray(r.alunos_dados) ? r.alunos_dados.length : 0) },
        { titulo: 'Descrição', largura: 50, valor: (r) => r.observacoes || '' },
        { titulo: 'Lançado no MV', largura: 13, valor: (r) => (r.exportado_outro_sistema ? 'Sim' : 'Não') },
        { titulo: 'Lançado por', largura: 20, valor: (r) => r.exportado_por_nome || '' },
        { titulo: 'Lançado em', largura: 16, valor: (r) => celulaDataHora(r.exportado_em) },
    ];

    // Uma linha por aluno, levando junto os dados do registro
    const linhasAlunos = registros.flatMap((registro) =>
        (Array.isArray(registro.alunos_dados) ? registro.alunos_dados : []).map((aluno) => ({ registro, aluno }))
    );

    // Colunas de coleta só entram se algum aluno tiver o dado preenchido
    const temDado = (campo) => linhasAlunos.some(({ aluno }) => aluno?.[campo] !== null && aluno?.[campo] !== undefined && aluno?.[campo] !== '');

    const colunasAlunos = [
        { titulo: 'Nº do registro', largura: 12, valor: ({ registro }) => registro.id },
        { titulo: 'Data', largura: 11, valor: ({ registro }) => celulaData(registro.data_atividade) },
        { titulo: 'Turno', largura: 8, valor: ({ registro }) => registro.turno || '' },
        { titulo: 'Escola', largura: 34, valor: ({ registro }) => registro.escola_nome || '' },
        { titulo: 'Turmas do registro', largura: 16, valor: ({ registro }) => semTraco(formatarTurmas(registro.turmas)) },
        { titulo: 'Aluno', largura: 36, valor: ({ aluno }) => aluno?.nome || '' },
        { titulo: 'Nascimento', largura: 11, valor: ({ aluno }) => celulaData(aluno?.dataNascimento) },
        {
            titulo: 'Idade',
            largura: 7,
            valor: ({ registro, aluno }) => idadeNaData(aluno?.dataNascimento, registro.data_atividade),
        },
        temDado('peso') && { titulo: 'Peso (kg)', largura: 10, valor: ({ aluno }) => numeroOuVazio(aluno?.peso) },
        temDado('altura') && { titulo: 'Altura (cm)', largura: 11, valor: ({ aluno }) => numeroOuVazio(aluno?.altura) },
        temDado('vacinado') && {
            titulo: 'Vacinação',
            largura: 24,
            valor: ({ aluno }) => semTraco(formatarVacinacao(aluno?.vacinado)),
        },
        temDado('saudeOcular') && {
            titulo: 'Saúde ocular',
            largura: 13,
            valor: ({ aluno }) => semTraco(formatarSaudeOcular(aluno?.saudeOcular)),
        },
        temDado('saudeAuditiva') && {
            titulo: 'Saúde auditiva',
            largura: 14,
            valor: ({ aluno }) => semTraco(formatarSaudeAuditiva(aluno?.saudeAuditiva)),
        },
    ].filter(Boolean);

    const pasta = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(pasta, montarAba(XLSX, colunasRegistros, registros), 'Registros');
    XLSX.utils.book_append_sheet(pasta, montarAba(XLSX, colunasAlunos, linhasAlunos), 'Alunos');
    return pasta;
}

export function nomeDoArquivo(agora = new Date()) {
    const dois = (n) => String(n).padStart(2, '0');
    return `registros-pse_${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}.xlsx`;
}

/** Gera a planilha e inicia o download no navegador */
export function exportarRegistrosParaPlanilha(registros, opcoes = {}) {
    const pasta = montarPastaDeTrabalho(XLSX, registros, opcoes);
    XLSX.writeFile(pasta, nomeDoArquivo(), { compression: true });
}
