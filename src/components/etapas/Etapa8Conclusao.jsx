import { PDFDownloadLink } from '@react-pdf/renderer';
import { IconeVoltar, IconeCheck } from '../Icones';
import { RelatorioPDF } from '../../RelatorioPDF';

export function Etapa8Conclusao({
    salvandoBanco,
    registroSalvo,
    erroSalvarBanco,
    onSalvarBanco,
    onVerResumo,
    onReiniciarRegistro,
    onVoltar,
}) {
    return (
        <>
            <button
                type="button"
                className="app__botao-voltar"
                onClick={() => {
                    if (registroSalvo) {
                        onReiniciarRegistro();
                    } else {
                        onVoltar();
                    }
                }}
                title={registroSalvo ? "Voltar ao início" : "Voltar à etapa anterior"}
            >
                <IconeVoltar />
            </button>
            <p className='app__title'>Tudo pronto!</p>

            <p className='app__tooltip'>Agora, revise as informações no resumo ou clique abaixo para registrar a atividade.</p>
            <button
                className='app__buttonSecondary app__buttonSecondary__left-anchor'
                onClick={onReiniciarRegistro}
            >
                Voltar para o início
            </button>

            <div className='app__footer'>
                {erroSalvarBanco && (
                    <div style={{ color: 'var(--cor-negative)', textAlign: 'center' }}>
                        {erroSalvarBanco}
                    </div>
                )}
                { registroSalvo && (
                    <p>Registro salvo! Você já pode voltar para o início com o botão acima</p>
                )}
                <button
                    type="button"
                    className='app__buttonMain'
                    onClick={onVerResumo}
                >
                    <p>Ver resumo</p>
                </button>

                <button
                    type="button"
                    className="app__buttonMain"
                    onClick={onSalvarBanco}
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