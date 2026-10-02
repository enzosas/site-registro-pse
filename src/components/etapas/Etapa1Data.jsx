import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import { isDataValida } from '../../utils/validadoresData';
import { LISTA_TURNOS, TELAS } from '../../constantes';

export function Etapa1Data() {
    const {
        dia,
        setDia,
        mes,
        setMes,
        ano,
        setAno,
        turno,
        setTurno,
        avancarEtapa,
        setTelaAtiva,
    } = useRegistro();

    const handleApenasNumeros = (setter, tamanhoMax) => (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, tamanhoMax);
        setter(val);
    };

    const dataEhValida = isDataValida(dia, mes, ano);
    const isFormValido = dataEhValida && Boolean(turno);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!isFormValido) return;
                avancarEtapa();
            }}
            style={{ display: 'contents' }}
        >
            <button
                type="button"
                className="app__botao-voltar"
                onClick={() => setTelaAtiva(TELAS.INICIAL)}
            >
                <IconeVoltar />
            </button>
            <p className='app__title'>Digite a data da atividade:</p>
            <div className='app__date-group'>
                <input
                    type="text"
                    placeholder="DD"
                    maxLength="2"
                    className='app__date-input'
                    value={dia}
                    onChange={handleApenasNumeros(setDia, 2)}
                />
                <input
                    type="text"
                    placeholder="MM"
                    maxLength="2"
                    className='app__date-input'
                    value={mes}
                    onChange={handleApenasNumeros(setMes, 2)}
                />
                <input
                    type="text"
                    placeholder="AAAA"
                    maxLength="4"
                    className='app__date-input'
                    value={ano}
                    onChange={handleApenasNumeros(setAno, 4)}
                />
            </div>
            <div className='app__input-group'>
                <label>Turno</label>
                <select
                    className="app__select"
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    required
                >
                    {LISTA_TURNOS.map((op) => (
                        <option key={op} value={op}>
                            {op}
                        </option>
                    ))}
                </select>
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
    );
}