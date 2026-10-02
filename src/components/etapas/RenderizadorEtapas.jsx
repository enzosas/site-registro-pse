import { useRegistro } from '../../context/RegistroPSEContext';
import { HeaderRegistro } from '../HeaderRegistro';
import { ETAPAS } from '../../utils/constantes';

import { Etapa1Data } from './Etapa1Data';
import { Etapa2Profissionais } from './Etapa2Profissionais';
import { Etapa3Escola } from './Etapa3Escola';
import { Etapa4Turma } from './Etapa4Turma';
import { Etapa5Eixos } from './Etapa5Eixos';
import { Etapa6Presenca } from './Etapa6Presenca';
import { Etapa7ColetaDados } from './Etapa7ColetaDados';
import { Etapa8Conclusao } from './Etapa8Conclusao';

export function RenderizadorEtapas() {
    const {
        etapaAtualId,
        passoVisual,
        totalEtapas,
        cardRef,
    } = useRegistro();

    const etapasMap = {
        [ETAPAS.DATA]: <Etapa1Data />,
        [ETAPAS.PROFISSIONAIS]: <Etapa2Profissionais />,
        [ETAPAS.ESCOLA]: <Etapa3Escola />,
        [ETAPAS.TURMA]: <Etapa4Turma />,
        [ETAPAS.EIXOS]: <Etapa5Eixos />,
        [ETAPAS.PRESENCA]: <Etapa6Presenca />,
        [ETAPAS.COLETA]: <Etapa7ColetaDados />,
        [ETAPAS.CONCLUSAO]: <Etapa8Conclusao />,
    };

    return (
        <>
            <HeaderRegistro
                etapaAtual={passoVisual}
                totalEtapas={totalEtapas}
            />
            <div className="app__card" ref={cardRef}>
                {etapasMap[etapaAtualId] || null}
            </div>
        </>
    );
}