import {
    OPCOES_VACINACAO,
    OPCOES_SAUDE_OCULAR,
    OPCOES_SAUDE_AUDITIVA,
    TIPO_USUARIO,
    EIXOS_TEMATICOS,
    EIXOS_ID
} from './constantes';

export const formatarData = (data) => {
    if (!data) return '';
    return data;
};

export const formatarNome = (nome) => {
    if (!nome) return '';
    const siglas = ['EMEF', 'EMEI', 'EE', 'CMEI'];
    const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
    const regexRomano = /^(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)$/i;

    return nome
        .toLowerCase()
        .split(' ')
        .map((palavra, index) => {
            const palavraMaiuscula = palavra.toUpperCase();
            if (siglas.includes(palavraMaiuscula) || regexRomano.test(palavra)) {
                return palavraMaiuscula;
            }
            if (preposicoes.includes(palavra) && index !== 0) {
                return palavra;
            }
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(' ');
};

// Formatação própria para nomes de turma (ex.: "EJA EPT", "Maternal II E Tarde", "6 -Tarde").
// Só altera maiúsculas/minúsculas, nunca o texto, para não afetar a comparação de turmas.
const SIGLAS_TURMA = ['EJA', 'EPT', 'AEE', 'EMEF', 'EMEI', 'CMEI'];
const PREPOSICOES_TURMA = ['de', 'da', 'do', 'das', 'dos'];
const REGEX_ROMANO_TURMA = /^[IVX]+$/i;

function formatarTrechoTurma(trecho, ehInicioDePalavra) {
    const maiusculo = trecho.toUpperCase();
    const minusculo = trecho.toLowerCase();

    if (/\d/.test(trecho)) return maiusculo; // "5a" -> "5A", "a1" -> "A1", "1º" -> "1º"
    if (trecho.length === 1) return maiusculo; // letra da turma: "A", "B", "E"
    if (SIGLAS_TURMA.includes(maiusculo)) return maiusculo;
    if (REGEX_ROMANO_TURMA.test(trecho)) return maiusculo; // "II", "III", "IV"
    if (!ehInicioDePalavra || PREPOSICOES_TURMA.includes(minusculo)) return minusculo;
    return minusculo.charAt(0).toUpperCase() + minusculo.slice(1);
}

export function formatarNomeTurma(nome) {
    if (!nome) return '';

    return String(nome)
        .split(' ')
        .map((palavra, indicePalavra) => {
            // Separa a palavra em trechos de letras/números e os símbolos entre eles
            const partes = palavra.split(/([^\p{L}\p{N}º°ª]+)/u);
            let ehInicio = true;

            return partes
                .map((parte) => {
                    if (!parte) return parte;
                    if (!/[\p{L}\p{N}]/u.test(parte)) {
                        // Depois de ".", "(" ou de um símbolo no começo da palavra, a próxima letra
                        // inicia uma nova palavra ("Educ.Infant.", "-Tarde"); depois de "-" no meio
                        // ("Pré-escola") continua minúscula
                        if (/[.(/]/.test(parte)) ehInicio = true;
                        return parte;
                    }
                    const preposicaoNoInicio = indicePalavra === 0 && ehInicio;
                    const resultado = preposicaoNoInicio
                        ? formatarTrechoTurma(parte, true).replace(/^\p{Ll}/u, (l) => l.toUpperCase())
                        : formatarTrechoTurma(parte, ehInicio);
                    ehInicio = false;
                    return resultado;
                })
                .join('');
        })
        .join(' ');
}

export function formatarProfissionais(profissionais) {
    if (!profissionais) return '-';
    if (Array.isArray(profissionais)) {
        return profissionais
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter(Boolean)
            .join(', ') || '-';
    }
    return String(profissionais).trim() || '-';
}

export function formatarDataHora(timestamp) {
    if (!timestamp) return null;
    const data = new Date(timestamp);
    if (isNaN(data.getTime())) return null;

    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatarDataComTurno(dia, mes, ano, turno) {
    return `${dia}/${mes}/${ano} - Turno da ${turno}`
}

export function formatarTurmas(turmas) {
    if (!turmas) return '-';
    // Registros salvos guardam as turmas como texto "Turma 1, Turma 2"
    const lista = Array.isArray(turmas) ? turmas : String(turmas).split(',');
    return lista
        .map((t) => (typeof t === 'string' ? t : t?.nome || ''))
        .map((nome) => formatarNomeTurma(nome.trim()))
        .filter(Boolean)
        .join(', ') || '-';
}


export const formatarVacinacao = (valor) => {
    switch (valor) {
        case OPCOES_VACINACAO.POSITIVO.valor:
            return OPCOES_VACINACAO.POSITIVO.label;
        case OPCOES_VACINACAO.NEGATIVO.valor:
            return OPCOES_VACINACAO.NEGATIVO.label;
        case OPCOES_VACINACAO.NAO_APRESENTADA.valor:
            return OPCOES_VACINACAO.NAO_APRESENTADA.label;
        default:
            return '-';
    }
};

export const formatarSaudeAuditiva = (valor) => {
    if (valor === OPCOES_SAUDE_AUDITIVA.POSITIVO.valor) return OPCOES_SAUDE_AUDITIVA.POSITIVO.label;
    if (valor === OPCOES_SAUDE_AUDITIVA.NEGATIVO.valor) return OPCOES_SAUDE_AUDITIVA.NEGATIVO.label;
    return '-';
};

export const formatarSaudeOcular = (valor) => {
    if (valor === OPCOES_SAUDE_OCULAR.POSITIVO.valor) return OPCOES_SAUDE_OCULAR.POSITIVO.label
    if (valor === OPCOES_SAUDE_OCULAR.NEGATIVO.valor) return OPCOES_SAUDE_OCULAR.NEGATIVO.label
    return '-'
}

export function formatarTipoUsuario(tipo) {
    if (!tipo) return '';
    return TIPO_USUARIO[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
}

export function formatarEixosTematicosSelecionados(idsEixosSelecionados = [], nomeEixoLocal = '') {
    return EIXOS_TEMATICOS
        .filter((eixo) => idsEixosSelecionados.includes(eixo.id))
        .map((eixo) => {
            if (eixo.id === EIXOS_ID.TEMATICA_LOCAL && nomeEixoLocal?.trim()) {
                return `${eixo.label}: ${nomeEixoLocal.trim()}`;
            }
            return eixo.label;
        });
}

export function formatarDataIso(dataIso) {
    if (!dataIso) return '-';
    const str = String(dataIso).trim().slice(0, 10);

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        return str;
    }

    if (str.includes('-')) {
        const [ano, mes, dia] = str.split('-');
        if (ano && mes && dia) {
            return `${dia}/${mes}/${ano}`;
        }
    }

    return str;
}

export function formatarListaParaTexto(valor) {
    if (!valor) return '-';
    if (Array.isArray(valor)) return valor.filter(Boolean).join('; ') || '-';
    return String(valor);
}

export function compactarEixo(nomeEixo) {
    if (!nomeEixo) return '';
    return nomeEixo
        .replace(/^\d+\.\s*/, '')
        .replace(/\s*\([^)]*\)/g, '')
        .trim();
}