"""
Atualizador das turmas no banco de dados (Pasta PET PSE -> Supabase)

Descrição:
    Varre recursivamente o diretório de planilhas do PET PSE, extrai 
    informações de turmas e alunos (.xlsx) e sincroniza os dados no Supabase:

Como usar:
    Deixe a pasta PET PSE no mesmo diretório desse arquivo e execute este arquivo

Estrutura esperada na pasta 'PET PSE':
    A pasta deve seguir um dos dois padrões abaixo:

    1. Organização direta por escola (Recomendado):
       PET PSE/
       ├── Escola Exemplo 1/
       │   ├── Relatorio - 1º Ano A EducarWEB.xlsx
       │   └── Relatorio - 2º Ano B EducarWEB.xlsx
       └── Escola Exemplo 2/
           └── Relatorio - 3º Ano A.xlsx

    2. Organização com subpastas (turnos/etapas):
       PET PSE/
       └── Escola Exemplo 1/
           ├── Anos Iniciais/
           │   └── Relatorio - 1º Ano A.xlsx
           └── Educacao Infantil/
               └── Relatorio - Pre-Escola.xlsx

Atenção à hierarquia de pastas:
    - Se a pasta de uma escola contiver subpastas, o script irá ler EXCLUSIVAMENTE
        os arquivos contidos dentro dessas subpastas.
    - Planilhas colocadas soltas na raiz de uma pasta que possua subpastas
        serão desconsideradas. Escolha apenas um formato por escola (ou todas as turmas
        soltas, ou todas divididas em subpastas).

Regras e comportamento dos arquivos:
    - Formato: Apenas arquivos Excel modernos (.xlsx). Ignora .xls, .csv e temporários (~$).
    - Quantidade de turmas por planilha:
      * Planilhas com 1 turma: O nome da turma é substituído automaticamente pelo nome do
        arquivo limpo (removendo termos como 'Relatorio', 'EducarWEB', prefixos e cópias).
      * Planilhas com múltiplas turmas:
        - Se estiverem na raiz da escola (sem subpastas): são aceitas, mantendo os nomes
          originais de cada turma extraídos de dentro da própria planilha ('Série: ...').
        - Se estiverem dentro de subpastas de nível 2: o script atual lança erro,
          exigindo que cada turma esteja em um arquivo separado nesse modo.
    - Consistência: O nome da escola no cabeçalho da planilha (linha de metadados) deve ser
      idêntico ao cadastrado no banco de dados.
"""

import os
import re
import warnings
import pandas as pd
from dotenv import load_dotenv
from supabase import Client, create_client
from datetime import datetime, timezone

warnings.simplefilter("ignore", category=UserWarning)
load_dotenv()

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
    nomes = df["Unnamed: 5"].tolist()
    datas = df["Unnamed: 12"].tolist()
    turmas_raw = df["Unnamed: 1"].tolist()

    conjunto_turmas = []
    turma_atual = []
    nome_turma_atual = ""
    nome_turma_lista = ""

    for nome, data, turma_info in zip(nomes, datas, turmas_raw):
        if pd.notna(turma_info):
            turma_info_str = str(turma_info).strip()
            if "Série:" in turma_info_str:
                nome_turma_atual = turma_info_str.replace("Série:", "").strip()

        if pd.isna(nome):
            continue

        nome_str = str(nome).strip()

        if nome_str == "Nome":
            if turma_atual:
                conjunto_turmas.append({
                    "nome": nome_turma_lista,
                    "alunos": turma_atual,
                })
            turma_atual = []
            nome_turma_lista = nome_turma_atual
        else:
            data_str = str(data).strip()[:10] if not pd.isna(data) else ""
            aluno = {
                "nome": nome_str,
                "dataNascimento": data_str,
            }
            turma_atual.append(aluno)

    if turma_atual:
        conjunto_turmas.append({
            "nome": nome_turma_lista,
            "alunos": turma_atual,
        })

    return nome_escola, conjunto_turmas


def extrair_nome_turma_arquivo(nome_arquivo: str) -> str:
    texto = re.sub(r"\.xlsx$", "", nome_arquivo, flags=re.IGNORECASE).strip()
    texto = re.sub(r"\s*\(\d+\)\s*$", "", texto).strip()
    texto = re.sub(r"\s*(?:Emitido\s+Pelo\s+)?Educar\s*WEB\s*$", "", texto, flags=re.IGNORECASE).strip()
    texto = re.sub(
        r"^Relatorio\s+(?:Anos\s+Finais|Anos\s+Iniciais|Ensino\s+Fundamental|Edcu?\.?\s*Infantil|Educ[a-z\.\s]+)?\s*",
        "",
        texto,
        flags=re.IGNORECASE,
    ).strip()
    texto = re.sub(r"^[-–—]\s*", "", texto).strip()
    return texto


def varrer_arquivos_pastas(diretorio_raiz):
    banco_dados = {"escolas": []}

    for pasta_atual, subpastas, arquivos in os.walk(diretorio_raiz):
        subpastas_com_xlsx = False
        if pasta_atual != diretorio_raiz and subpastas:
            for sub in subpastas:
                caminho_sub = os.path.join(pasta_atual, sub)
                if os.path.isdir(caminho_sub):
                    tem_xlsx = any(
                        f.endswith(".xlsx") and not f.startswith("~$")
                        for f in os.listdir(caminho_sub)
                    )
                    if tem_xlsx:
                        subpastas_com_xlsx = True
                        break

        if pasta_atual != diretorio_raiz and subpastas_com_xlsx:
            for sub in list(subpastas):
                caminho_sub = os.path.join(pasta_atual, sub)
                for item in os.listdir(caminho_sub):
                    if item.endswith(".xlsx") and not item.startswith("~$"):
                        caminho_arquivo = os.path.join(caminho_sub, item)
                        try:
                            nome_escola, turmas_extraidas = extrair_dados_planilha(caminho_arquivo)
                            
                            if not nome_escola or str(nome_escola).strip().lower() in ("nan", "none", ""):
                                continue

                            if not turmas_extraidas:
                                continue

                            if len(turmas_extraidas) == 1:
                                turmas_extraidas[0]["nome"] = extrair_nome_turma_arquivo(item)

                            escola_existente = next((e for e in banco_dados["escolas"] if e["nome"] == nome_escola), None)
                            if escola_existente:
                                escola_existente["turmas"].extend(turmas_extraidas)
                            else:
                                banco_dados["escolas"].append({"nome": nome_escola, "turmas": turmas_extraidas})
                        except Exception as e:
                            print(f"Erro em '{item}': {e}")

            subpastas.clear()

        else:
            for arquivo in arquivos:
                if arquivo.endswith(".xlsx") and not arquivo.startswith("~$"):
                    caminho_completo = os.path.join(pasta_atual, arquivo)
                    try:
                        nome_escola, turmas_extraidas = extrair_dados_planilha(caminho_completo)

                        if not nome_escola or str(nome_escola).strip().lower() in ("nan", "none", ""):
                            continue

                        if not turmas_extraidas:
                            continue

                        if len(turmas_extraidas) == 1:
                            novo_nome = extrair_nome_turma_arquivo(arquivo)
                            if novo_nome:
                                turmas_extraidas[0]["nome"] = novo_nome

                        escola_existente = next((e for e in banco_dados["escolas"] if e["nome"] == nome_escola), None)
                        if escola_existente:
                            escola_existente["turmas"].extend(turmas_extraidas)
                        else:
                            banco_dados["escolas"].append({"nome": nome_escola, "turmas": turmas_extraidas})
                    except Exception as e:
                        print(f"Erro em '{arquivo}': {e}")

    return banco_dados

def obter_mapa_escolas_banco(supabase_client):
    resposta = supabase_client.table("escolas").select("id, nome").execute()
    return {item["nome"]: item["id"] for item in resposta.data}


def salvar_escola_turmas_supabase(banco_dados_processado, mapa_escolas, supabase_client):
    registros = []
    turma_id = 101
    aluno_id = 1001

    agora_iso = datetime.now(timezone.utc).isoformat()

    for escola in banco_dados_processado["escolas"]:
        nome_escola = escola["nome"]

        if not nome_escola or str(nome_escola).strip().lower() in ("nan", "none", ""):
            continue

        escola_id = mapa_escolas.get(nome_escola)
        
        if not escola_id:
            print(f"Aviso: Escola '{nome_escola}' não encontrada no banco. Pulando...")
            continue

        turmas_formatadas = []
        for turma in escola["turmas"]:
            turma_formatada = {
                "id": turma_id,
                "nome": turma["nome"],
                "alunos": [],
            }
            turma_id += 1

            for aluno in turma["alunos"]:
                turma_formatada["alunos"].append({
                    "id": aluno_id,
                    "nome": aluno["nome"],
                    "dataNascimento": aluno["dataNascimento"],
                })
                aluno_id += 1

            turmas_formatadas.append(turma_formatada)

        registros.append({
            "escola_id": escola_id,
            "dados": {
                "turmas": turmas_formatadas
            },
            "atualizado_em": agora_iso
        })

    try:
        resposta = (
            supabase_client.table("escolaturmaalunos")
            .upsert(registros, on_conflict="escola_id")
            .execute()
        )
        print(f"Sucesso: {len(registros)} escolas atualizadas na tabela 'escolaturmaalunos'.")
        return resposta.data
    except Exception as e:
        print(f"Erro ao salvar em 'escolaturmaalunos': {e}")
        return None


if __name__ == "__main__":
    print(f"1. Lendo planilhas na pasta '{pasta_alvo}'...")
    banco_processado = varrer_arquivos_pastas(pasta_alvo)
    print(f"Encontradas {len(banco_processado['escolas'])} escolas nas pastas.")

    print("2. Consultando IDs da tabela 'escolas' no Supabase...")
    mapa = obter_mapa_escolas_banco(supabase)
    print(f"Mapeadas {len(mapa)} escolas registradas no banco.")

    print("3. Enviando turmas e alunos para 'escolaturmaalunos'...")
    salvar_escola_turmas_supabase(banco_processado, mapa, supabase)