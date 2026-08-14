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