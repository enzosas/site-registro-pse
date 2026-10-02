import '../styles/components/OpcaoBinariaGroup.css';

export function OpcaoBinariaGroup({ label, opcoes, valorAtual, onChange }) {
    const { POSITIVO, NEGATIVO, ...outrasOpcoes } = opcoes || {};

    const handleToggle = (valor) => {
        onChange(valorAtual === valor ? null : valor);
    };

    return (
        <div className='app__input-group'>
            {label && <label>{label}</label>}
            <div className='app__tela-vacinacao-grupo-botoes'>
                {POSITIVO && (
                    <button
                        type="button"
                        className={`app__tela-vacinacao-grupo-botoes__botao ${valorAtual === POSITIVO.valor ? 'app__tela-vacinacao-grupo-botoes__botao__sim' : ''
                            }`}
                        onClick={() => handleToggle(POSITIVO.valor)}
                    >
                        {POSITIVO.label}
                    </button>
                )}

                {NEGATIVO && (
                    <button
                        type="button"
                        className={`app__tela-vacinacao-grupo-botoes__botao ${valorAtual === NEGATIVO.valor ? 'app__tela-vacinacao-grupo-botoes__botao__nao' : ''
                            }`}
                        onClick={() => handleToggle(NEGATIVO.valor)}
                    >
                        {NEGATIVO.label}
                    </button>
                )}

                {Object.entries(outrasOpcoes).map(([chave, op]) => (
                    <button
                        key={chave}
                        type="button"
                        className={`app__tela-vacinacao-grupo-botoes__botao ${valorAtual === op.valor ? 'app__tela-vacinacao-grupo-botoes__botao__neutro' : ''
                            }`}
                        onClick={() => handleToggle(op.valor)}
                    >
                        {op.label}
                    </button>
                ))}
            </div>
        </div>
    );
}