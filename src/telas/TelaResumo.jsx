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
            <div className='app--card' ref={cardRef}>
                <button type="button" className="app--botao-voltar" onClick={onVoltar}>
                    <IconeVoltar />
                </button>
                <p className='app--title'>Resumo da Atividade</p>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Registrado por</p>
                    <p>{dados.Registrador}</p>
                </div>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Responsáveis pela ação</p>
                    <p>{dados.profissionaisResponsaveis}</p>
                </div>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Escola</p>
                    <p>{dados.escola}</p>
                </div>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Turma</p>
                    <p>{dados.turma}</p>
                </div>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Data de realização da ação</p>
                    <p>{dados.data}</p>
                </div>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Eixos Selecionados</p>
                    <>
                        {dados.eixosTematicos.map((eixo, index) => (
                            <p key={index}>{eixo}</p>
                        ))}
                    </>
                    {observacoes && <p>Observações: {dados.observacoes}</p>}
                </div>

                <div className='app--resumo'>
                    <p className='app--resumo--subtitle'>Alunos que participaram da ação</p>
                    <div className='app--resumo'>
                        {dados.alunosPresentes.map((aluno) => (
                            <div key={aluno.id} className='app--resumo'>
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

                <div className='app--footer'>
                    <button className='app--buttonMain' onClick={onCopiarResumo}>
                        <p>{copiado ? 'Copiado!' : 'Copiar Resumo'}</p>
                    </button>
                </div>
            </div>
        </>
    );
}