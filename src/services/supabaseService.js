import { supabase } from '../supabase';
import { formatarNome } from '../utils/formatadores';

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
            .select('nome')
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