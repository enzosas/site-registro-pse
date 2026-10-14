import { useRegistro } from '../context/RegistroPSEContext';
import { IconeCheck } from './Icones';
import '../styles/components/BarraProgresso.css';

export function BarraProgresso({ etapaAtual, totalEtapas }) {
    const { registroSalvo } = useRegistro();

    const passos = Array.from({ length: totalEtapas }, (_, i) => i + 1);

    return (
        <div className="app__progress-bar">
            {passos.map((passo, index) => {
                let statusClass = 'pending';

                if (registroSalvo || passo < etapaAtual) {
                    statusClass = 'completed';
                } else if (passo === etapaAtual) {
                    statusClass = 'current';
                }

                const linhaConcluida = registroSalvo || passo < etapaAtual;

                return (
                    <div key={passo} className="app__progress-step-container">
                        <div className={`app__progress-step ${statusClass}`}>
                            {statusClass === 'completed' && <IconeCheck bold />}
                        </div>
                        {index < totalEtapas - 1 && (
                            <div className={`app__progress-line ${linhaConcluida ? 'completed' : 'pending'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}