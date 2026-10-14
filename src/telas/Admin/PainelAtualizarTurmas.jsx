import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ajudaAtualizarTurmasPath from '../../content/atualizarTurmas.md?raw';
import { useDados } from '../../context/DadosContext';
import { processarZipTurmas } from '../../utils/parserPlanilhas';
import { calcularDiffTurmas } from '../../utils/comparadorDiffTurmas';
import { supabase } from '../../services/supabaseClient';

export function PainelAtualizarTurmas({ onSucesso, onVoltar }) {
    const { escolas: escolasAtuais, recarregarTodosDados } = useDados();

    // estados do fluxo de upload e analise
    const [conteudoAjuda] = useState(ajudaAtualizarTurmasPath);
    const [arquivoNome, setArquivoNome] = useState('');
    const [processandoZip, setProcessandoZip] = useState(false);
    const [salvandoBanco, setSalvandoBanco] = useState(false);
    const [erro, setErro] = useState('');
    const [dadosProcessados, setDadosProcessados] = useState(null);
    const [diffResultado, setDiffResultado] = useState(null);

    const inputRef = useRef(null);

    // le e processa o arquivo zip selecionado
    const handleArquivoSelecionado = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErro('');
        setArquivoNome(file.name);
        setProcessandoZip(true);
        setDadosProcessados(null);
        setDiffResultado(null);

        try {
            // executa o parser em memoria
            const resultado = await processarZipTurmas(file);

            if (!resultado.escolas || resultado.escolas.length === 0) {
                setErro('nenhuma escola valida encontrada dentro do arquivo zip.');
                setProcessandoZip(false);
                return;
            }

            // calcula as diferencas entre o que esta no banco e o zip
            const diff = calcularDiffTurmas(escolasAtuais, resultado.escolas);

            setDadosProcessados(resultado);
            setDiffResultado(diff);
        } catch (err) {
            console.error('erro ao processar zip:', err);
            setErro(err.message || 'falha ao descompactar ou interpretar as planilhas.');
        } finally {
            setProcessandoZip(false);
        }
    };

    // sincroniza os dados validados com as tabelas escolas e escolaturmaalunos
    const handleConfirmarSincronizacao = async () => {
        return;
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

            {/* input oculto para selecao do arquivo */}
            <input
                ref={inputRef}
                type="file"
                accept=".zip"
                style={{ display: 'none' }}
                onChange={handleArquivoSelecionado}
            />

            {/* conteudo explicativo carregado do markdown */}
            {!diffResultado && !processandoZip && (
                <>
                    <div className="app__ajuda__conteudo">
                        <ReactMarkdown>{conteudoAjuda}</ReactMarkdown>
                    </div>

                    {arquivoNome && (
                        <div className="admin__filtros-container" style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p>Arquivo selecionado: <strong>{arquivoNome}</strong></p>
                        </div>
                    )}
                </>
            )}

            {/* feedback durante processamento */}
            {processandoZip && (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="app__title" style={{ fontSize: '1.2rem' }}>Processando Planilhas...</p>
                    <p className="admin__usuario__subtitulo">Descompactando ZIP e comparando com o banco de dados.</p>
                </div>
            )}

            {erro && (
                <div className="app__alerta-erro" style={{ marginTop: '1rem' }}>
                    <p>{erro}</p>
                </div>
            )}

            {/* preview com diferencas encontradas */}
            {diffResultado && !processandoZip && (
                <>
                    <div className="admin__filtros-container">
                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Resumo das Alterações</p>
                        <p>Total de escolas no arquivo: <strong>{diffResultado.totalEscolasNoZip}</strong></p>
                        <p>Escolas novas a cadastrar: <strong>{diffResultado.totalEscolasNovas}</strong></p>
                        <p>Alunos novos identificados: <strong style={{ color: 'var(--cor-step)' }}>+{diffResultado.totalAlunosNovos}</strong></p>
                        <p>Alunos removidos/transferidos: <strong style={{ color: 'var(--cor-negative)' }}>-{diffResultado.totalAlunosRemovidos}</strong></p>
                        <p>Datas de nascimento corrigidas: <strong>{diffResultado.totalAlunosModificados}</strong></p>
                    </div>

                    {diffResultado.escolasNovas.length > 0 && (
                        <div className="app__resumo">
                            <p className="app__resumo__subtitle">Escolas Novas</p>
                            {diffResultado.escolasNovas.map((nome, idx) => (
                                <p key={idx}>+ {nome}</p>
                            ))}
                        </div>
                    )}

                    {diffResultado.detalhesPorEscola.length > 0 && (
                        <div className="app__resumo">
                            <p className="app__resumo__subtitle">Escolas com Alterações</p>
                            {diffResultado.detalhesPorEscola.map((detalhe, idx) => (
                                <div key={idx} style={{ marginBottom: '0.6rem' }}>
                                    <p><strong>{detalhe.nome}</strong></p>
                                    {detalhe.turmasNovas.length > 0 && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--cor-step)' }}>
                                            Turmas novas: {detalhe.turmasNovas.join(', ')}
                                        </p>
                                    )}
                                    {detalhe.turmasRemovidas.length > 0 && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--cor-negative)' }}>
                                            Turmas removidas: {detalhe.turmasRemovidas.join(', ')}
                                        </p>
                                    )}
                                    {detalhe.turmasAlteradas.length > 0 && (
                                        <p style={{ fontSize: '0.9rem' }}>
                                            Turmas com alterações: {detalhe.turmasAlteradas.map((t) => `${t.nome} (+${t.novos}/-${t.removidos})`).join('; ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* rodape de acao */}
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
                            <p>{salvandoBanco ? 'Sincronizando...' : 'Confirmar e Atualizar'}</p>
                        </button>
                    </>
                )}
            </div>
        </>
    );
}