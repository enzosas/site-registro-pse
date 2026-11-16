import '../styles/components/OpcaoBinariaGroup.css';

export function OpcaoBinariaGroup({ label, opcoes, valorAtual, onChange }) {
    const { POSITIVO, NEGATIVO, ...outrasOpcoes } = opcoes || {};

    // Tocar na opção já marcada não desmarca (evita apagar a resposta com um toque duplo);
    // para trocar a resposta, basta escolher outra opção
    const handleSelecionar = (valor) => {
        if (valorAtual === valor) return;
        onChange(valor);
    };

    const BASE = 'app__tela-vacinacao-grupo-botoes__botao';

    // aria-pressed informa ao leitor de tela (TalkBack, VoiceOver) qual opção está marcada
    const renderizarBotao = (chave, opcao, classeSelecionado) => {
        const selecionado = valorAtual === opcao.valor;
        return (
            <button
                key={chave}
                type="button"
                aria-pressed={selecionado}
                className={`${BASE} ${selecionado ? classeSelecionado : ''}`}
                onClick={() => handleSelecionar(opcao.valor)}
            >
                {opcao.label}
            </button>
        );
    };

    return (
        <div className='app__input-group'>
            {label && <label>{label}</label>}
            <div className='app__tela-vacinacao-grupo-botoes' role="group" aria-label={label}>
                {POSITIVO && renderizarBotao('POSITIVO', POSITIVO, `${BASE}__sim`)}
                {NEGATIVO && renderizarBotao('NEGATIVO', NEGATIVO, `${BASE}__nao`)}
                {Object.entries(outrasOpcoes).map(([chave, opcao]) =>
                    renderizarBotao(chave, opcao, `${BASE}__neutro`)
                )}
            </div>
        </div>
    );
}
