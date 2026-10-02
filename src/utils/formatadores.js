import {
    OPCOES_VACINACAO,
    OPCOES_SAUDE_OCULAR,
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
    if (Array.isArray(turmas)) {
        return turmas
            .map((t) => (typeof t === 'string' ? t.trim() : t?.nome?.trim()))
            .filter(Boolean)
            .join(', ') || '-';
    }
    return String(turmas).trim() || '-';
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