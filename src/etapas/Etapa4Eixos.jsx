import { IconeVoltar } from '../components/Icones';
import * as Constantes from '../constantes';

export function Etapa4Eixos({
    idsEixosSelecionados,
    toggleEixo,
    temEixoLocal,
    nomeEixoLocal,
    handleAtualizarNomeEixoLocal,
    observacoes,
    handleAtualizarObservacoes,
    onAvancar,
    onVoltar,
}) {
    const isValido = idsEixosSelecionados.length > 0;

    return (
        <>
            <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app--title'>
                Selecione o(s) eixo(s) temático(s) contemplado(s) na ação desenvolvida:
            </p>

            <div className='app--tela-com-lista--gap'>
                <div className='app--list'>
                    {Constantes.EIXOS_TEMATICOS.map((eixo) => (
                        <label key={eixo.id}>
                            <input
                                type="checkbox"
                                checked={idsEixosSelecionados.includes(eixo.id)}
                                onChange={() => toggleEixo(eixo.id)}
                            />
                            {eixo.label}
                        </label>
                    ))}
                </div>

                {temEixoLocal && (
                    <div className='app--input-group'>
                        <label>Nome da temática local</label>
                        <input
                            type="text"
                            placeholder="Digite aqui o nome da temática"
                            value={nomeEixoLocal}
                            onChange={(e) => handleAtualizarNomeEixoLocal(e.target.value)}
                        />
                    </div>
                )}

                <div className='app--input-group'>
                    <label>Descrição da atividade realizada</label>
                    <input
                        type="text"
                        placeholder="Descreva brevemente a atividade realizada"
                        value={observacoes}
                        onChange={(e) => handleAtualizarObservacoes(e.target.value)}
                    />
                </div>

                <div className='app--footer'>
                    <button
                        className={'app--buttonMain'}
                        onClick={onAvancar}
                        disabled={!isValido}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </div>
        </>
    );
}