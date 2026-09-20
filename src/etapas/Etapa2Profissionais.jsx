import { IconeVoltar } from '../components/Icones';

export function Etapa2Profissionais({
    registradorNome,
    profissionaisResponsaveis,
    setProfissionaisResponsaveis,
    onAvancar,
    onVoltar,
}) {

    return (
        <>
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>

            <p className='app__title'>Preencha os profisisionais responsáveis:</p>
            
            <p>O responsável por esse registro é: {registradorNome}.</p>

            <div className='app__footer'>
                <button
                    onClick={onAvancar}
                    className={'app__buttonMain'}
                    disabled={false}
                >
                    <p>Avançar</p>
                </button>
            </div>
        </>
    );
}