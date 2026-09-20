import { PDFDownloadLink } from '@react-pdf/renderer';
import { IconeVoltar } from '../components/Icones';
import { RelatorioPDF } from '../RelatorioPDF';

export function Etapa7Conclusao({
    dia,
    mes,
    ano,
    dadosRelatorio,
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
                <p>Iniciar novo registro</p>
            </button>

            <div className='app__footer'>
                <button className='app__buttonMain' onClick={onVerResumo}>
                    <p>Ver resumo</p>
                </button>

                <PDFDownloadLink
                    document={<RelatorioPDF dados={dadosRelatorio} />}
                    fileName={`Relatorio_PSE_${dia}_${mes}_${ano}.pdf`}
                    style={{ textDecoration: 'none', display: 'block', width: '100%' }}
                >
                    {() => (
                        <button className='app__buttonMain'>
                            <p>Gerar Relatório PDF</p>
                        </button>
                    )}
                </PDFDownloadLink>
            </div>
        </>
    );
}