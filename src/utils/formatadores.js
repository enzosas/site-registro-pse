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