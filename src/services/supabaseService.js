import { supabase } from '../supabase';
import { formatarNome } from '../utils/formatadores';
import { TIPO_USUARIO } from '../constantes';

export async function autenticarUsuario(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.status === 400 || error.message?.includes('Invalid login credentials')) {
                return { sucesso: false, erro: 'credenciais inválidas' };
            }
            if (error.status >= 500) {
                return { sucesso: false, erro: 'servidor fora do ar. tente novamente mais tarde' };
            }
            return { sucesso: false, erro: 'erro de conexão. verifique sua internet' };
        }

        const { data: usuarioPerfil, error: erroPerfil } = await supabase
            .from('usuarios')
            .select('nome, tipo_usuario, escola_id, ubs_id')
            .eq('id', data.user.id)
            .maybeSingle();

        if (erroPerfil) {
            console.error('Erro ao buscar perfil do usuário:', erroPerfil);
        }

        return {
            sucesso: true,
            data,
            id: data.user.id,
            nome: usuarioPerfil?.nome || '',
            tipoUsuario: usuarioPerfil?.tipo_usuario || '',
            escolaId: usuarioPerfil?.escola_id || null,
            ubsId: usuarioPerfil?.ubs_id || null,
        };
    } catch (err) {
        console.error('Erro inesperado no login:', err);
        return { sucesso: false, erro: 'erro de conexão. verifique sua internet' };
    }
}

export async function oldCarregarEscolasDB() {
    try {
        const { data, error } = await supabase
            .from('dados')
            .select('json')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Erro ao buscar dados do Supabase:', error);
            return [];
        }

        return data?.json?.escolas || [];
    } catch (err) {
        console.error('Erro inesperado ao carregar escolas:', err);
        return [];
    }
}

export async function carregarEscolasDB() {
    try {
        const { data, error } = await supabase
            .from('escolas')
            .select(`
                id,
                nome,
                escolaturmaalunos (
                    dados,
                    atualizado_em
                )
            `)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar dados do Supabase:', error);
            return [];
        }

        return (data || []).map((escola) => {
            const registroVinculo = Array.isArray(escola.escolaturmaalunos)
                ? escola.escolaturmaalunos[0]
                : escola.escolaturmaalunos;

            const turmasBrutas = registroVinculo?.dados?.turmas || [];
            const atualizadoEm = registroVinculo?.atualizado_em || null;

            const turmasFormatadas = turmasBrutas.map((turma) => ({
                ...turma,
                nome: formatarNome(turma.nome),
                alunos: (turma.alunos || []).map((aluno) => ({
                    ...aluno,
                    nome: formatarNome(aluno.nome),
                })),
            }));

            return {
                id: escola.id,
                nome: formatarNome(escola.nome),
                turmas: turmasFormatadas,
                atualizadoEm: atualizadoEm,
            };
        });
    } catch (err) {
        console.error('Erro inesperado ao carregar escolas:', err);
        return [];
    }
}

export async function carregarUbsDB() {
    try {
        const { data, error } = await supabase
            .from('ubs')
            .select('id, nome')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar UBSs:', error);
            return [];
        }

        return (data || []).map((item) => ({
            id: item.id,
            nome: formatarNome(item.nome),
        }));
    } catch (err) {
        console.error('Erro inesperado ao carregar UBSs:', err);
        return [];
    }
}

export async function criarNovoUsuarioAdmin({ email, password, nome, tipoUsuario, escolaId = null, ubsId = null }) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome,
                    tipo_usuario: tipoUsuario,
                    escola_id: escolaId,
                    ubs_id: ubsId,
                }
            }
        });

        if (error) {
            console.error('Erro ao cadastrar usuário no Auth:', error);
            return { sucesso: false, erro: error.message };
        }

        return { sucesso: true, id: data.user?.id };
    } catch (err) {
        console.error('Erro inesperado ao criar usuário:', err);
        return { sucesso: false, erro: 'Erro de conexão ao criar o usuário.' };
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
            return [];
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

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar usuários:', error);
            return [];
        }

        return (data || []).map((usuario) => {
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
    } catch (err) {
        console.error('Erro inesperado ao buscar usuários:', err);
        return [];
    }
}

export async function deletarUsuarioDB(usuarioId) {
    try {
        if (!usuarioId) {
            return { sucesso: false, erro: 'ID do usuário não fornecido.' };
        }

        const { error } = await supabase.rpc('deletar_usuario_por_admin', {
            usuario_alvo_id: usuarioId,
        });

        if (error) {
            console.error('Erro ao deletar usuário:', error);
            return { sucesso: false, erro: error.message || 'Falha ao deletar o usuário.' };
        }

        return { sucesso: true };
    } catch (err) {
        console.error('Erro inesperado ao deletar usuário:', err);
        return { sucesso: false, erro: 'Erro inesperado ao deletar o usuário.' };
    }
}