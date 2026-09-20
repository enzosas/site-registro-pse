import { IconeVoltar, IconeCheck } from '../components/Icones';
import { HeaderRegistro } from '../components/HeaderRegistro';
import { aplicarMascaraData, isDataStringValida } from '../utils/validadoresData';

export function TelaAddAluno({
    etapa,
    novoAlunoNome,
    setNovoAlunoNome,
    novoAlunoDataNascimento,
    setNovoAlunoDataNascimento,
    alunoAdicionadoAnim,
    onAdicionarAluno,
    onVoltar,
    nomeInputRef,
    cardRef,
}) {
    const dataValida = isDataStringValida(novoAlunoDataNascimento);
    const isDisabled = !novoAlunoNome.trim() || !dataValida;

    return (
        <>
            <HeaderRegistro etapaAtual={etapa} />
            <form
                className='app__card'
                ref={cardRef}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isDisabled) return;
                    onAdicionarAluno();
                }}
            >
                <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app__title'>Adicionar aluno</p>
                <div className='app__input-group'>
                    <label>Nome</label>
                    <input
                        ref={nomeInputRef}
                        type="text"
                        value={novoAlunoNome}
                        onChange={(e) => setNovoAlunoNome(e.target.value)}
                        placeholder="Digite aqui o nome completo"
                    />
                </div>
                <div className='app__input-group'>
                    <label>Data de Nascimento</label>
                    <input
                        type="text"
                        value={novoAlunoDataNascimento}
                        onChange={(e) => setNovoAlunoDataNascimento(aplicarMascaraData(e.target.value))}
                        placeholder="DD/MM/AAAA"
                        maxLength="10"
                    />
                </div>
                <div className='app__footer'>
                    <button
                        type="submit"
                        className={'app__buttonMain'}
                        disabled={isDisabled}
                    >
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {alunoAdicionadoAnim ? 'Aluno Adicionado' : 'Adicionar Aluno'}
                            {alunoAdicionadoAnim && <IconeCheck bold />}
                        </p>
                    </button>
                </div>
            </form>
        </>
    );
}