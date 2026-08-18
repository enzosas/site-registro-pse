export const OPCOES_VACINACAO = {
    POSITIVO: {
        valor: 'completo',
        label: 'Completo',
        classe: 'app--tela-vacinacao-grupo-botoes--botao__sim'
    },
    NEGATIVO: {
        valor: 'incompleto',
        label: 'Incompleto',
        classe: 'app--tela-vacinacao-grupo-botoes--botao__nao'
    }
}

export const formatarVacinacao = (valor) => {
    if (valor === OPCOES_VACINACAO.POSITIVO.valor) return OPCOES_VACINACAO.POSITIVO.label
    if (valor === OPCOES_VACINACAO.NEGATIVO.valor) return OPCOES_VACINACAO.NEGATIVO.label
    return '-'
}