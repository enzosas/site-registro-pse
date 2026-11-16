import { useEffect, useRef, useState } from 'react';
import { useRegistro } from '../../context/RegistroPSEContext';
import { IconeVoltar } from '../Icones';
import { OpcaoBinariaGroup } from '../OpcaoBinariaGroup';
import * as Constantes from '../../utils/constantes';
import { filtrarEntradaDecimal, avisoAltura, avisoPeso } from '../../utils/medidas';

export function Etapa7ColetaDados() {
    const {
        alunoAtualIndex,
        setAlunoAtualIndex,
        alunosPresentes,
        alunoAtualTelaAntropometria: alunoAtual,
        dadosAlunos,
        handleAtualizarDadosAluno,
        temAntropometria,
        temVacinacao,
        temSaudeOcular,
        temSaudeAuditiva,
        alturaInputRef,
        mostrarAlunosPendentes,
        setMostrarAlunosPendentes,
        obterAlunosPendentes,
        focarAltura,
        proximoAluno,
        alunoAnterior,
        voltarEtapa,
    } = useRegistro();

    const pesoInputRef = useRef(null);
    const opcoesRef = useRef(null);
    // Avisos de valor improvável só aparecem depois de sair do campo ou ao tentar avançar,
    // nunca enquanto a pessoa ainda está digitando
    const [avisosVisiveis, setAvisosVisiveis] = useState({ altura: false, peso: false });
    // Aluno para o qual os avisos já foram mostrados ao tentar avançar (a 2ª tentativa segue)
    const [avisoConfirmadoPara, setAvisoConfirmadoPara] = useState(null);

    const isUltimoAluno = alunoAtualIndex === alunosPresentes.length - 1;
    const pendentes = obterAlunosPendentes();
    const dadosAtuais = (alunoAtual && dadosAlunos[alunoAtual.id]) || {};
    const faltaOpcao =
        (temVacinacao && !dadosAtuais.vacinado) ||
        (temSaudeOcular && !dadosAtuais.saudeOcular) ||
        (temSaudeAuditiva && !dadosAtuais.saudeAuditiva);

    const mensagemAltura = avisoAltura(dadosAtuais.altura);
    const mensagemPeso = avisoPeso(dadosAtuais.peso);
    const temAviso = Boolean(mensagemAltura || mensagemPeso);
    const aguardandoConfirmacao = temAviso && avisoConfirmadoPara === alunoAtual?.id;

    const esconderAviso = (campo) => {
        setAvisosVisiveis((prev) => ({ ...prev, [campo]: false }));
    };
    const mostrarAviso = (campo) => {
        setAvisosVisiveis((prev) => ({ ...prev, [campo]: true }));
    };

    // Avança para o próximo aluno; se houver valor improvável ainda não confirmado,
    // primeiro mostra os avisos e só avança na próxima tentativa
    const tentarAvancar = () => {
        if (temAviso && avisoConfirmadoPara !== alunoAtual?.id) {
            setAvisosVisiveis({ altura: true, peso: true });
            setAvisoConfirmadoPara(alunoAtual?.id ?? null);
            return;
        }
        proximoAluno();
    };

    const alterarMedida = (campo, valor) => {
        handleAtualizarDadosAluno(campo, filtrarEntradaDecimal(valor));
        esconderAviso(campo);
        setAvisoConfirmadoPara(null);
    };

    // Ao abrir a coleta, já deixa o cursor na altura do primeiro aluno
    useEffect(() => {
        if (temAntropometria) focarAltura();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Enter na altura vai para o peso (em vez de pular para o próximo aluno)
    const aoTeclarNaAltura = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        pesoInputRef.current?.focus();
    };

    // Enter no peso: se ainda faltam opções de toque, fecha o teclado e mostra as opções;
    // senão, vai para o próximo aluno
    const aoTeclarNoPeso = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (faltaOpcao) {
            e.currentTarget.blur();
            opcoesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            tentarAvancar();
        }
    };

    const propsCampoDecimal = {
        type: 'text',
        inputMode: 'decimal',
        autoComplete: 'off',
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                tentarAvancar();
            }}
            style={{ display: 'contents' }}
        >
            <button type="button" className="app__botao-voltar" onClick={voltarEtapa}>
                <IconeVoltar />
            </button>
            <p className='app__title'>Preencha os dados de cada aluno:</p>
            <p className='app__contador'>
                {alunoAtualIndex + 1}/{alunosPresentes.length}
            </p>
            <p className='app__nomeAluno'>{alunoAtual?.nome || ''}</p>
            {alunoAtual && temAntropometria && (
                <>
                    <div className='app__input-group'>
                        <label>Altura (cm)</label>
                        <input
                            {...propsCampoDecimal}
                            ref={alturaInputRef}
                            enterKeyHint="next"
                            placeholder="Digite aqui a altura"
                            value={dadosAtuais.altura || ''}
                            onChange={(e) => alterarMedida('altura', e.target.value)}
                            onFocus={() => esconderAviso('altura')}
                            onBlur={() => mostrarAviso('altura')}
                            onKeyDown={aoTeclarNaAltura}
                        />
                        {mensagemAltura && avisosVisiveis.altura && (
                            <p className='app__aviso-campo'>{mensagemAltura}</p>
                        )}
                    </div>
                    <div className='app__input-group'>
                        <label>Peso (kg)</label>
                        <input
                            {...propsCampoDecimal}
                            ref={pesoInputRef}
                            enterKeyHint={faltaOpcao ? 'done' : 'next'}
                            placeholder="Digite aqui o peso"
                            value={dadosAtuais.peso || ''}
                            onChange={(e) => alterarMedida('peso', e.target.value)}
                            onFocus={() => esconderAviso('peso')}
                            onBlur={() => mostrarAviso('peso')}
                            onKeyDown={aoTeclarNoPeso}
                        />
                        {mensagemPeso && avisosVisiveis.peso && (
                            <p className='app__aviso-campo'>{mensagemPeso}</p>
                        )}
                    </div>
                </>
            )}
            <div ref={opcoesRef} style={{ display: 'contents' }}>
                {temVacinacao && alunoAtual && (
                    <OpcaoBinariaGroup
                        label="Situação do esquema vacinal:"
                        opcoes={Constantes.OPCOES_VACINACAO}
                        valorAtual={dadosAtuais.vacinado}
                        onChange={(novoValor) => handleAtualizarDadosAluno('vacinado', novoValor)}
                    />
                )}
                {temSaudeOcular && alunoAtual && (
                    <OpcaoBinariaGroup
                        label="Avaliação da saúde ocular:"
                        opcoes={Constantes.OPCOES_SAUDE_OCULAR}
                        valorAtual={dadosAtuais.saudeOcular}
                        onChange={(novoValor) => handleAtualizarDadosAluno('saudeOcular', novoValor)}
                    />
                )}
                {temSaudeAuditiva && alunoAtual && (
                    <OpcaoBinariaGroup
                        label="Avaliação da saúde auditiva:"
                        opcoes={Constantes.OPCOES_SAUDE_AUDITIVA}
                        valorAtual={dadosAtuais.saudeAuditiva}
                        onChange={(novoValor) => handleAtualizarDadosAluno('saudeAuditiva', novoValor)}
                    />
                )}
            </div>
            <div className='app__footer'>
                {mostrarAlunosPendentes && pendentes.length > 0 && (
                    <>
                        <div className='app__tela-vacinacao__pendentes'>
                            Os seguintes alunos estão com dados faltando:
                        </div>
                        {pendentes.map((aluno) => (
                            <div
                                key={aluno.id}
                                onClick={() => {
                                    const index = alunosPresentes.findIndex((a) => a.id === aluno.id);
                                    if (temAntropometria) focarAltura();
                                    setAlunoAtualIndex(index);
                                    setMostrarAlunosPendentes(false);
                                }}
                            >
                                <span className='app__tela-vacinacao__pendentes'>{aluno.nome}</span>
                            </div>
                        ))}
                    </>
                )}
                {aguardandoConfirmacao && (
                    <p className='app__aviso-campo'>
                        Há valores fora do comum. Confira e toque em {isUltimoAluno ? 'Avançar' : 'Próximo'} novamente para seguir.
                    </p>
                )}
                <div className='app__dados-aluno__footer'>
                    <button type="button" className="app__botao-voltar" onClick={alunoAnterior}>
                        <IconeVoltar />
                    </button>
                    <button type="submit" className='app__buttonMain'>
                        <p>{isUltimoAluno ? 'Avançar' : 'Próximo'}</p>
                    </button>
                </div>
            </div>
        </form>
    );
}
