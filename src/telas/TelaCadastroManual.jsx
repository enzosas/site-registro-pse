import { useRegistro } from '../context/RegistroPSEContext';
import { IconeVoltar } from '../components/Icones';
import { HeaderRegistro } from '../components/HeaderRegistro';
import { TELAS } from '../utils/constantes';

export function TelaCadastroManual() {
    const {
        passoVisual,
        totalEtapas,
        escolaManual,
        setEscolaManual,
        turmaManual,
        setTurmaManual,
        ubsManualTexto,
        setUbsManualTexto,
        listaUbs,
        handleSalvarManual,
        setTelaAtiva,
        cardRef,
    } = useRegistro();

    const ubsEncontrada = listaUbs.find(
        (ubs) => ubs.nome.trim().toLowerCase() === ubsManualTexto.trim().toLowerCase()
    );
    const isFormValido = escolaManual.trim() && turmaManual.trim() && Boolean(ubsEncontrada);

    return (
        <>
            <HeaderRegistro etapaAtual={passoVisual} totalEtapas={totalEtapas} />
            <form
                className='app__card'
                ref={cardRef}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!isFormValido) return;
                    handleSalvarManual();
                }}
            >
                <button
                    type="button"
                    className="app__botao-voltar"
                    onClick={() => setTelaAtiva(TELAS.ETAPAS)}
                >
                    <IconeVoltar />
                </button>
                <p className='app__title'>Cadastro Manual</p>
                <div className='app__input-group'>
                    <label>Nome da Escola</label>
                    <input
                        type='text'
                        placeholder="Digite o nome da escola"
                        value={escolaManual}
                        onChange={(e) => setEscolaManual(e.target.value)}
                        required
                    />
                </div>
                <div className='app__input-group'>
                    <label>Nome da Turma</label>
                    <input
                        type='text'
                        placeholder="Digite o nome da turma"
                        value={turmaManual}
                        onChange={(e) => setTurmaManual(e.target.value)}
                        required
                    />
                </div>
                <datalist id="lista-ubs-datalist">
                    {listaUbs.map((ubs) => (
                        <option key={ubs.id} value={ubs.nome} />
                    ))}
                </datalist>
                <div className='app__input-group'>
                    <label>UBS Responsável pela Ação</label>
                    <input
                        type="text"
                        placeholder="Digite ou selecione a UBS de referência"
                        list="lista-ubs-datalist"
                        value={ubsManualTexto}
                        onChange={(e) => setUbsManualTexto(e.target.value)}
                        autoComplete="off"
                        required
                    />
                </div>
                <div className='app__footer'>
                    <button
                        type="submit"
                        className={'app__buttonMain'}
                        disabled={!isFormValido}
                    >
                        <p>Avançar</p>
                    </button>
                </div>
            </form>
        </>
    );
}