import { BarraProgresso } from './BarraProgresso';
import '../styles/components/HeaderRegistro.css';

export function HeaderRegistro({ etapaAtual, totalEtapas = 6 }) {
    return (
        <>
            <div className='app__header-container'>
                <p className='app__header'>Geração de Registro</p>
                <img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app__header-logo" />
            </div>
            <BarraProgresso etapaAtual={etapaAtual} totalEtapas={totalEtapas} />
        </>
    );
}