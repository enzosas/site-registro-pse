import { AvisoCartao } from './AvisoCartao';

// Mostra uma explicação de erro (gerada por explicarErro/erroLocal) no cartão de aviso:
// título = o que aconteceu; texto = causa provável e o que fazer; código para o suporte.
// onTentarNovamente: mostra o botão "Tentar de novo".
export function AvisoErro({ explicacao, onTentarNovamente, emFundoBranco = false, acoesExtras = null }) {
    if (!explicacao) return null;

    const acoes =
        onTentarNovamente || acoesExtras ? (
            <>
                {onTentarNovamente && (
                    <button
                        type="button"
                        className="aviso-cartao__botao aviso-cartao__botao--principal"
                        onClick={onTentarNovamente}
                    >
                        Tentar de novo
                    </button>
                )}
                {acoesExtras}
            </>
        ) : null;

    return (
        <AvisoCartao tipo="erro" titulo={explicacao.oQue} emFundoBranco={emFundoBranco} acoes={acoes}>
            {explicacao.porque && <p>{explicacao.porque}</p>}
            {explicacao.oQueFazer && <p>{explicacao.oQueFazer}</p>}
            {explicacao.codigo && <p className="aviso-cartao__codigo">Código: {explicacao.codigo}</p>}
        </AvisoCartao>
    );
}
