import { IconeVoltar } from '../components/Icones';
import { BarraProgresso } from '../components/BarraProgresso';

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
            <div className='app--header-container'>
                <p className='app--header'>Geração de Registro</p>
                <img src={`${import.meta.env.BASE_URL}pseLogo2.png`} alt="Logo" className="app--header-logo" />
            </div>
            <BarraProgresso etapaAtual={etapa} totalEtapas={6} />
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
                        className={isDisabled ? 'app--buttonMain__disabled' : 'app--buttonMain'}
                        disabled={isDisabled}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </form>
        </>
    );
}