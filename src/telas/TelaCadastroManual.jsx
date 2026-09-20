import { IconeVoltar } from '../components/Icones';
import { HeaderRegistro } from '../components/HeaderRegistro';

export function TelaCadastroManual({
    etapa,
    escolaManual,
    setEscolaManual,
    turmaManual,
    setTurmaManual,
    onSalvarManual,
    onVoltar,
    cardRef,
}) {
    const isDisabled = !escolaManual.trim() || !turmaManual.trim();

    return (
        <>
            <HeaderRegistro etapaAtual={etapa} />
            <form
                className='app--card'
                ref={cardRef}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isDisabled) return;
                    onSalvarManual();
                }}
            >
                <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app--title'>Cadastro Manual</p>
                <div className='app--input-group'>
                    <label>Nome da Escola</label>
                    <input
                        type='text'
                        value={escolaManual}
                        onChange={(e) => setEscolaManual(e.target.value)}
                    />
                </div>
                <div className='app--input-group'>
                    <label>Nome da Turma</label>
                    <input
                        type='text'
                        value={turmaManual}
                        onChange={(e) => setTurmaManual(e.target.value)}
                    />
                </div>
                <div className='app--footer'>
                    <button
                        type="submit"
                        className={'app--buttonMain'}
                        disabled={isDisabled}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </form>
        </>
    );
}