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
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Tudo pronto!</p>

            <button
                className='app__buttonSecondary app__buttonSecondary__left-anchor'
                onClick={onReiniciarRegistro}
            >
                Iniciar novo registro
            </button>

            <div className='app__footer'>
                {erroSalvarBanco && (
                    <div style={{ color: 'var(--cor-negative)', textAlign: 'center' }}>
                        {erroSalvarBanco}
                    </div>
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