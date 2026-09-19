import os
import warnings
import pandas as pd
from dotenv import load_dotenv
from supabase import Client, create_client

warnings.simplefilter("ignore", category=UserWarning)
load_dotenv()

# Configurações do Supabase
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_KEY não foram encontradas no .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

diretorio_atual = os.path.dirname(os.path.abspath(__file__))
pasta_alvo = os.path.join(diretorio_atual, "PET PSE")


def extrair_dados_planilha(caminho):
    df = pd.read_excel(caminho)
    nome_escola = str(df["Unnamed: 14"][0]).strip()
    return nome_escola


def testar_sync():
    nomes_escolas = set()
    print("Varrendo pastas para encontrar escolas...")

    for pasta_atual, _, arquivos in os.walk(pasta_alvo):
        for arquivo in arquivos:
            if arquivo.endswith(".xlsx") and not arquivo.startswith("~$"):
                caminho = os.path.join(pasta_atual, arquivo)
                try:
                    nome = extrair_dados_planilha(caminho)
                    if nome and nome != "Nan":
                        nomes_escolas.add(nome)
                except Exception as e:
                    print(f"Aviso em '{arquivo}': {e}")

    print(f"Total de escolas encontradas: {len(nomes_escolas)}")
    for nome in sorted(nomes_escolas):
        print(f" - {nome}")

    registros = [{"nome": n} for n in sorted(nomes_escolas)]

    print("\nEnviando para o Supabase via upsert...")
    resposta = (
        supabase.table("escolas")
        .upsert(registros, on_conflict="nome")
        .execute()
    )

    print("\nConsulta de verificação no banco:")
    dados_banco = supabase.table("escolas").select("*").execute()
    for linha in dados_banco.data:
        print(linha)


if __name__ == "__main__":
    testar_sync()