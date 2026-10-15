export function MensagemErro({ mensagem, style }) {
    if (!mensagem) return null;

    return (
        <div className="app__mensagem-erro" style={style}>
            {mensagem}
        </div>
    );
}