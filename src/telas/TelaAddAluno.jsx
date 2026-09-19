import { IconeVoltar, IconeCheck } from '../components/Icones';
import { BarraProgresso } from '../components/BarraProgresso';

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
    const isDisabled = !novoAlunoNome.trim() || !novoAlunoDataNascimento.trim();

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
                    onAdicionarAluno();
                }}
            >
                <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app--title'>Adicionar aluno</p>
                <div className='app--input-group'>
                    <label>Nome</label>
                    <input
                        ref={nomeInputRef}
                        type="text"
                        value={novoAlunoNome}
                        onChange={(e) => setNovoAlunoNome(e.target.value)}
                        placeholder="Digite aqui o nome completo"
                    />
                </div>
                <div className='app--input-group'>
                    <label>Data de Nascimento</label>
                    <input
                        type="text"
                        value={novoAlunoDataNascimento}
                        onChange={(e) => setNovoAlunoDataNascimento(e.target.value)}
                        placeholder="DD/MM/AAAA"
                    />
                </div>
                <div className='app--footer'>
                    <button
                        type="submit"
                        className={isDisabled ? 'app--buttonMain__disabled' : 'app--buttonMain'}
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