// Armazenamento no próprio aparelho (localStorage) para:
//  - o RASCUNHO do registro em andamento (recuperar se a aba fechar, a página
//    recarregar ou a sessão expirar);
//  - a FILA de registros que não puderam ser enviados por falta de internet.
// Tudo é separado por usuário: um usuário não vê o rascunho/fila de outro.
// Se o navegador bloquear o armazenamento, as funções simplesmente não guardam nada.

const VERSAO_RASCUNHO = 1;
const VALIDADE_RASCUNHO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const chaveRascunho = (usuarioId) => `registroPse:rascunho:${usuarioId}`;
const chaveFila = (usuarioId) => `registroPse:fila:${usuarioId}`;

function ler(chave) {
    try {
        const texto = localStorage.getItem(chave);
        return texto ? JSON.parse(texto) : null;
    } catch {
        return null;
    }
}

function gravar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch {
        return false;
    }
}

function apagar(chave) {
    try {
        localStorage.removeItem(chave);
    } catch {
        // nada a fazer
    }
}

// Código único do registro, gerado no aparelho. O banco recusa um segundo registro
// com o mesmo código, o que evita duplicados quando um envio é repetido.
export function gerarIdCliente() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ---------------------------------------------------------------- rascunho

export function salvarRascunho(usuarioId, dados) {
    if (!usuarioId) return;
    gravar(chaveRascunho(usuarioId), { versao: VERSAO_RASCUNHO, salvoEm: Date.now(), dados });
}

export function lerRascunho(usuarioId) {
    if (!usuarioId) return null;
    const rascunho = ler(chaveRascunho(usuarioId));
    if (!rascunho || rascunho.versao !== VERSAO_RASCUNHO || !rascunho.dados) return null;
    if (Date.now() - rascunho.salvoEm > VALIDADE_RASCUNHO_MS) {
        removerRascunho(usuarioId);
        return null;
    }
    return rascunho;
}

export function removerRascunho(usuarioId) {
    if (!usuarioId) return;
    apagar(chaveRascunho(usuarioId));
}

// ---------------------------------------------------------- fila de envio
// Cada item: { idCliente, payload, resumo, criadoEm, status: 'pendente' | 'erro', erro }

export function lerFila(usuarioId) {
    if (!usuarioId) return [];
    const fila = ler(chaveFila(usuarioId));
    return Array.isArray(fila) ? fila : [];
}

function gravarFila(usuarioId, fila) {
    if (fila.length === 0) apagar(chaveFila(usuarioId));
    else gravar(chaveFila(usuarioId), fila);
}

export function adicionarNaFila(usuarioId, item) {
    if (!usuarioId) return false;
    const fila = lerFila(usuarioId).filter((i) => i.idCliente !== item.idCliente);
    fila.push({ ...item, criadoEm: Date.now(), status: 'pendente', erro: '' });
    return gravar(chaveFila(usuarioId), fila);
}

export function removerDaFila(usuarioId, idCliente) {
    gravarFila(usuarioId, lerFila(usuarioId).filter((i) => i.idCliente !== idCliente));
}

export function atualizarItemDaFila(usuarioId, idCliente, alteracoes) {
    gravarFila(
        usuarioId,
        lerFila(usuarioId).map((i) => (i.idCliente === idCliente ? { ...i, ...alteracoes } : i))
    );
}
