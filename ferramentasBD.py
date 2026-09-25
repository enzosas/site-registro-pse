"""
Atualizador das turmas no banco de dados (Pasta PET PSE -> Supabase)

Descrição:
    Varre recursivamente o diretório de planilhas do PET PSE, extrai 
    informações de turmas e alunos (.xlsx) e sincroniza os dados no Supabase.

Como usar:
    Deixe a pasta PET PSE no mesmo diretório desse arquivo e execute este arquivo.

Opções disponíveis no menu interativo:
    [ 1 ] Enviar turmas e alunos para 'escolaturmaalunos'
    [ 2 ] Ver status das escolas (Planilhas vs Banco de Dados)
    [ 3 ] Cadastrar escolas ausentes na tabela 'escolas' (Seed/Upsert)
    [ 4 ] Ver nomes de todas as turmas que serão geradas
    [ 5 ] Auditar estrutura de pastas da pasta 'PET PSE'
    [ 6 ] Exportar snapshot dos dados para JSON local ('banco_dados_completo.json')
    [ 7 ] Recarregar planilhas da pasta (Reload)
    [ 0 ] Sair

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
import json
import warnings
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd
from dotenv import load_dotenv
from supabase import Client, create_client

warnings.simplefilter("ignore", category=UserWarning)
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("VITE_SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Variáveis de ambiente do Supabase não encontradas no .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

DIRETORIO_ATUAL = Path(__file__).resolve().parent
PASTA_ALVO = DIRETORIO_ATUAL / "PET PSE"


# ===============================================================================
# EXTRAÇÃO E PROCESSAMENTO DE PLANILHAS
# ===============================================================================

def extrair_dados_planilha(caminho_arquivo: Path):
    df = pd.read_excel(caminho_arquivo)

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
    texto = re.sub(r"\s*(?:Emitido\s*Pelo\s*)?Educar\s*WEB\s*$", "", texto, flags=re.IGNORECASE).strip()
    texto = re.sub(r"^Relat[oó]rio\s*", "", texto, flags=re.IGNORECASE).strip()
    return texto


def varrer_arquivos_pastas(diretorio_raiz: Path) -> dict:
    banco_dados = {"escolas": []}

    if not diretorio_raiz.exists():
        print(f"⚠️ Pasta '{diretorio_raiz.name}' não foi encontrada.")
        return banco_dados

    for pasta_atual_str, subpastas, arquivos in os.walk(diretorio_raiz):
        pasta_atual = Path(pasta_atual_str)
        subpastas_com_xlsx = False

        if pasta_atual != diretorio_raiz and subpastas:
            for sub in subpastas:
                caminho_sub = pasta_atual / sub
                if caminho_sub.is_dir():
                    tem_xlsx = any(
                        f.name.endswith(".xlsx") and not f.name.startswith("~$")
                        for f in caminho_sub.iterdir()
                    )
                    if tem_xlsx:
                        subpastas_com_xlsx = True
                        break

        # Regra: se possuir subpastas de nível 2 com xlsx, lê exclusivamente de dentro delas
        if pasta_atual != diretorio_raiz and subpastas_com_xlsx:
            for sub in list(subpastas):
                caminho_sub = pasta_atual / sub
                for item in caminho_sub.iterdir():
                    if item.name.endswith(".xlsx") and not item.name.startswith("~$"):
                        try:
                            data_mod = item.stat().st_mtime
                            nome_escola, turmas = extrair_dados_planilha(item)

                            if not nome_escola or str(nome_escola).strip().lower() in ("nan", "none", ""):
                                continue
                            if not turmas:
                                continue

                            # Regra: em subpastas de nível 2, apenas 1 turma por planilha é aceita
                            if len(turmas) > 1:
                                raise ValueError(
                                    f"Arquivo '{item.name}' contém mais de 1 turma ({len(turmas)} encontradas). "
                                    f"Em subpastas, cada arquivo deve conter apenas uma turma."
                                )

                            if len(turmas) == 1:
                                turmas[0]["nome"] = extrair_nome_turma_arquivo(item.name)

                            escola_existente = next((e for e in banco_dados["escolas"] if e["nome"] == nome_escola), None)
                            if escola_existente:
                                escola_existente["turmas"].extend(turmas)
                                escola_existente["datas_modificacao"].append(data_mod)
                            else:
                                banco_dados["escolas"].append({
                                    "nome": nome_escola,
                                    "turmas": turmas,
                                    "datas_modificacao": [data_mod]
                                })
                        except Exception as e:
                            print(f"Erro em '{item.name}': {e}")
            subpastas.clear()

        # Regra: arquivos soltos na raiz da escola (sem subpastas)
        else:
            for arquivo in arquivos:
                if arquivo.endswith(".xlsx") and not arquivo.startswith("~$"):
                    caminho_arquivo = pasta_atual / arquivo
                    try:
                        data_mod = caminho_arquivo.stat().st_mtime
                        nome_escola, turmas = extrair_dados_planilha(caminho_arquivo)

                        if not nome_escola or str(nome_escola).strip().lower() in ("nan", "none", ""):
                            continue
                        if not turmas:
                            continue

                        # Se tiver 1 turma, adota o nome limpo do arquivo; se tiver mais, preserva o interno
                        if len(turmas) == 1:
                            novo_nome = extrair_nome_turma_arquivo(arquivo)
                            if novo_nome:
                                turmas[0]["nome"] = novo_nome

                        escola_existente = next((e for e in banco_dados["escolas"] if e["nome"] == nome_escola), None)
                        if escola_existente:
                            escola_existente["turmas"].extend(turmas)
                            escola_existente["datas_modificacao"].append(data_mod)
                        else:
                            banco_dados["escolas"].append({
                                "nome": nome_escola,
                                "turmas": turmas,
                                "datas_modificacao": [data_mod]
                            })
                    except Exception as e:
                        print(f"Erro em '{arquivo}': {e}")

    return banco_dados


# ===============================================================================
# SUPABASE E BANCO DE DADOS
# ===============================================================================

def obter_mapa_escolas_banco(supabase_client: Client) -> dict:
    try:
        resposta = supabase_client.table("escolas").select("id, nome").execute()
        return {item["nome"]: item["id"] for item in resposta.data}
    except Exception as e:
        print(f"⚠️ Erro ao consultar tabela 'escolas': {e}")
        return {}


def sincronizar_escolas_tabela_base(banco_processado: dict, supabase_client: Client):
    nomes_escolas = sorted(list({e["nome"] for e in banco_processado["escolas"] if e["nome"]}))
    if not nomes_escolas:
        print("Nenhuma escola identificada nas planilhas para cadastrar.")
        return

    print(f"\nCadastrando {len(nomes_escolas)} escolas na tabela 'escolas'...")
    registros = [{"nome": nome} for nome in nomes_escolas]

    try:
        resposta = supabase_client.table("escolas").upsert(registros, on_conflict="nome").execute()
        print(f"✅ Sucesso: Tabela 'escolas' atualizada com {len(resposta.data)} registro(s).")
    except Exception as e:
        print(f"❌ Erro ao atualizar tabela 'escolas': {e}")


def salvar_escola_turmas_supabase(banco_processado: dict, mapa_escolas: dict, supabase_client: Client):
    registros = []
    turma_id = 101
    aluno_id = 1001
    escolas_sem_id = 0

    for escola in banco_processado["escolas"]:
        nome_escola = escola["nome"]
        escola_id = mapa_escolas.get(nome_escola)

        if not escola_id:
            escolas_sem_id += 1
            print(f"⚠️ Aviso: '{nome_escola}' não encontrada no banco. (Use a opção [ 3 ] para cadastrá-la).")
            continue

        datas_mod = escola.get("datas_modificacao", [])
        if datas_mod:
            timestamp_mais_novo = max(datas_mod)
            data_atualizada_iso = datetime.fromtimestamp(timestamp_mais_novo, tz=timezone.utc).isoformat()
        else:
            data_atualizada_iso = datetime.now(timezone.utc).isoformat()

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
            "dados": {"turmas": turmas_formatadas},
            "atualizado_em": data_atualizada_iso
        })

    if not registros:
        print("Nenhum registro apto para envio.")
        return None

    try:
        resposta = (
            supabase_client.table("escolaturmaalunos")
            .upsert(registros, on_conflict="escola_id")
            .execute()
        )
        print(f"\n✅ Concluído: {len(registros)} escola(s) sincronizada(s) na tabela 'escolaturmaalunos'.")
        if escolas_sem_id > 0:
            print(f"ℹ️ {escolas_sem_id} escola(s) foram ignoradas por ausência de cadastro prévio na tabela 'escolas'.")
        return resposta.data
    except Exception as e:
        print(f"\n❌ Erro ao salvar em 'escolaturmaalunos': {e}")
        return None


# ===============================================================================
# RELATÓRIOS E AUDITORIA LOCAL
# ===============================================================================

def exibir_status_escolas(banco_processado: dict, mapa_escolas: dict):
    print("\n" + "=" * 80)
    print(f"{'STATUS':<12} | {'NOME DA ESCOLA (PLANILHA)':<48} | {'ID NO BANCO'}")
    print("=" * 80)

    escolas_encontradas = 0
    escolas_ausentes = 0

    for escola in sorted(banco_processado["escolas"], key=lambda x: x["nome"]):
        nome = escola["nome"]
        escola_id = mapa_escolas.get(nome)

        if escola_id:
            status = "[PRESENTE]"
            escolas_encontradas += 1
            id_str = str(escola_id)
        else:
            status = "[AUSENTE] "
            escolas_ausentes += 1
            id_str = "--- (Não cadastrada)"

        print(f"{status:<12} | {nome:<48} | {id_str}")

    print("-" * 80)
    print(f"Total lidas: {len(banco_processado['escolas'])} | Presentes: {escolas_encontradas} | Ausentes: {escolas_ausentes}")
    print("=" * 80)


def exibir_turmas_geradas(banco_processado: dict):
    total_turmas = 0
    total_alunos = 0

    print("\n" + "=" * 80)
    print("LISTAGEM DE TURMAS QUE SERÃO GERADAS")
    print("=" * 80)

    for escola in sorted(banco_processado["escolas"], key=lambda x: x["nome"]):
        print(f"\nEscola: {escola['nome']}")
        turmas = escola.get("turmas", [])
        if not turmas:
            print("    (Nenhuma turma encontrada)")
            continue

        for idx, turma in enumerate(turmas, start=1):
            qtd = len(turma.get("alunos", []))
            print(f"   [{idx:02d}] Turma: \"{turma['nome']}\" — ({qtd} alunos)")
            total_turmas += 1
            total_alunos += qtd

    print("\n" + "-" * 80)
    print(f"Totais gerais: {total_turmas} turma(s) e {total_alunos} aluno(s).")
    print("=" * 80)


def auditar_estrutura_pastas(pasta_base: Path):
    if not pasta_base.exists() or not pasta_base.is_dir():
        print(f"❌ A pasta '{pasta_base.name}' não foi encontrada.")
        return

    print("\n" + "=" * 70)
    print(f"📂 Auditoria de Diretórios: {pasta_base.resolve()}")
    print("=" * 70)

    subpastas_nv1 = [p for p in pasta_base.iterdir() if p.is_dir()]
    if not subpastas_nv1:
        print("Nenhuma subpasta encontrada dentro de 'PET PSE'.")
        return

    com_subpastas = 0
    for sub in sorted(subpastas_nv1):
        internas = [p for p in sub.iterdir() if p.is_dir()]
        print(f"\n📁 {sub.name}")
        if internas:
            com_subpastas += 1
            print(f"   └─ ⚠️  Possui {len(internas)} subpasta(s) aninhada(s):")
            for sub_in in sorted(internas):
                print(f"       ├── 📂 {sub_in.name}")
        else:
            print("   └─ ℹ️  Estrutura direta (sem subpastas internas).")

    print("\n" + "-" * 70)
    print(f"Total de escolas avaliadas: {len(subpastas_nv1)}")
    print(f"Escolas com subpastas internas: {com_subpastas}")
    print("=" * 70)


def exportar_json_local(banco_processado: dict):
    escola_id = 1
    turma_id = 101
    aluno_id = 1001
    escolas_formatadas = []

    for escola in banco_processado["escolas"]:
        escola_formatada = {"id": escola_id, "nome": escola["nome"], "turmas": []}
        escola_id += 1

        for turma in escola["turmas"]:
            turma_formatada = {"id": turma_id, "nome": turma["nome"], "alunos": []}
            turma_id += 1

            for aluno in turma["alunos"]:
                turma_formatada["alunos"].append({
                    "id": aluno_id,
                    "nome": aluno["nome"],
                    "dataNascimento": aluno["dataNascimento"]
                })
                aluno_id += 1

            escola_formatada["turmas"].append(turma_formatada)
        escolas_formatadas.append(escola_formatada)

    saida = DIRETORIO_ATUAL / "banco_dados_completo.json"
    try:
        with open(saida, "w", encoding="utf-8") as f:
            json.dump({"escolas": escolas_formatadas}, f, indent=4, ensure_ascii=False)
        print(f"\nSnapshot salvo com sucesso em: {saida}")
    except Exception as e:
        print(f"\nErro ao salvar arquivo JSON: {e}")


# ===============================================================================
# INTERFACE DO MENU
# ===============================================================================

def menu():
    print(f"\n[1/2] Lendo planilhas na pasta '{PASTA_ALVO.name}'...")
    banco_processado = varrer_arquivos_pastas(PASTA_ALVO)
    print(f"-> {len(banco_processado['escolas'])} escola(s) processada(s).")

    print("[2/2] Consultando IDs da tabela 'escolas' no Supabase...")
    mapa_escolas = obter_mapa_escolas_banco(supabase)
    print(f"-> {len(mapa_escolas)} escola(s) registradas no banco.")

    while True:
        print("\n" + "=" * 65)
        print("          PAINEL DE SINCRONIZAÇÃO - PET PSE")
        print("=" * 65)
        print("[ 1 ] Enviar turmas e alunos para 'escolaturmaalunos'")
        print("[ 2 ] Ver status das escolas (Planilhas vs Banco)")
        print("[ 3 ] Cadastrar escolas ausentes na tabela 'escolas' (Seed)")
        print("[ 4 ] Ver nomes de todas as turmas que serão geradas")
        print("[ 5 ] Auditar estrutura de pastas da pasta 'PET PSE'")
        print("[ 6 ] Exportar snapshot dos dados para JSON local")
        print("[ 7 ] Recarregar planilhas da pasta (Reload)")
        print("[ 0 ] Sair")
        print("=" * 65)

        opcao = input("Selecione uma opção: ").strip()

        if opcao == "1":
            conf = input("\nDeseja realmente sincronizar com o Supabase? (s/n): ").strip().lower()
            if conf == "s":
                salvar_escola_turmas_supabase(banco_processado, mapa_escolas, supabase)
            else:
                print("Operação cancelada.")

        elif opcao == "2":
            exibir_status_escolas(banco_processado, mapa_escolas)

        elif opcao == "3":
            conf = input("\nDeseja cadastrar as escolas faltantes no Supabase? (s/n): ").strip().lower()
            if conf == "s":
                sincronizar_escolas_tabela_base(banco_processado, supabase)
                mapa_escolas = obter_mapa_escolas_banco(supabase)
            else:
                print("Operação cancelada.")

        elif opcao == "4":
            exibir_turmas_geradas(banco_processado)

        elif opcao == "5":
            auditar_estrutura_pastas(PASTA_ALVO)

        elif opcao == "6":
            exportar_json_local(banco_processado)

        elif opcao == "7":
            print(f"\nRecarregando dados da pasta '{PASTA_ALVO.name}'...")
            banco_processado = varrer_arquivos_pastas(PASTA_ALVO)
            mapa_escolas = obter_mapa_escolas_banco(supabase)
            print("Dados recarregados em memória!")

        elif opcao == "0":
            print("\nFinalizando programa. Até mais!")
            break

        else:
            print("\nOpção inválida! Escolha um número de 0 a 7.")


if __name__ == "__main__":
    menu()