import '../styles/components/OpcaoBinariaGroup.css';

export function OpcaoBinariaGroup({ label, opcoes, valorAtual, onChange }) {
    return (
        <div className='app--input-group'>
            <label>{label}</label>
            <div className='app--tela-vacinacao-grupo-botoes'>
                <button
                    type="button"
                    className={`app--tela-vacinacao-grupo-botoes--botao ${valorAtual === opcoes.POSITIVO.valor ? 'app--tela-vacinacao-grupo-botoes--botao__sim' : ''
                        }`}
                    onClick={() => onChange(valorAtual === opcoes.POSITIVO.valor ? null : opcoes.POSITIVO.valor)}
                >
                    {opcoes.POSITIVO.label}
                </button>
                <button
                    type="button"
                    className={`app--tela-vacinacao-grupo-botoes--botao ${valorAtual === opcoes.NEGATIVO.valor ? 'app--tela-vacinacao-grupo-botoes--botao__nao' : ''
                        }`}
                    onClick={() => onChange(valorAtual === opcoes.NEGATIVO.valor ? null : opcoes.NEGATIVO.valor)}
                >
                    {opcoes.NEGATIVO.label}
                </button>
            </div>
        </div>
    );
}