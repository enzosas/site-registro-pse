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
                className='app__card'
                ref={cardRef}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isDisabled) return;
                    onSalvarManual();
                }}
            >
                <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app__title'>Cadastro Manual</p>
                <div className='app__input-group'>
                    <label>Nome da Escola</label>
                    <input
                        type='text'
                        value={escolaManual}
                        onChange={(e) => setEscolaManual(e.target.value)}
                    />
                </div>
                <div className='app__input-group'>
                    <label>Nome da Turma</label>
                    <input
                        type='text'
                        value={turmaManual}
                        onChange={(e) => setTurmaManual(e.target.value)}
                    />
                </div>
                <div className='app__footer'>
                    <button
                        type="submit"
                        className={'app__buttonMain'}
                        disabled={isDisabled}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </form>
        </>
    );
}