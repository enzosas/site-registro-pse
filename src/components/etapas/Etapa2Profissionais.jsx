import { IconeVoltar } from '../Icones';

export function Etapa2Profissionais({
    registradorNome,
    profissionaisResponsaveis = [],
    setProfissionaisResponsaveis,
    onAvancar,
    onVoltar,
}) {
    const handleAlterarProfissional = (index, novoValor) => {
        setProfissionaisResponsaveis((prev) => {
            const copia = [...prev];
            copia[index] = novoValor;
            return copia;
        });
    };

    const handleAdicionarProfissional = () => {
        setProfissionaisResponsaveis((prev) => [...prev, '']);
    };

    const handleRemoverProfissional = (indexRemover) => {
        setProfissionaisResponsaveis((prev) =>
            prev.filter((_, index) => index !== indexRemover)
        );
    };

    const listaProfissionais =
        profissionaisResponsaveis.length > 0 ? profissionaisResponsaveis : [''];

    const estaVazio = !listaProfissionais.some((p) => p && p.trim().length > 0);

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <h2 className="app__title">Preencha os profissionais responsáveis:</h2>

            {listaProfissionais.map((profissional, index) => (
                <div key={index} className="app__tela-profissionais__row">
                    <input
                        type="text"
                        placeholder={`Escreva aqui o profissional ${index + 1}`}
                        maxLength="300"
                        className="app__date-input app__tela-profissionais__input"
                        value={profissional}
                        onChange={(e) => handleAlterarProfissional(index, e.target.value)}
                    />

                    {listaProfissionais.length > 1 && (
                        <button
                            type="button"
                            className="app__buttonSecondary app__tela-profissionais__btn-remover"
                            onClick={() => handleRemoverProfissional(index)}
                            title="Remover profissional"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}

            <button
                type="button"
                className="app__buttonSecondary app__tela-profissionais__btn-adicionar"
                onClick={handleAdicionarProfissional}
            >
                + Adicionar novo responsável
            </button>

            <div className="app__footer">
                {registradorNome && (
                    <p>O responsável por esse registro é: <strong>{registradorNome}</strong>.</p>
                )}
                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={onAvancar}
                    disabled={estaVazio}
                >
                    Avançar
                </button>
            </div>
        </>
    );
}