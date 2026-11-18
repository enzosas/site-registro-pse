// Funções para os campos de altura e peso da coleta de dados

// Faixas consideradas plausíveis; fora delas o app mostra um aviso (sem bloquear)
export const LIMITES_ALTURA_CM = { min: 50, max: 220 };
export const LIMITES_PESO_KG = { min: 5, max: 200 };

// Mantém só dígitos e UM separador decimal (vírgula ou ponto), como o usuário digitou
export function filtrarEntradaDecimal(valor) {
    const somentePermitidos = String(valor ?? '').replace(/[^\d.,]/g, '');
    const indiceSeparador = somentePermitidos.search(/[.,]/);
    if (indiceSeparador === -1) return somentePermitidos;
    return (
        somentePermitidos.slice(0, indiceSeparador + 1) +
        somentePermitidos.slice(indiceSeparador + 1).replace(/[.,]/g, '')
    );
}

// Converte "32,5" -> 32.5. Retorna null se não houver um número válido
export function numeroDecimal(valor) {
    if (valor === null || valor === undefined) return null;
    const texto = String(valor).trim().replace(',', '.');
    if (!/^\d+(\.\d+)?$|^\d+\.$|^\.\d+$/.test(texto)) return null;
    const numero = Number.parseFloat(texto);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
}

// Valor a ser salvo no registro: sempre com ponto decimal ("32.5"), ou null
export function normalizarDecimal(valor) {
    const numero = numeroDecimal(valor);
    return numero === null ? null : String(numero);
}

export function avisoAltura(valor) {
    const numero = numeroDecimal(valor);
    if (numero === null) return '';
    if (numero < 3) return 'Parece estar em metros. Informe a altura em centímetros (ex.: 145).';
    if (numero < LIMITES_ALTURA_CM.min || numero > LIMITES_ALTURA_CM.max) {
        return 'Altura fora do comum. Confira o valor.';
    }
    return '';
}

export function avisoPeso(valor) {
    const numero = numeroDecimal(valor);
    if (numero === null) return '';
    if (numero < LIMITES_PESO_KG.min || numero > LIMITES_PESO_KG.max) {
        return 'Peso fora do comum. Confira o valor.';
    }
    return '';
}
