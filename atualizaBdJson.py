"""
===============================================================================
[VERSÃO ANTIGA / OBSOLETO] - Atualizador de Banco de Dados via JSON Local
===============================================================================

Status:
    Descontinuado (Substituído pela sincronização direta de planilhas para a
    tabela 'escolaturmaalunos').

Descrição:
    Este script realizava o envio em lote de dados pré-processados para o Supabase.
    Ele carrega um arquivo local estático ('banco_dados_completo.json') e 
    atualiza integralmente uma coluna do tipo JSONB ('json') em uma única linha 
    específica (id = 1) na tabela legada 'dados'.

Como funcionava:
    1. Lê o arquivo local 'banco_dados_completo.json' do mesmo diretório.
    2. Conecta ao Supabase usando as chaves de API estáticas.
    3. Executa um UPDATE sobrescrevendo o payload JSON no registro com id=1.

Nota de Depreciação:
    Esta abordagem não faz extração direta de planilhas .xlsx nem normaliza
    a estrutura relacional de escolas/turmas no banco. Mantenha este arquivo
    apenas para referência histórica ou restauração de backup legado.
===============================================================================
"""

import json
import os
from supabase import Client, create_client

SUPABASE_URL=""
SUPABASE_KEY=""

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

caminho_json = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "banco_dados_completo.json"
)

with open(caminho_json, "r", encoding="utf-8") as f:
    conteudo_json = json.load(f)

NOME_TABELA = "dados"
COLUNA_JSONB = "json"
ID_DO_REGISTRO = 1

try:
    resposta = (
        supabase.table(NOME_TABELA)
        .update({COLUNA_JSONB: conteudo_json})
        .eq("id", ID_DO_REGISTRO)
        .execute()
    )

    print("JSONB atualizado com sucesso no supabase")

except Exception as e:
    print(f"erro ao atualizar supabase: {e}")