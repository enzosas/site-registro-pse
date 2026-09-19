import { supabase } from '../supabase';

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

        return { sucesso: true, data };
    } catch (err) {
        console.error('Erro inesperado no login:', err);
        return { sucesso: false, erro: 'erro de conexão. verifique sua internet' };
    }
}

export async function carregarEscolasDB() {
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