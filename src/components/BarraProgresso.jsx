import { IconeCheck } from './Icones';

export function BarraProgresso({ etapaAtual, totalEtapas }) {
    const passos = Array.from({ length: totalEtapas }, (_, i) => i + 1);

    return (
        <div className="app--progress-bar">
            {passos.map((passo, index) => {
                let statusClass = 'pending';
                if (passo < etapaAtual) statusClass = 'completed';
                if (passo === etapaAtual) statusClass = 'current';

                return (
                    <div key={passo} className="app--progress-step-container">
                        <div className={`app--progress-step ${statusClass}`}>
                            {statusClass === 'completed' && <IconeCheck bold />}
                        </div>
                        {index < totalEtapas - 1 && (
                            <div className={`app--progress-line ${passo < etapaAtual ? 'completed' : 'pending'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}