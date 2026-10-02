import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import * as Constantes from '../../utils/constantes';

export function Etapa5Eixos() {
    const {
        idsEixosSelecionados,
        toggleEixo,
        temEixoLocal,
        nomeEixoLocal,
        setNomeEixoLocal,
        observacoes,
        setObservacoes,
        marcarTodosPresentes,
        avancarEtapa,
        voltarEtapa,
    } = useRegistro();

    const isValido = idsEixosSelecionados.length > 0;

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={voltarEtapa}>
                <IconeVoltar />
            </button>
            <p className='app__title'>
                Selecione o(s) eixo(s) temático(s) contemplado(s) na ação desenvolvida:
            </p>
            <div className='app__tela-com-lista__gap'>
                <div className='app__list'>
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
                    <div className='app__input-group'>
                        <label>Nome da temática local</label>
                        <input
                            type="text"
                            placeholder="Digite aqui o nome da temática"
                            value={nomeEixoLocal}
                            onChange={(e) => setNomeEixoLocal(e.target.value)}
                        />
                    </div>
                )}
                <div className='app__input-group'>
                    <label>Descrição da atividade realizada</label>
                    <input
                        type="text"
                        placeholder="Descreva brevemente a atividade realizada"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                    />
                </div>
                <div className='app__footer'>
                    <button
                        className={'app__buttonMain'}
                        onClick={() => {
                            marcarTodosPresentes();
                            avancarEtapa();
                        }}
                        disabled={!isValido}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </div>
        </>
    );
}