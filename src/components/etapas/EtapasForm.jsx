// EtapasForm.jsx (ou dentro do próprio arquivo de renderização)
import { Etapa1Data } from './Etapa1Data';
import { Etapa2Profissionais } from './Etapa2Profissionais';
import { Etapa3Escola } from './Etapa3Escola';
import { Etapa4Turma } from './Etapa4Turma';
import { Etapa5Eixos } from './Etapa5Eixos';
import { Etapa6Presenca } from './Etapa6Presenca';
import { Etapa7ColetaDados } from './Etapa7ColetaDados';
import { Etapa8Conclusao } from './Etapa8Conclusao';
import { HeaderRegistro } from '../HeaderRegistro';

export function RenderizadorEtapas({ form: p }) {
    const etapasMap = {
        1: (
            <Etapa1Data
                dia={p.dia}
                setDia={p.setDia}
                mes={p.mes}
                setMes={p.setMes}
                ano={p.ano}
                setAno={p.setAno}
                onAvancar={p.avancarEtapa}
                onVoltar={() => p.setTelaAtiva(TELAS.INICIAL)}
            />
        ),
        2: (
            <Etapa2Profissionais
                registradorNome={p.nomeUsuario}
                profissionaisResponsaveis={p.profissionaisResponsaveis}
                setProfissionaisResponsaveis={p.setProfissionaisResponsaveis}
                onAvancar={p.avancarEtapa}
                onVoltar={p.voltarEtapa}
            />
        ),
        3: (
            <Etapa3Escola
                buscaEscola={p.buscaEscola}
                setBuscaEscola={p.setBuscaEscola}
                escolasFiltradas={p.escolasFiltradas}
                escolaSelecionada={p.escolaSelecionada}
                setEscolaSelecionada={p.setEscolaSelecionada}
                onAvancar={p.avancarEtapa}
                onVoltar={p.voltarEtapa}
                onCadastroManual={() => p.setTelaAtiva(TELAS.CADASTRO_MANUAL)}
            />
        ),
        4: (
            <Etapa4Turma
                buscaTurma={p.buscaTurma}
                setBuscaTurma={p.setBuscaTurma}
                turmasFiltradas={p.turmasFiltradas}
                turmaSelecionada={p.turmaSelecionada}
                setTurmaSelecionada={p.setTurmaSelecionada}
                onAvancar={p.avancarEtapa}
                onVoltar={() => {
                    p.setTurmaSelecionada(null);
                    p.voltarEtapa();
                }}
                onCadastroManual={() => p.setTelaAtiva(TELAS.CADASTRO_MANUAL)}
            />
        ),
        5: (
            <Etapa5Eixos
                idsEixosSelecionados={p.idsEixosSelecionados}
                toggleEixo={p.toggleEixo}
                temEixoLocal={p.temEixoLocal}
                nomeEixoLocal={p.nomeEixoLocal}
                handleAtualizarNomeEixoLocal={p.setNomeEixoLocal}
                observacoes={p.observacoes}
                handleAtualizarObservacoes={p.setObservacoes}
                onAvancar={() => {
                    p.marcarTodosPresentes();
                    p.avancarEtapa();
                }}
                onVoltar={p.voltarEtapa}
            />
        ),
        6: (
            <Etapa6Presenca
                alunosOrdenados={p.alunosOrdenados}
                idsAlunosPresentes={p.idsAlunosPresentes}
                toggleAluno={p.toggleAluno}
                alternarPresencaTodos={p.alternarPresencaTodos}
                todosEstaoPresentes={p.todosEstaoPresentes}
                onAdicionarAlunoManual={() => p.setTelaAtiva(TELAS.ADD_ALUNO)}
                onAvancar={p.avancarEtapa}
                onVoltar={p.voltarEtapa}
            />
        ),
        7: (
            <Etapa7ColetaDados
                alunoAtualIndex={p.alunoAtualIndex}
                alunosPresentes={p.alunosPresentes}
                alunoAtual={p.alunoAtualTelaAntropometria}
                dadosAlunos={p.dadosAlunos}
                handleAtualizarDadosAluno={p.handleAtualizarDadosAluno}
                temAntropometria={p.temAntropometria}
                temVacinacao={p.temVacinacao}
                temSaudeOcular={p.temSaudeOcular}
                alturaInputRef={p.alturaInputRef}
                mostrarAlunosPendentes={p.mostrarAlunosPendentes}
                obterAlunosPendentes={p.obterAlunosPendentes}
                onSelecionarAlunoPendente={(id) => {
                    const index = p.alunosPresentes.findIndex((a) => a.id === id);
                    p.setAlunoAtualIndex(index);
                    p.setMostrarAlunosPendentes(false);
                }}
                onProximo={p.proximoAluno}
                onAnterior={p.alunoAnterior}
                onVoltar={p.voltarEtapa}
            />
        ),
        8: (
            <Etapa8Conclusao
                dia={p.dia}
                mes={p.mes}
                ano={p.ano}
                dadosRelatorio={p.gerarObjetoRelatorio()}
                onVerResumo={() => p.setTelaAtiva(TELAS.RESUMO)}
                onReiniciarRegistro={p.reiniciarRegistro}
                onVoltar={p.voltarEtapa}
            />
        ),
    };

    const totalEtapasCadastradas = Object.keys(etapasMap).length;

    return (
        <>
            <HeaderRegistro
                etapaAtual={p.etapa}
                totalEtapas={totalEtapasCadastradas}
            />
            <div className="app__card" ref={p.cardRef}>
                {etapasMap[p.etapa] || null}
            </div>
        </>
    );
}