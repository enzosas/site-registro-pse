import { BarraProgresso } from './BarraProgresso';

export function HeaderRegistro({ etapaAtual, totalEtapas = 6 }) {
    return (
        <>
            <div className='app--header-container'>
                <p className='app--header'>Geração de Registro</p>
                <img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app--header-logo" />
            </div>
            <BarraProgresso etapaAtual={etapaAtual} totalEtapas={totalEtapas} />
        </>
    );
}