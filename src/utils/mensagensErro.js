// Tradutor de erros: transforma um erro técnico (do Supabase, do banco ou do navegador)
// em uma explicação clara para quem usa o aplicativo.
//
// Toda explicação responde três perguntas:
//   oQue      – o que aconteceu (ex.: "Não foi possível salvar o registro.")
//   porque    – a causa provável
//   oQueFazer – o que a pessoa pode fazer
// e traz um "codigo" legível para o suporte, no formato CATEGORIA-códigoOriginal
// (ex.: DUPLICADO-23505, SERVIDOR-503, REDE).
//
// "temporario" indica erros que podem se resolver sozinhos (sem internet, servidor
// fora do ar): nesses casos vale tentar de novo automaticamente.

export const EMAIL_SUPORTE = 'enzo.silveira@acad.ufsm.br';

const FAZER_SUPORTE = `Tente novamente. Se o problema continuar, avise o suporte (${EMAIL_SUPORTE}) informando o código abaixo.`;

const CATEGORIAS = {
    rede: {
        porque: 'O aparelho está sem internet ou a conexão caiu.',
        oQueFazer: 'Verifique o Wi-Fi ou os dados móveis e tente de novo.',
        temporario: true,
    },
    servidor: {
        porque: 'O servidor está temporariamente indisponível (pode estar em manutenção ou reiniciando).',
        oQueFazer: 'Aguarde alguns minutos e tente novamente.',
        temporario: true,
    },
    tempo: {
        porque: 'O servidor demorou demais para responder, geralmente por conexão lenta.',
        oQueFazer: 'Aguarde um pouco e tente novamente.',
        temporario: true,
    },
    limite: {
        porque: 'Muitas tentativas em pouco tempo.',
        oQueFazer: 'Aguarde um minuto e tente novamente.',
        temporario: true,
    },
    sessao: {
        porque: 'Sua sessão expirou ou foi encerrada.',
        oQueFazer: 'Saia, entre novamente com a sua conta e tente de novo.',
        temporario: false,
    },
    permissao: {
        porque: 'Sua conta não tem permissão para esta ação.',
        oQueFazer: `Se você acredita que deveria ter acesso, fale com a coordenação ou com o suporte (${EMAIL_SUPORTE}).`,
        temporario: false,
    },
    duplicado: {
        porque: 'Já existe um item igual cadastrado.',
        oQueFazer: 'Confira se ele já não foi cadastrado antes.',
        temporario: false,
    },
    referencia: {
        porque: 'Um item ligado a este (como uma escola ou UBS) foi removido do sistema.',
        oQueFazer: `Confira os dados e tente novamente. Se continuar, avise o suporte (${EMAIL_SUPORTE}).`,
        temporario: false,
    },
    dado: {
        porque: 'Algum dado está em um formato que o sistema não aceita.',
        oQueFazer: FAZER_SUPORTE,
        temporario: false,
    },
    versao: {
        porque: 'O aplicativo aberto neste aparelho parece desatualizado em relação ao servidor.',
        oQueFazer: `Recarregue a página. Se continuar, avise o suporte (${EMAIL_SUPORTE}) informando o código abaixo.`,
        temporario: false,
    },
    desconhecido: {
        porque: 'Ocorreu um erro inesperado.',
        oQueFazer: FAZER_SUPORTE,
        temporario: false,
    },
};

const ROTULOS_CODIGO = {
    rede: 'REDE',
    servidor: 'SERVIDOR',
    tempo: 'TEMPO',
    limite: 'LIMITE',
    sessao: 'SESSAO',
    permissao: 'PERMISSAO',
    duplicado: 'DUPLICADO',
    referencia: 'REFERENCIA',
    dado: 'DADO',
    versao: 'VERSAO',
    desconhecido: 'ERRO',
};

function ehFalhaDeRede(erro, status) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
    if (status === 0) return true;
    const mensagem = String(erro?.message || erro || '');
    return /failed to fetch|networkerror|load failed|network request failed|fetch failed|internet disconnected/i.test(mensagem);
}

// Descobre a categoria a partir do erro (Supabase/PostgREST, PostgreSQL, HTTP ou JS)
function classificar(erro, status) {
    const codigoBanco = String(erro?.code || '');
    const mensagem = String(erro?.message || erro || '');

    if (ehFalhaDeRede(erro, status)) return { categoria: 'rede', original: '' };
    if (status === 408 || status === 504 || /timeout|timed out/i.test(mensagem)) return { categoria: 'tempo', original: status || '' };
    if (status === 429) return { categoria: 'limite', original: 429 };
    if (status >= 500) return { categoria: 'servidor', original: status };
    if (status === 401 || /^PGRST30/.test(codigoBanco) || /jwt/i.test(mensagem)) return { categoria: 'sessao', original: status || codigoBanco };
    if (codigoBanco === '42501' || status === 403) return { categoria: 'permissao', original: codigoBanco || status };
    if (codigoBanco === '23505') return { categoria: 'duplicado', original: codigoBanco };
    if (codigoBanco === '23503') return { categoria: 'referencia', original: codigoBanco };
    if (['42703', '42P01', 'PGRST204', 'PGRST202', 'PGRST205'].includes(codigoBanco)) return { categoria: 'versao', original: codigoBanco };
    if (/^22|^23/.test(codigoBanco)) return { categoria: 'dado', original: codigoBanco };
    return { categoria: 'desconhecido', original: codigoBanco || status || '' };
}

function montarCodigo(categoria, original) {
    const rotulo = ROTULOS_CODIGO[categoria] || 'ERRO';
    return original ? `${rotulo}-${original}` : rotulo;
}

/**
 * Explica um erro técnico.
 * @param {*} erro      objeto de erro do Supabase ({ code, message }), Error do JS ou texto
 * @param {object} opcoes
 *   oQue        – frase do que a pessoa tentava fazer (ex.: "Não foi possível salvar o registro.")
 *   status      – status HTTP da resposta, quando houver
 *   porCategoria – ajustes de texto por categoria, ex.:
 *                  { duplicado: { porque: 'Já existe uma UBS com este nome.' },
 *                    permissao: { oQueFazer: 'Saia e entre novamente.' } }
 */
export function explicarErro(erro, { oQue = 'Não foi possível concluir a ação.', status, porCategoria = {} } = {}) {
    const { categoria, original } = classificar(erro, status);
    const base = CATEGORIAS[categoria];
    const ajuste = porCategoria[categoria] || {};
    const explicacao = {
        categoria,
        oQue,
        porque: ajuste.porque || base.porque,
        oQueFazer: ajuste.oQueFazer || base.oQueFazer,
        codigo: montarCodigo(categoria, original),
        temporario: base.temporario,
        detalheTecnico: String(erro?.message || erro || ''),
    };
    explicacao.texto = textoDaExplicacao(explicacao);
    return explicacao;
}

/** Explicação para falhas que acontecem no próprio aparelho (copiar, ler planilha, gerar PDF) */
export function erroLocal({ oQue, porque, oQueFazer = FAZER_SUPORTE, codigo }) {
    const explicacao = { categoria: 'local', oQue, porque, oQueFazer, codigo, temporario: false, detalheTecnico: '' };
    explicacao.texto = textoDaExplicacao(explicacao);
    return explicacao;
}

/** Versão em texto corrido, para lugares que só aceitam uma frase */
export function textoDaExplicacao({ oQue, porque, oQueFazer, codigo }) {
    return [oQue, porque, oQueFazer, codigo ? `Código: ${codigo}` : ''].filter(Boolean).join(' ');
}
