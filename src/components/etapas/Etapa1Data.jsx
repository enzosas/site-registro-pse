import { IconeVoltar } from '../Icones';
import { isDataValida } from '../../utils/validadoresData';

export function Etapa1Data({
    dia,
    setDia,
    mes,
    setMes,
    ano,
    setAno,
    onAvancar,
    onVoltar,
}) {
    const handleApenasNumeros = (setter, tamanhoMax) => (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, tamanhoMax);
        setter(val);
    };

    const dataEhValida = isDataValida(dia, mes, ano);
    const isFormValido =  dataEhValida;
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!isFormValido) return;
                onAvancar();
            }}
            style={{ display: 'contents' }}
        >
            <button type="button" className="app__botao-voltar" onClick={onVoltar}>
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