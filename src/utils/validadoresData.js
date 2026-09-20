/**
 * Verifica se os valores de dia, mês e ano formam uma data válida no calendário gregoriano.
 * @param {string|number} d - Dia
 * @param {string|number} m - Mês
 * @param {string|number} y - Ano
 * @returns {boolean}
 */
export function isDataValida(d, m, y) {
    const diaNum = Number(d);
    const mesNum = Number(m);
    const anoNum = Number(y);

    if (!diaNum || !mesNum || !anoNum) return false;
    if (mesNum < 1 || mesNum > 12) return false;
    if (anoNum < 1900 || anoNum > 2100) return false;

    const diasNoMes = new Date(anoNum, mesNum, 0).getDate();
    return diaNum >= 1 && diaNum <= diasNoMes;
}

/**
 * Valida uma string completa no formato DD/MM/AAAA.
 * @param {string} dataStr
 * @returns {boolean}
 */
export function isDataStringValida(dataStr) {
    if (!dataStr || typeof dataStr !== 'string') return false;
    const partes = dataStr.split('/');
    if (partes.length !== 3) return false;
    const [dia, mes, ano] = partes;
    if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return false;
    return isDataValida(dia, mes, ano);
}

/**
 * Aplica máscara progressiva DD/MM/AAAA em um valor digitado, removendo caracteres não-numéricos.
 * @param {string} valor
 * @returns {string}
 */
export function aplicarMascaraData(valor) {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8);

    if (apenasNumeros.length <= 2) {
        return apenasNumeros;
    }
    if (apenasNumeros.length <= 4) {
        return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    }
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4)}`;
}