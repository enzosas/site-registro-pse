import { IconeCheck } from './Icones';
import '../styles/components/BarraProgresso.css';

export function BarraProgresso({ etapaAtual, totalEtapas }) {
    const passos = Array.from({ length: totalEtapas }, (_, i) => i + 1);

    return (
        <div className="app__progress-bar">
            {passos.map((passo, index) => {
                let statusClass = 'pending';
                if (passo < etapaAtual) statusClass = 'completed';
                if (passo === etapaAtual) statusClass = 'current';

                return (
                    <div key={passo} className="app__progress-step-container">
                        <div className={`app__progress-step ${statusClass}`}>
                            {statusClass === 'completed' && <IconeCheck bold />}
                        </div>
                        {index < totalEtapas - 1 && (
                            <div className={`app__progress-line ${passo < etapaAtual ? 'completed' : 'pending'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}