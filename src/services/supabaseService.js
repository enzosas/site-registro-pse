import { supabase } from './supabaseClient';
import { formatarNome, formatarNomeTurma } from '../utils/formatadores';
import { TIPO_USUARIO } from '../utils/constantes';
import { explicarErro, explicarMensagemDoBanco, erroLocal, erroDeValidacao } from '../utils/mensagensErro';

// Resultado de falha padronizado: texto (compatibilidade) + explicação para o cartão de erro
function falha(explicacao) {
    return { sucesso: false, erro: explicacao.texto, explicacao };
}

// Erro que carrega a explicação pronta para a tela (usado pelas funções que lançam exceção)
function erroExplicado(explicacao) {
    const erro = new Error(explicacao.texto);
    erro.explicacao = explicacao;
    return erro;
}

const EMAIL_PROTEGIDO = (import.meta.env.VITE_EMAIL_PROTEGIDO || '').trim().toLowerCase();

async function buscarPerfilUsuario(userId) {
    const { data: usuarioPerfil, error: erroPerfil } = await supabase
        .from('usuarios')
        .select('nome, tipo_usuario, escola_id, ubs_id')
        .eq('id', userId)
        .maybeSingle();

    if (erroPerfil) {
        console.error('Erro ao buscar perfil do usuário:', erroPerfil);
    }

    return {
        nome: usuarioPerfil?.nome || '',
        tipoUsuario: usuarioPerfil?.tipo_usuario || '',
        escolaId: usuarioPerfil?.escola_id || null,
        ubsId: usuarioPerfil?.ubs_id || null,
    };
}

// Recupera a sessão que o Supabase guardou no navegador (ex.: após recarregar a página)
export async function restaurarSessaoUsuario() {
    try {
        const { data, error } = await supabase.auth.getSession();
        const usuario = data?.session?.user;
        if (error || !usuario) {
            return { sucesso: false };
        }

        const perfil = await buscarPerfilUsuario(usuario.id);
        return { sucesso: true, id: usuario.id, ...perfil };
    } catch (err) {
        console.error('Erro inesperado ao restaurar sessão:', err);
        return { sucesso: false };
    }
}

// Avisa quando a sessão termina por fora do app (token expirado, logout em outra aba)
export function observarFimDaSessao(callback) {
    const { data } = supabase.auth.onAuthStateChange((evento) => {
        if (evento === 'SIGNED_OUT') {
            callback();
        }
    });
    return () => data.subscription.unsubscribe();
}

export async function autenticarUsuario(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (/invalid login credentials/i.test(error.message || '') || (error.status === 400 && !/confirm/i.test(error.message || ''))) {
                return falha(erroLocal({
                    oQue: 'Não foi possível entrar.',
                    porque: 'E-mail ou senha incorretos.',
                    oQueFazer: 'Confira o e-mail e a senha e tente de novo. Se esqueceu a senha, procure a coordenação.',
                    codigo: 'LOGIN-400',
                }));
            }
            if (/email not confirmed/i.test(error.message || '')) {
                return falha(erroLocal({
                    oQue: 'Não foi possível entrar.',
                    porque: 'O e-mail desta conta ainda não foi confirmado.',
                    oQueFazer: 'Procure a coordenação para liberar o acesso.',
                    codigo: 'LOGIN-CONFIRMACAO',
                }));
            }
            return falha(explicarErro(error, { oQue: 'Não foi possível entrar.', status: error.status }));
        }

        const perfil = await buscarPerfilUsuario(data.user.id);

        return {
            sucesso: true,
            data,
            id: data.user.id,
            ...perfil,
        };
    } catch (err) {
        console.error('Erro inesperado no login:', err);
        return falha(explicarErro(err, { oQue: 'Não foi possível entrar.' }));
    }
}

export async function carregarEscolasDB() {
    try {
        const { data, error, status } = await supabase
            .from('escolas')
            .select(`
                id,
                nome,
                ubs_responsavel,
                escolaturmaalunos (
                    dados,
                    atualizado_em
                )
            `)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar dados do Supabase:', error);
            throw erroExplicado(explicarErro(error, { oQue: 'Não foi possível carregar a lista de escolas.', status }));
        }

        return (data || []).map((escola) => {
            const registroVinculo = Array.isArray(escola.escolaturmaalunos)
                ? escola.escolaturmaalunos[0]
                : escola.escolaturmaalunos;
            const turmasBrutas = registroVinculo?.dados?.turmas || [];
            const atualizadoEm = registroVinculo?.atualizado_em || null;
            const turmasFormatadas = turmasBrutas.map((turma) => ({
                ...turma,
                nome: formatarNomeTurma(turma.nome),
                alunos: (turma.alunos || []).map((aluno) => ({
                    ...aluno,
                    nome: formatarNome(aluno.nome),
                })),
            }));

            return {
                id: escola.id,
                nome: formatarNome(escola.nome),
                ubs_responsavel: escola.ubs_responsavel,
                turmas: turmasFormatadas,
                atualizadoEm: atualizadoEm,
            };
        });
    } catch (err) {
        if (err.explicacao) throw err;
        console.error('Erro inesperado ao carregar escolas:', err);
        throw erroExplicado(explicarErro(err, { oQue: 'Não foi possível carregar a lista de escolas.' }));
    }
}

export async function carregarUbsDB() {
    try {
        const { data, error, status } = await supabase
            .from('ubs')
            .select('id, nome')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar UBSs:', error);
            throw erroExplicado(explicarErro(error, { oQue: 'Não foi possível carregar a lista de UBS.', status }));
        }

        return (data || []).map((item) => ({
            id: item.id,
            nome: formatarNome(item.nome),
        }));
    } catch (err) {
        if (err.explicacao) throw err;
        console.error('Erro inesperado ao carregar UBSs:', err);
        throw erroExplicado(explicarErro(err, { oQue: 'Não foi possível carregar a lista de UBS.' }));
    }
}

const OQUE_CRIAR_USUARIO = 'Não foi possível criar o usuário.';
const AJUSTES_CRIAR_USUARIO = {
    duplicado: {
        porque: 'Já existe uma conta com este e-mail.',
        oQueFazer: 'Use outro e-mail ou exclua a conta antiga antes de criar a nova.',
    },
};

export async function criarNovoUsuarioAdmin({
    nome,
    email,
    password,
    tipoUsuario,
    escolaId = null,
    ubsId = null,
}) {
    try {
        const { data, error, status } = await supabase.rpc('criar_usuario_admin', {
            novo_nome: nome,
            novo_email: email,
            nova_senha: password,
            novo_tipo: tipoUsuario,
            novo_escola_id: escolaId,
            novo_ubs_id: ubsId,
        });

        if (error) {
            console.error('Erro na RPC de criar usuário:', error);
            return falha(explicarErro(error, { oQue: OQUE_CRIAR_USUARIO, status, porCategoria: AJUSTES_CRIAR_USUARIO }));
        }

        if (data && !data.sucesso) {
            return falha(explicarMensagemDoBanco(data.erro, { oQue: OQUE_CRIAR_USUARIO, porCategoria: AJUSTES_CRIAR_USUARIO }));
        }

        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado ao criar usuário:', err);
        return falha(explicarErro(err, { oQue: OQUE_CRIAR_USUARIO }));
    }
}

export async function deslogarUsuario() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erro ao deslogar no Supabase:', error);
            return { sucesso: false, erro: error.message };
        }
        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado no logout:', err);
        return { sucesso: false, erro: 'erro inesperado ao sair' };
    }
}

export async function carregarUsuariosDB({ tipoUsuario, escolaId = null, ubsId = null }) {
    try {
        const podeConsultar =
            tipoUsuario === TIPO_USUARIO.ADMIN ||
            tipoUsuario === TIPO_USUARIO.ESCOLA ||
            tipoUsuario === TIPO_USUARIO.UBS;

        if (!podeConsultar) {
            return { sucesso: true, data: [] };
        }

        let query = supabase
            .from('usuarios')
            .select(`
                id,
                nome,
                email,
                tipo_usuario,
                escola_id,
                ubs_id,
                escolas ( nome ),
                ubs ( nome )
            `)
            .order('nome', { ascending: true });

        if (tipoUsuario === TIPO_USUARIO.ESCOLA && escolaId) {
            query = query.eq('escola_id', escolaId);
        } else if (tipoUsuario === TIPO_USUARIO.UBS && ubsId) {
            query = query.eq('ubs_id', ubsId);
        }

        const { data, error, status } = await query;

        if (error) {
            console.error('Erro ao buscar usuários:', error);
            return {
                sucesso: false,
                data: [],
                explicacao: explicarErro(error, { oQue: 'Não foi possível carregar a lista de usuários.', status }),
            };
        }

        const usuarios = (data || []).map((usuario) => {
            const escolaNome = Array.isArray(usuario.escolas)
                ? usuario.escolas[0]?.nome
                : usuario.escolas?.nome;

            const ubsNome = Array.isArray(usuario.ubs)
                ? usuario.ubs[0]?.nome
                : usuario.ubs?.nome;

            return {
                id: usuario.id,
                nome: usuario.nome || '',
                email: usuario.email || '',
                tipoUsuario: usuario.tipo_usuario || '',
                escolaId: usuario.escola_id,
                ubsId: usuario.ubs_id,
                escolaNome: escolaNome || null,
                ubsNome: ubsNome || null,
            };
        });
        return { sucesso: true, data: usuarios };
    } catch (err) {
        console.error('Erro inesperado ao buscar usuários:', err);
        return {
            sucesso: false,
            data: [],
            explicacao: explicarErro(err, { oQue: 'Não foi possível carregar a lista de usuários.' }),
        };
    }
}

const OQUE_EXCLUIR_USUARIO = 'Não foi possível excluir o usuário.';

export async function deletarUsuarioDB(usuarioId, email = '') {
    try {
        if (!usuarioId) {
            return falha(erroDeValidacao({ oQue: OQUE_EXCLUIR_USUARIO, porque: 'Nenhum usuário foi selecionado.', oQueFazer: 'Volte e escolha o usuário na lista.' }));
        }

        if (EMAIL_PROTEGIDO && email && email.trim().toLowerCase() === EMAIL_PROTEGIDO) {
            return falha(erroDeValidacao({ oQue: OQUE_EXCLUIR_USUARIO, porque: 'Este usuário é protegido pelo sistema e não pode ser excluído.' }));
        }

        if (EMAIL_PROTEGIDO) {
            const { data: usuarioAlvo, error: erroConsulta } = await supabase
                .from('usuarios')
                .select('email')
                .eq('id', usuarioId)
                .maybeSingle();

            if (!erroConsulta && usuarioAlvo?.email?.trim().toLowerCase() === EMAIL_PROTEGIDO) {
                return falha(erroDeValidacao({ oQue: OQUE_EXCLUIR_USUARIO, porque: 'Este usuário é protegido pelo sistema e não pode ser excluído.' }));
            }
        }

        const { error, status } = await supabase.rpc('deletar_usuario_por_admin', {
            usuario_alvo_id: usuarioId,
        });

        if (error) {
            console.error('Erro ao deletar usuário:', error);
            return falha(explicarErro(error, { oQue: OQUE_EXCLUIR_USUARIO, status }));
        }

        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado ao deletar usuário:', err);
        return falha(explicarErro(err, { oQue: OQUE_EXCLUIR_USUARIO }));
    }
}

export async function carregarRelacaoUbsEscolasDB() {
    try {
        const [respUbs, respEscolas] = await Promise.all([
            supabase
                .from('ubs')
                .select('id, nome')
                .order('nome', { ascending: true }),
            supabase
                .from('escolas')
                .select('id, nome, ubs_responsavel')
                .order('nome', { ascending: true })
        ]);

        const respostaComErro = respUbs.error ? respUbs : respEscolas.error ? respEscolas : null;
        if (respostaComErro) {
            console.error('Erro ao carregar relação UBS e escolas:', respostaComErro.error);
            return {
                ubs: [],
                escolasSemUbs: [],
                explicacao: explicarErro(respostaComErro.error, {
                    oQue: 'Não foi possível carregar as UBS e escolas.',
                    status: respostaComErro.status,
                }),
            };
        }

        const listaUbs = respUbs.data || [];
        const listaEscolas = respEscolas.data || [];

        const ubsMapeadas = listaUbs.map((ubs) => ({
            id: ubs.id,
            nome: formatarNome(ubs.nome),
            escolas: listaEscolas
                .filter((esc) => String(esc.ubs_responsavel) === String(ubs.id))
                .map((esc) => ({
                    id: esc.id,
                    nome: formatarNome(esc.nome),
                })),
        }));

        const escolasSemUbs = listaEscolas
            .filter((esc) => !esc.ubs_responsavel)
            .map((esc) => ({
                id: esc.id,
                nome: formatarNome(esc.nome),
            }));

        return {
            ubs: ubsMapeadas,
            escolasSemUbs,
        };
    } catch (err) {
        console.error('Erro inesperado ao carregar relação UBS e Escolas:', err);
        return {
            ubs: [],
            escolasSemUbs: [],
            explicacao: explicarErro(err, { oQue: 'Não foi possível carregar as UBS e escolas.' }),
        };
    }
}

export async function criarUbsDB(nomeUbs) {
    try {
        if (!nomeUbs || !nomeUbs.trim()) {
            return falha(erroDeValidacao({ oQue: 'Informe o nome da UBS.' }));
        }

        const { data, error, status } = await supabase
            .from('ubs')
            .insert([{ nome: nomeUbs.trim() }])
            .select()
            .single();

        if (error) {
            console.error('Erro ao cadastrar UBS:', error);
            return falha(explicarErro(error, {
                oQue: 'Não foi possível cadastrar a UBS.',
                status,
                porCategoria: { duplicado: { porque: 'Já existe uma UBS com este nome.', oQueFazer: 'Confira a lista de UBS ou use outro nome.' } },
            }));
        }

        return { sucesso: true, data };
    } catch (err) {
        console.error('Erro inesperado ao cadastrar UBS:', err);
        return falha(explicarErro(err, { oQue: 'Não foi possível cadastrar a UBS.' }));
    }
}

export async function deletarUbsDB(ubsId) {
    try {
        if (!ubsId) {
            return falha(erroDeValidacao({ oQue: 'Selecione a UBS a remover.' }));
        }

        const { data, error, status } = await supabase.rpc('deletar_ubs_admin', {
            ubs_alvo_id: ubsId,
        });

        if (error) {
            console.error('Erro na RPC de excluir UBS:', error);
            return falha(explicarErro(error, { oQue: 'Não foi possível remover a UBS.', status }));
        }

        if (data && !data.sucesso) {
            return falha(explicarMensagemDoBanco(data.erro, { oQue: 'Não foi possível remover a UBS.' }));
        }

        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado ao excluir UBS:', err);
        return falha(explicarErro(err, { oQue: 'Não foi possível remover a UBS.' }));
    }
}

export async function vincularEscolasAUbsDB(escolaIds, ubsId) {
    try {
        if (!Array.isArray(escolaIds) || escolaIds.length === 0) {
            return falha(erroDeValidacao({ oQue: 'Selecione pelo menos uma escola.' }));
        }

        const idsNumericos = escolaIds.map((id) => Number(id));
        const valorUbs = ubsId ? Number(ubsId) : null;

        const { data, error, status } = await supabase
            .from('escolas')
            .update({ ubs_responsavel: valorUbs })
            .in('id', idsNumericos)
            .select();

        if (error) {
            console.error('Erro ao atualizar vínculo das escolas:', error);
            return falha(explicarErro(error, { oQue: 'Não foi possível salvar o vínculo.', status }));
        }

        return { sucesso: true, data };
    } catch (err) {
        console.error('Erro inesperado ao vincular escolas:', err);
        return falha(explicarErro(err, { oQue: 'Não foi possível salvar o vínculo.' }));
    }
}

const OQUE_SALVAR = 'Não foi possível salvar o registro.';
const AJUSTES_SALVAR = {
    permissao: { oQueFazer: 'Saia, entre novamente com a sua conta e tente de novo.' },
};

export async function salvarRegistroAtividadeDB(payload) {
    try {
        const { data, error, status } = await supabase
            .from('registros_atividade')
            .insert([
                {
                    id_cliente: payload.idCliente || null,
                    data_atividade: payload.dataAtividade,
                    turno: payload.turno,
                    escola_id: payload.escolaId,
                    ubs_id: payload.ubsId || null,
                    escola_nome: payload.escolaNome,
                    turmas: payload.turmas,
                    profissionais: payload.profissionais,
                    usuario_id: payload.usuarioId || null,
                    registrador_nome: payload.registradorNome,
                    eixos_tematicos: payload.eixosTematicos,
                    observacoes: payload.observacoes || null,
                    alunos_dados: payload.alunosDados,
                },
            ])
            .select()
            .single();

        if (error) {
            // Mesmo código único já salvo: o envio anterior chegou ao banco
            // (a resposta é que se perdeu). Não é erro: o registro já está salvo.
            if (error.code === '23505' && String(error.message || '').includes('id_cliente')) {
                return { sucesso: true, jaSalvo: true };
            }
            console.error('Erro ao salvar registro de atividade:', error);
            const explicacao = explicarErro(error, { oQue: OQUE_SALVAR, status, porCategoria: AJUSTES_SALVAR });
            return { sucesso: false, temporario: explicacao.temporario, explicacao, erro: explicacao.texto };
        }

        return { sucesso: true, data };
    } catch (err) {
        console.error('Erro inesperado ao salvar registro:', err);
        const explicacao = explicarErro(err, { oQue: OQUE_SALVAR, porCategoria: AJUSTES_SALVAR });
        return { sucesso: false, temporario: explicacao.temporario, explicacao, erro: explicacao.texto };
    }
}

export async function carregarRegistrosAtividadeDB({
    tipoUsuario = null,
    escolaId = null,
    ubsId = null,
    usuarioId = null,
} = {}) {
    try {
        let query = supabase
            .from('registros_atividade')
            .select(`
                id,
                criado_em,
                data_atividade,
                turno,
                escola_id,
                ubs_id,
                escola_nome,
                turmas,
                profissionais,
                usuario_id,
                registrador_nome,
                eixos_tematicos,
                observacoes,
                alunos_dados,
                exportado_outro_sistema,
                exportado_por_usuario_id,
                exportado_em,
                exportado_por_nome
            `)
            .order('data_atividade', { ascending: false })
            .order('id', { ascending: false });

        if (tipoUsuario === TIPO_USUARIO.ESCOLA && escolaId) {
            query = query.eq('escola_id', escolaId);
        }
        else if (tipoUsuario === TIPO_USUARIO.UBS && ubsId) {
            const { data: escolasVinculadas } = await supabase
                .from('escolas')
                .select('id')
                .eq('ubs_responsavel', ubsId);

            const idsEscolas = (escolasVinculadas || []).map((e) => e.id);

            if (idsEscolas.length > 0) {
                query = query.or(`escola_id.in.(${idsEscolas.join(',')}),ubs_id.eq.${ubsId}`);
            } else {
                query = query.eq('ubs_id', ubsId);
            }
        }
        else if (tipoUsuario === TIPO_USUARIO.COMUM && usuarioId) {
            query = query.eq('usuario_id', usuarioId);
        }

        const { data, error, status } = await query;

        if (error) {
            console.error('Erro ao buscar registros de atividade:', error);
            const explicacao = explicarErro(error, { oQue: 'Não foi possível carregar os registros.', status });
            return { sucesso: false, erro: explicacao.texto, explicacao, data: [] };
        }

        const formatados = (data || []).map((reg) => ({
            ...reg,
            // nome gravado no próprio registro ao marcar como lançado no MV
            exportador_nome: reg.exportado_por_nome || null,
        }));

        return { sucesso: true, data: formatados };
    } catch (err) {
        console.error('Erro inesperado ao carregar registros de atividade:', err);
        const explicacao = explicarErro(err, { oQue: 'Não foi possível carregar os registros.' });
        return { sucesso: false, erro: explicacao.texto, explicacao, data: [] };
    }
}

const OQUE_MARCAR_MV = 'Não foi possível marcar o registro como lançado no MV.';

export async function marcarRegistroComoExportadoDB(registroId, usuarioId, nomeUsuario = '') {
    try {
        if (!registroId || !usuarioId) {
            return falha(erroDeValidacao({ oQue: OQUE_MARCAR_MV, porque: 'O registro ou o usuário não foi identificado.', oQueFazer: 'Volte, abra o registro novamente e tente de novo.' }));
        }

        const { data, error, status } = await supabase
            .from('registros_atividade')
            .update({
                exportado_outro_sistema: true,
                exportado_por_usuario_id: usuarioId,
                exportado_por_nome: nomeUsuario || null,
                exportado_em: new Date().toISOString(),
            })
            .eq('id', registroId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao marcar registro como exportado:', error);
            return falha(explicarErro(error, { oQue: OQUE_MARCAR_MV, status }));
        }

        return { sucesso: true, data };
    } catch (err) {
        console.error('Erro inesperado ao exportar registro:', err);
        return falha(explicarErro(err, { oQue: OQUE_MARCAR_MV }));
    }
}

export async function solicitarRecuperacaoSenhaDB(email) {
    try {
        const emailLimpo = (email || '').trim();
        if (!emailLimpo) {
            return { sucesso: false, erro: 'Informe o seu e-mail.' };
        }

        // O link do e-mail traz o usuário de volta para este site (precisa estar liberado no Supabase)
        const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;

        const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, { redirectTo });

        if (error) {
            console.error('Erro ao solicitar recuperação de senha:', error);
            if (error.status === 429 || /rate limit|only request this after/i.test(error.message || '')) {
                return {
                    sucesso: false,
                    erro: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.',
                };
            }
            if (error.status >= 500) {
                return { sucesso: false, erro: 'Servidor fora do ar. Tente novamente mais tarde.' };
            }
            return {
                sucesso: false,
                erro: 'Não foi possível enviar o e-mail agora. Verifique sua internet e tente novamente.',
            };
        }

        // O Supabase responde sucesso mesmo se o e-mail não existir (de propósito, por segurança)
        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado ao solicitar recuperação de senha:', err);
        return { sucesso: false, erro: 'Erro de conexão. Verifique sua internet.' };
    }
}

export async function redefinirSenhaDB(novaSenha) {
    try {
        if (!novaSenha || novaSenha.length < 6) {
            return { sucesso: false, erro: 'A senha deve ter pelo menos 6 caracteres.' };
        }

        const { error } = await supabase.auth.updateUser({ password: novaSenha });

        if (error) {
            console.error('Erro ao redefinir senha:', error);
            const codigo = error.code || '';
            const msg = error.message || '';

            // Sessão do link inexistente ou vencida: precisa pedir outro link
            if (
                error.name === 'AuthSessionMissingError' ||
                ['session_not_found', 'session_expired', 'bad_jwt', 'no_authorization'].includes(codigo) ||
                /auth session missing|invalid jwt|jwt expired/i.test(msg)
            ) {
                return { sucesso: false, sessaoExpirada: true, erro: 'O link expirou ou já foi usado.' };
            }
            if (codigo === 'same_password' || /different from the old password|same password/i.test(msg)) {
                return { sucesso: false, erro: 'A nova senha deve ser diferente da senha atual.' };
            }
            if (codigo === 'weak_password' || /weak|at least|should contain/i.test(msg)) {
                return { sucesso: false, erro: 'Senha não aceita. Use uma senha mais forte (letras e números).' };
            }
            if (error.status === 429) {
                return { sucesso: false, erro: 'Muitas tentativas. Aguarde um pouco e tente novamente.' };
            }
            return { sucesso: false, erro: 'Não foi possível redefinir a senha. Tente novamente.' };
        }

        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado ao redefinir senha:', err);
        return { sucesso: false, erro: 'Erro de conexão. Verifique sua internet.' };
    }
}
