import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar, IconeCheck } from '../Icones';
import { TELAS } from '../../utils/constantes';
import { MensagemErro } from '../MensagemErro';

export function Etapa8Conclusao() {
    const {
        salvandoBanco,
        registroSalvo,
        erroSalvarBanco,
        handleSalvarNoBanco,
        setTelaAtiva,
        reiniciarRegistro,
        voltarEtapa,
    } = useRegistro();

    const handleRetornarInicio = () => {
        if (!registroSalvo) {
            const confirmou = window.confirm(
                'Tem certeza de que deseja voltar para o início? Os dados da atividade não estão salvos e serão perdidos.'
            );
            if (!confirmou) return;
        }
        reiniciarRegistro();
        setTelaAtiva(TELAS.INICIAL);
    };

    return (
        <>
            <button
                type="button"
                className="app__botao-voltar"
                onClick={() => {
                    if (registroSalvo) {
                        reiniciarRegistro();
                    } else {
                        voltarEtapa();
                    }
                }}
                title={registroSalvo ? "Voltar ao início" : "Voltar à etapa anterior"}
            >
                <IconeVoltar />
            </button>
            <p className='app__title'>Tudo pronto!</p>
            <p className='app__tooltip'>Agora, revise as informações no resumo ou clique abaixo para registrar a atividade.</p>
            <button
                type="button"
                className='app__buttonSecondary app__buttonSecondary__left-anchor'
                onClick={handleRetornarInicio}
            >
                Voltar para o início
            </button>
            <div className='app__footer'>
                {erroSalvarBanco && (
                    <MensagemErro mensagem={erroSalvarBanco} />
                )}
                {registroSalvo && (
                    <p>Registro salvo! Você pode voltar para o início com o botão acima</p>
                )}
                <button
                    type="button"
                    className='app__buttonMain'
                    onClick={() => setTelaAtiva(TELAS.RESUMO)}
                >
                    <p>Ver resumo</p>
                </button>
                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={handleSalvarNoBanco}
                    disabled={salvandoBanco || registroSalvo}
                >
                    <p style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {registroSalvo
                            ? 'Registro Salvo'
                            : salvandoBanco
                                ? 'Salvando no banco...'
                                : 'Salvar Registro'}
                        {registroSalvo && <IconeCheck bold />}
                    </p>
                </button>
            </div>
        </>
    );
}