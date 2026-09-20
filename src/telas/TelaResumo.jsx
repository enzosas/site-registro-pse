import { IconeVoltar } from '../components/Icones';
import { HeaderRegistro } from '../components/HeaderRegistro';
import { formatarData } from '../utils/formatadores';
import * as Constantes from '../constantes';

export function TelaResumo({
    etapa,
    dados,
    observacoes,
    copiado,
    onCopiarResumo,
    onVoltar,
    cardRef,
}) {
    return (
        <>
            <HeaderRegistro etapaAtual={etapa} />
            <div className='app__card' ref={cardRef}>
                <button type="button" className="app__botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app__title'>Resumo da Atividade</p>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Registrado por</p>
                    <p>{dados.Registrador}</p>
                </div>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Responsáveis pela ação</p>
                    <p>{dados.profissionaisResponsaveis}</p>
                </div>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Escola</p>
                    <p>{dados.escola}</p>
                </div>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Turma</p>
                    <p>{dados.turma}</p>
                </div>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Data de realização da ação</p>
                    <p>{dados.data}</p>
                </div>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Eixos Selecionados</p>
                    <>
                        {dados.eixosTematicos.map((eixo, index) => (
                            <p key={index}>{eixo}</p>
                        ))}
                    </>
                    {observacoes && <p>Observações: {dados.observacoes}</p>}
                </div>

                <div className='app__resumo'>
                    <p className='app__resumo__subtitle'>Alunos que participaram da ação</p>
                    <div className='app__resumo'>
                        {dados.alunosPresentes.map((aluno) => (
                            <div key={aluno.id} className='app__resumo'>
                                <span>{aluno.nome} - </span>
                                <span>{formatarData(aluno.dataNascimento)}</span>
                                {(aluno.peso || aluno.altura) && (
                                    <>
                                        {' - '}
                                        {aluno.peso && <span>{aluno.peso}kg</span>}
                                        {aluno.altura && <span> {aluno.altura}cm</span>}
                                    </>
                                )}
                                {aluno.vacinado && (
                                    <span> - Vacina: {Constantes.formatarVacinacao(aluno.vacinado)}</span>
                                )}
                                {aluno.saudeOcular && (
                                    <span> - Saúde Ocular: {Constantes.formatarSaudeOcular(aluno.saudeOcular)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='app__footer'>
                    <button className='app__buttonMain' onClick={onCopiarResumo}>
                        <p>{copiado ? 'Copiado!' : 'Copiar Resumo'}</p>
                    </button>
                </div>
            </div>
        </>
    );
}