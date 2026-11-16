import { useState } from 'react';
import { vincularEscolasAUbsDB } from '../../services/supabaseService';
import { useDados } from '../../context/DadosContext';
import { MensagemErro } from '../../components/MensagemErro';

const OPCAO_SEM_UBS = 'Sem UBS (Desvincular)';

export function PainelEditarEscolaUbs({ onSucesso }) {
    const {
        escolas: listaEscolas,
        listaUbs,
        recarregarEscolas,
        carregandoDados: carregando
    } = useDados();

    const [salvando, setSalvando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [escolasInput, setEscolasInput] = useState(['']);
    const [ubsTexto, setUbsTexto] = useState('');
    // Avisos de nomes não encontrados só aparecem depois de clicar em "Salvar Vínculo"
    const [mostrarValidacao, setMostrarValidacao] = useState(false);

    const handleAlterarEscola = (index, novoValor) => {
        setEscolasInput((prev) => {
            const copia = [...prev];
            copia[index] = novoValor;
            return copia;
        });
        setMensagemErro('');
        setMostrarValidacao(false);
    };

    const handleAdicionarEscola = () => {
        setEscolasInput((prev) => [...prev, '']);
    };

    const handleRemoverEscola = (indexRemover) => {
        setEscolasInput((prev) => prev.filter((_, index) => index !== indexRemover));
        setMostrarValidacao(false);
    };

    const ehDesvinculacao = ubsTexto.trim().toLowerCase() === OPCAO_SEM_UBS.toLowerCase();
    const ubsEncontrada = listaUbs.find(
        (u) => u.nome.trim().toLowerCase() === ubsTexto.trim().toLowerCase()
    );

    // Confere cada nome digitado com a lista de escolas
    const escolasConferidas = escolasInput.map((texto) => {
        const nome = texto.trim();
        const achada = nome
            ? listaEscolas.find((e) => e.nome.trim().toLowerCase() === nome.toLowerCase())
            : null;
        return { nome, id: achada ? achada.id : null };
    });

    const escolasValidas = escolasConferidas
        .filter((escola) => escola.id !== null)
        .map((escola) => escola.id);

    // Nomes preenchidos que não existem na lista: bloqueiam o salvamento em vez de serem ignorados
    const escolasNaoEncontradas = escolasConferidas
        .filter((escola) => escola.nome && escola.id === null)
        .map((escola) => escola.nome);

    const ubsNaoEncontrada = Boolean(ubsTexto.trim()) && !ubsEncontrada && !ehDesvinculacao;

    const isFormValido =
        (Boolean(ubsEncontrada) || ehDesvinculacao) &&
        escolasValidas.length > 0 &&
        escolasNaoEncontradas.length === 0;

    // O botão fica ativo assim que há algo preenchido; a conferência acontece ao clicar
    const temAlgoPreenchido =
        escolasConferidas.some((escola) => escola.nome) && Boolean(ubsTexto.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (salvando || carregando) return;
        if (!isFormValido) {
            setMostrarValidacao(true);
            return;
        }
        setMensagemErro('');
        setSalvando(true);

        const idsUnicos = [...new Set(escolasValidas)];
        const idUbsDestino = ehDesvinculacao ? null : ubsEncontrada.id;

        const resultado = await vincularEscolasAUbsDB(idsUnicos, idUbsDestino);
        setSalvando(false);

        if (!resultado.sucesso) {
            setMensagemErro(resultado.erro || 'Falha ao vincular escolas.');
            return;
        }

        await recarregarEscolas();
        alert(ehDesvinculacao ? 'Vínculo removido com sucesso!' : 'Vinculação salva com sucesso!');
        if (onSucesso) {
            onSucesso();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <p className="app__title">Editar Vínculo Escola-UBS</p>
            <p className="admin__usuario__subtitulo">
                Selecione as escolas e a UBS à qual elas serão vinculadas (ou selecione para desvincular):
            </p>
            <datalist id="lista-escolas-datalist">
                {listaEscolas.map((escola) => (
                    <option key={escola.id} value={escola.nome} />
                ))}
            </datalist>
            <datalist id="lista-ubs-datalist">
                <option value={OPCAO_SEM_UBS} />
                {listaUbs.map((ubs) => (
                    <option key={ubs.id} value={ubs.nome} />
                ))}
            </datalist>
            <div className="app__input-group">
                <label>Escolas a vincular / alterar</label>
                {escolasInput.map((escola, index) => (
                    <div key={index} className="app__tela-profissionais__row">
                        <input
                            type="text"
                            placeholder={
                                carregando
                                    ? 'A carregar escolas...'
                                    : `Digite ou selecione a escola ${index + 1}`
                            }
                            list="lista-escolas-datalist"
                            className="app__date-input app__tela-profissionais__input"
                            value={escola}
                            onChange={(e) => handleAlterarEscola(index, e.target.value)}
                            autoComplete="off"
                            disabled={carregando || salvando}
                            required
                        />
                        {escolasInput.length > 1 && (
                            <button
                                type="button"
                                className="app__buttonSecondary app__tela-profissionais__btn-remover"
                                onClick={() => handleRemoverEscola(index)}
                                title="Remover campo"
                                disabled={salvando}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    className="app__buttonSecondary app__tela-profissionais__btn-adicionar"
                    onClick={handleAdicionarEscola}
                    disabled={carregando || salvando}
                >
                    + Adicionar outra escola
                </button>
            </div>
            <div className="app__input-group" style={{ marginTop: '1rem' }}>
                <label>UBS Responsável</label>
                <input
                    type="text"
                    placeholder={
                        carregando
                            ? 'A carregar UBSs...'
                            : 'Digite a UBS ou selecione Sem UBS (Desvincular)'
                    }
                    list="lista-ubs-datalist"
                    value={ubsTexto}
                    onChange={(e) => {
                        setUbsTexto(e.target.value);
                        setMensagemErro('');
                        setMostrarValidacao(false);
                    }}
                    autoComplete="off"
                    disabled={carregando || salvando}
                    required
                />
            </div>
            <div className="app__footer">
                {mostrarValidacao && escolasNaoEncontradas.length > 0 && (
                    <MensagemErro
                        mensagem={`${
                            escolasNaoEncontradas.length === 1
                                ? 'Escola não encontrada'
                                : 'Escolas não encontradas'
                        }: ${escolasNaoEncontradas.join(', ')}. Selecione o nome a partir da lista.`}
                    />
                )}
                {mostrarValidacao && ubsNaoEncontrada && (
                    <MensagemErro mensagem="UBS não encontrada. Selecione uma UBS a partir da lista." />
                )}
                {mensagemErro && (
                    <div style={{ color: 'var(--cor-negative, #ff4d4f)' }}>
                        {mensagemErro}
                    </div>
                )}
                <button
                    type="submit"
                    className="app__buttonMain"
                    disabled={!temAlgoPreenchido || salvando || carregando}
                >
                    <p>{salvando ? 'Guardando alterações...' : 'Salvar Vínculo'}</p>
                </button>
            </div>
        </form>
    );
}