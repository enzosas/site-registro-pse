import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ajudaAtualizarTurmasRaw from '../../content/atualizarTurmas.md?raw';
import { useDados } from '../../context/DadosContext';
import { processarZipTurmas } from '../../utils/parserPlanilhas';
import { calcularDiffTurmas } from '../../utils/comparadorDiffTurmas';
import { supabase } from '../../services/supabaseClient';

export function PainelAtualizarTurmas({ onSucesso, onVoltar }) {
    const { escolas: escolasAtuais, recarregarTodosDados } = useDados();

    // estados do fluxo de upload e sincronizacao
    const [arquivoNome, setArquivoNome] = useState('');
    const [processandoZip, setProcessandoZip] = useState(false);
    const [salvandoBanco, setSalvandoBanco] = useState(false);
    const [erro, setErro] = useState('');
    const [dadosProcessados, setDadosProcessados] = useState(null);
    const [diffResultado, setDiffResultado] = useState(null);

    const inputRef = useRef(null);

    // le o arquivo zip, executa o parser e calcula o diff em relacao ao banco atual
    const handleArquivoSelecionado = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErro('');
        setArquivoNome(file.name);
        setProcessandoZip(true);
        setDadosProcessados(null);
        setDiffResultado(null);

        try {
            const resultado = await processarZipTurmas(file);

            if (!resultado.escolas || resultado.escolas.length === 0) {
                setErro('Nenhuma escola válida foi encontrada dentro do arquivo zip.');
                setProcessandoZip(false);
                return;
            }

            const diff = calcularDiffTurmas(escolasAtuais, resultado.escolas);

            setDadosProcessados(resultado);
            setDiffResultado(diff);
        } catch (err) {
            console.error('erro ao processar zip:', err);
            setErro(err.message || 'Falha ao descompactar ou interpretar as planilhas.');
        } finally {
            setProcessandoZip(false);
        }
    };

    // sincroniza apenas as escolas que realmente tiveram alteracoes ou sao novas
    const handleConfirmarSincronizacao = async () => {
        if (!dadosProcessados || !diffResultado || salvandoBanco) return;

        // se nenhuma escola for nova e nenhuma tiver alteracoes reais
        if (
            diffResultado.totalEscolasNovas === 0 &&
            diffResultado.detalhesPorEscola.length === 0
        ) {
            alert('Não há nenhuma alteração a ser salva. Todos os dados do arquivo já estão idênticos ao banco!');
            return;
        }

        const confirmou = window.confirm(
            'Tem certeza de que deseja atualizar as turmas e alunos no banco de dados? Apenas as escolas com alterações serão modificadas.'
        );
        if (!confirmou) return;

        setSalvandoBanco(true);
        setErro('');

        try {
            // 1. busca escolas cadastradas atualmente para mapear nomes para seus ids
            const { data: escolasBanco, error: erroEscolas } = await supabase
                .from('escolas')
                .select('id, nome');

            if (erroEscolas) {
                throw new Error(`Erro ao consultar escolas: ${erroEscolas.message}`);
            }

            const mapaEscolas = new Map();
            (escolasBanco || []).forEach((e) => {
                mapaEscolas.set(e.nome.trim().toLowerCase(), e.id);
            });

            // 2. identifica escolas novas e executa o cadastro na tabela escolas
            const nomesNovas = [];
            dadosProcessados.escolas.forEach((esc) => {
                const chave = esc.nome.trim().toLowerCase();
                if (!mapaEscolas.has(chave)) {
                    nomesNovas.push(esc.nome);
                }
            });

            if (nomesNovas.length > 0) {
                const payloadSeed = nomesNovas.map((nome) => ({ nome }));
                const { data: novasInseridas, error: erroSeed } = await supabase
                    .from('escolas')
                    .upsert(payloadSeed, { onConflict: 'nome' })
                    .select('id, nome');

                if (erroSeed) {
                    throw new Error(`Erro ao cadastrar novas escolas: ${erroSeed.message}`);
                }

                (novasInseridas || []).forEach((e) => {
                    mapaEscolas.set(e.nome.trim().toLowerCase(), e.id);
                });
            }

            // 3. cria um conjunto com os nomes de escolas que realmente mudaram segundo o diff
            const escolasParaAtualizarNomes = new Set([
                ...diffResultado.escolasNovas.map((n) => n.trim().toLowerCase()),
                ...diffResultado.detalhesPorEscola.map((d) => d.nome.trim().toLowerCase()),
            ]);

            // 4. prepara os registros apenas para as escolas que sofreram mudancas
            let turmaIdContador = 101;
            let alunoIdContador = 1001;
            const registrosParaSalvar = [];

            dadosProcessados.escolas.forEach((escolaItem) => {
                const chave = escolaItem.nome.trim().toLowerCase();

                // se a escola nao teve alteracao nenhuma pula e preserva os dados e a data atual do banco
                if (!escolasParaAtualizarNomes.has(chave)) {
                    return;
                }

                const escolaId = mapaEscolas.get(chave);
                if (!escolaId) return;

                let atualizadoEmIso = new Date().toISOString();
                if (escolaItem.datasModificacao && escolaItem.datasModificacao.length > 0) {
                    const maisRecente = Math.max(...escolaItem.datasModificacao);
                    atualizadoEmIso = new Date(maisRecente).toISOString();
                }

                const turmasFormatadas = (escolaItem.turmas || []).map((t) => {
                    const turmaId = turmaIdContador++;
                    return {
                        id: turmaId,
                        nome: t.nome,
                        alunos: (t.alunos || []).map((a) => ({
                            id: alunoIdContador++,
                            nome: a.nome,
                            dataNascimento: a.dataNascimento,
                        })),
                    };
                });

                registrosParaSalvar.push({
                    escola_id: escolaId,
                    dados: { turmas: turmasFormatadas },
                    atualizado_em: atualizadoEmIso,
                });
            });

            // 5. envia apenas os registros modificados (ex: as 9 escolas identificadas)
            if (registrosParaSalvar.length > 0) {
                const { error: erroUpsert } = await supabase
                    .from('escolaturmaalunos')
                    .upsert(registrosParaSalvar, { onConflict: 'escola_id' });

                if (erroUpsert) {
                    throw new Error(`Erro ao salvar turmas: ${erroUpsert.message}`);
                }
            }

            // 6. recarrega o contexto global da aplicacao
            await recarregarTodosDados();

            alert(`${registrosParaSalvar.length} escola(s) atualizada(s) com sucesso no banco de dados!`);
            if (onSucesso) onSucesso();
        } catch (err) {
            console.error('falha na sincronizacao:', err);
            setErro(err.message || 'Ocorreu uma falha ao sincronizar com o banco.');
        } finally {
            setSalvandoBanco(false);
        }
    };

    const handleCancelar = () => {
        setArquivoNome('');
        setDadosProcessados(null);
        setDiffResultado(null);
        setErro('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <>
            <p className="app__title">Atualizar Turmas</p>
            <p className="admin__usuario__subtitulo">
                Envie o arquivo compactado (.zip) com os relatórios das escolas para sincronização automática.
            </p>

            <input
                ref={inputRef}
                type="file"
                accept=".zip"
                style={{ display: 'none' }}
                onChange={handleArquivoSelecionado}
            />

            {/* instrucoes em markdown quando nenhum arquivo estiver sendo inspecionado */}
            {!diffResultado && !processandoZip && (
                <div className="markdown">
                    <ReactMarkdown>{ajudaAtualizarTurmasRaw}</ReactMarkdown>
                </div>
            )}

            {/* estado de carregamento do parser e calculo de diff */}
            {processandoZip && (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="app__title" style={{ fontSize: '1.2rem' }}>Processando Planilhas...</p>
                    <p className="admin__usuario__subtitulo">Descompactando ZIP e comparando com o banco de dados.</p>
                </div>
            )}

            {/* exibicao da previa das alteracoes (diff) */}
            {diffResultado && !processandoZip && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div className="admin__filtros-container">
                        <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>Resumo Geral do Diff</p>
                        <p>Arquivo analisado: <strong>{arquivoNome}</strong></p>
                        <p>Total de escolas no arquivo: <strong>{diffResultado.totalEscolasNoZip}</strong></p>
                        <p>Escolas novas a cadastrar: <strong>{diffResultado.totalEscolasNovas}</strong></p>
                        <p>Alunos novos identificados: <strong style={{ color: 'var(--cor-step)' }}>+{diffResultado.totalAlunosNovos}</strong></p>
                        <p>Alunos removidos/transferidos: <strong style={{ color: 'var(--cor-negative)' }}>-{diffResultado.totalAlunosRemovidos}</strong></p>
                        <p>Datas de nascimento modificadas: <strong>{diffResultado.totalAlunosModificados}</strong></p>
                        <p>Escolas do banco ausentes no arquivo: <strong>{diffResultado.escolasAusentesNoZip.length}</strong></p>
                    </div>

                    {diffResultado.escolasNovas.length > 0 && (
                        <div className="app__resumo">
                            <p className="app__resumo__subtitle">Escolas Novas ({diffResultado.escolasNovas.length})</p>
                            {diffResultado.escolasNovas.map((nome, idx) => (
                                <p key={idx}>+ {nome}</p>
                            ))}
                        </div>
                    )}

                    {diffResultado.escolasAusentesNoZip.length > 0 && (
                        <div className="app__resumo">
                            <p className="app__resumo__subtitle">Escolas no Banco Ausentes no ZIP ({diffResultado.escolasAusentesNoZip.length})</p>
                            {diffResultado.escolasAusentesNoZip.map((nome, idx) => (
                                <p key={idx} style={{ color: 'var(--cor-botao2)' }}>• {nome}</p>
                            ))}
                        </div>
                    )}

                    {diffResultado.detalhesPorEscola.length > 0 && (
                        <div className="app__resumo">
                            <p className="app__resumo__subtitle">Escolas com Modificações ({diffResultado.detalhesPorEscola.length})</p>
                            {diffResultado.detalhesPorEscola.map((detalhe, idx) => (
                                <div key={idx} style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--cor-border)', paddingBottom: '0.5rem' }}>
                                    <p><strong>{detalhe.nome}</strong> ({detalhe.status === 'nova' ? 'Escola Nova' : 'Escola Existente'})</p>

                                    {detalhe.turmasNovas.length > 0 && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--cor-step)' }}>
                                            + Turmas novas: {detalhe.turmasNovas.join(', ')}
                                        </p>
                                    )}

                                    {detalhe.turmasRemovidas.length > 0 && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--cor-negative)' }}>
                                            - Turmas ausentes: {detalhe.turmasRemovidas.join(', ')}
                                        </p>
                                    )}

                                    {detalhe.turmasAlteradas.length > 0 && (
                                        <p style={{ fontSize: '0.9rem' }}>
                                            Alterações nas turmas: {detalhe.turmasAlteradas.map((t) => `${t.nome} (+${t.novos} novos, -${t.removidos} removidos)`).join('; ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* alerta de erro em vermelho posicionado acima do rodape */}
            {erro && (
                <div className="app__alerta-erro" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    <p style={{ color: 'var(--cor-negative, #e53e3e)', fontWeight: 500 }}>{erro}</p>
                </div>
            )}

            {/* rodape fixo com os botoes de acao */}
            <div className="app__footer app__footer--extra_margin">
                {!diffResultado && !processandoZip && (
                    <button
                        type="button"
                        className="app__buttonMain"
                        onClick={() => inputRef.current?.click()}
                    >
                        <p>{arquivoNome ? 'Escolher Outro Arquivo (.ZIP)' : 'Selecionar Arquivo (.ZIP)'}</p>
                    </button>
                )}

                {diffResultado && !processandoZip && (
                    <>
                        <button
                            type="button"
                            className="app__buttonSecondary"
                            onClick={handleCancelar}
                            disabled={salvandoBanco}
                        >
                            <p>Cancelar</p>
                        </button>
                        <button
                            type="button"
                            className="app__buttonMain"
                            onClick={handleConfirmarSincronizacao}
                            disabled={salvandoBanco}
                        >
                            <p>{salvandoBanco ? 'Sincronizando Banco...' : 'Confirmar e Atualizar'}</p>
                        </button>
                    </>
                )}
            </div>
        </>
    );
}