export const OPCOES_VACINACAO = {
    POSITIVO: {
        valor: 'completo',
        label: 'Completo',
    },
    NEGATIVO: {
        valor: 'incompleto',
        label: 'Incompleto',
    }
}

export const formatarVacinacao = (valor) => {
    if (valor === OPCOES_VACINACAO.POSITIVO.valor) return OPCOES_VACINACAO.POSITIVO.label
    if (valor === OPCOES_VACINACAO.NEGATIVO.valor) return OPCOES_VACINACAO.NEGATIVO.label
    return '-'
}

export const OPCOES_SAUDE_OCULAR = {
    POSITIVO: {
        valor: 'normal',
        label: 'Normal',
    },
    NEGATIVO: {
        valor: 'alterada',
        label: 'Alterada',
    }
}

export const formatarSaudeOcular = (valor) => {
    if (valor === OPCOES_SAUDE_OCULAR.POSITIVO.valor) return OPCOES_SAUDE_OCULAR.POSITIVO.label
    if (valor === OPCOES_SAUDE_OCULAR.NEGATIVO.valor) return OPCOES_SAUDE_OCULAR.NEGATIVO.label
    return '-'
}