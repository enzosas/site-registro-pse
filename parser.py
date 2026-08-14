# Arquivo python que le uma pasta com as subpastas das escolas contendo os xlsx das turmas
# Para usar, coloque esse arquivo no mesmo diretorio da pasta principal e altere os nomes de caminho

import pandas as pd
import json
import os
import warnings
import re

warnings.simplefilter("ignore", category=UserWarning)
diretorio_atual = os.path.dirname(os.path.abspath(__file__))

# anotacoes das posicoes
# coluna 5 = nomes
# coluna 12 = datanasc
# coluna 14 = nome escola

# funcao que extrai os dados de uma unica planilha
def extrair_dados_planilha(caminho):
    df = pd.read_excel(caminho)

    # le nome da escola e o ano e aplica formatacao
    nome_escola = str(df['Unnamed: 14'][0]).strip().title()
    ano = int(df['Unnamed: 27'][2])

    # transforma colunas do pandas em listas
    nomes = df['Unnamed: 5'].tolist()
    datas = df['Unnamed: 12'].tolist()
    turmas_raw = df['Unnamed: 1'].tolist()

    conjunto_turmas = []
    turma_atual = []
    nome_turma_atual = ""
    nome_turma_lista = ""

    # agrupa valores da mesma linha e itera sobre eles
    for nome, data, turma_info in zip(nomes, datas, turmas_raw):
        
        # procura e atualiza o nome da turma quando encontra a palavra serie
        if pd.notna(turma_info):
            turma_info_str = str(turma_info).strip()
            if "Série:" in turma_info_str:
                nome_turma_atual = turma_info_str.replace("Série:", "").strip()

        # pula celulas sem nome de aluno
        if pd.isna(nome):
            continue
            
        nome_str = str(nome).strip()
        
        # salva a turma atual quando chega no cabecalho do proximo lote
        if nome_str == 'Nome':
            if turma_atual:
                conjunto_turmas.append({
                    "nome": f"{nome_turma_lista}".title(),
                    "alunos": turma_atual
                })
            # limpa a lista para os proximos alunos
            turma_atual = []
            nome_turma_lista = nome_turma_atual
        else:
            # extrai a string da data e cria dicionario do aluno
            data_str = str(data).strip()[:10] if not pd.isna(data) else ""
            
            aluno = {
                "nome": nome_str.title(),
                "dataNascimento": data_str
            }
            turma_atual.append(aluno)

    # garante que o ultimo lote lido tambem seja salvo
    if turma_atual:
        conjunto_turmas.append({
            "nome": f"{nome_turma_lista}".title(),
            "alunos": turma_atual
        })

    return nome_escola, conjunto_turmas

# funcao que pega o nome de um arquivo de planilha e retorna de que turma se trata
def extrair_nome_turma_arquivo(nome_arquivo: str) -> str:
    # 1. Remove a extensão .xlsx se houver
    texto = re.sub(r"\.xlsx$", "", nome_arquivo, flags=re.IGNORECASE).strip()

    # 2. Remove sufixos de download/cópia como (1), (2), (copia), etc., no final
    texto = re.sub(r"\s*\(\d+\)\s*$", "", texto).strip()

    # 3. Remove o sufixo final 'EducarWEB' (com ou sem espaços antes)
    texto = re.sub(r"\s*EducarWEB\s*$", "", texto, flags=re.IGNORECASE).strip()

    # 4. Padrão: remove o prefixo 'Relatorio ...'
    # Se houver hífen (ex: "Relatorio Edcu. Infantil - Pré-escola..."), pega o que vem após o hífen
    if " - " in texto:
        texto = texto.split(" - ", 1)[1]
    else:
        # Se não houver hífen, remove prefixos conhecidos como 'Relatorio Anos Finais', 'Relatorio Anos Iniciais', etc.
        texto = re.sub(
            r"^Relatorio\s+(?:Anos\s+Finais|Anos\s+Iniciais|Ensino\s+Fundamental|Educ[a-z\.\s]+)?",
            "",
            texto,
            flags=re.IGNORECASE,
        )

    return texto.strip()


# funcao que varre os arquivos e une os dados
def processar_todas_pastas(diretorio_raiz):
    # cria objeto base do relatorio
    banco_dados = {"escolas": []}
    
    # percorre a arvore de pastas
    for pasta_atual, subpastas, arquivos in os.walk(diretorio_raiz):

        # CASO 1: Subpasta de nivel 1 contem outras subpastas (nivel 2)
        if pasta_atual != diretorio_raiz and subpastas:
            for sub in list(subpastas):
                caminho_sub = os.path.join(pasta_atual, sub)

                # Busca todos os xlsx dentro da subpasta de nivel 2
                for item in os.listdir(caminho_sub):
                    if item.endswith(".xlsx") and not item.startswith("~$"):
                        caminho_arquivo = os.path.join(caminho_sub, item)

                        try:
                            nome_escola, turmas_extraidas = (
                                extrair_dados_planilha(caminho_arquivo)
                            )

                            # Validacao: deve conter no maximo 1 turma
                            if len(turmas_extraidas) > 1:
                                raise ValueError(
                                    f"Arquivo '{item}' contem mais de uma turma ({len(turmas_extraidas)} encontradas)."
                                )

                            if len(turmas_extraidas) == 1:
                                # Altera o nome da turma para o nome extraido do arquivo
                                novo_nome_turma = extrair_nome_turma_arquivo(item)
                                turmas_extraidas[0]["nome"] = novo_nome_turma

                                # Agrupa a escola no banco de dados
                                escola_existente = next((e for e in banco_dados["escolas"] if e["nome"] == nome_escola),None)

                                if escola_existente:
                                    escola_existente["turmas"].extend(turmas_extraidas)
                                else:
                                    banco_dados["escolas"].append(
                                        {
                                            "nome": nome_escola,
                                            "turmas": turmas_extraidas,
                                        }
                                    )

                        except Exception as e:
                            print(
                                f"Erro ao processar '{item}' na subpasta '{sub}': {e}"
                            )

            # Limpa as subpastas para que o os.walk nao repita a leitura delas
            subpastas.clear()

        # CASO 2: Subpasta normal sem subpastas aninhadas
        else:
            for arquivo in arquivos:
                # filtra para ler apenas planilhas validas e ignorar temporarios
                if arquivo.endswith('.xlsx') and not arquivo.startswith('~$'):
                    caminho_completo = os.path.join(pasta_atual, arquivo)
                    
                    try:
                        # extrai info do arquivo
                        nome_escola, turmas_extraidas = extrair_dados_planilha(caminho_completo)
                        
                        # verifica se a escola ja existe na lista
                        escola_existente = next((e for e in banco_dados["escolas"] if e["nome"] == nome_escola), None)
                        
                        # apenas insere as turmas na escola se ela ja existir
                        if escola_existente:
                            escola_existente["turmas"].extend(turmas_extraidas)
                        else:
                            # senao cria o bloco da escola nova
                            banco_dados["escolas"].append({
                                "nome": nome_escola,
                                "turmas": turmas_extraidas
                            })
                            
                    except Exception as e:
                        nome_pasta = os.path.basename(pasta_atual)
                        print(f"erro ao processar '{arquivo}' na pasta '{nome_pasta}': {e}")
        
        
        
        
        
        
        


    # define identificadores iniciais
    escola_id = 1
    turma_id = 101
    aluno_id = 1001
    escolas_formatadas = []

    # constroi modelo final aplicando ids unicos e sequenciais
    for escola in banco_dados["escolas"]:
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

    # empacota
    resultado_final = {"escolas": escolas_formatadas}
    
    # define o caminho de saida do json na pasta raiz e salva o arquivo
    caminho_saida = os.path.join(diretorio_atual, "banco_dados_completo.json")
    with open(caminho_saida, 'w', encoding='utf-8') as f:
        json.dump(resultado_final, f, indent=4, ensure_ascii=False)
        
    print(f"arquivo unico salvo com sucesso em: {caminho_saida}")


# define as variaveis e executa
pasta_alvo = os.path.join(diretorio_atual, "PET PSE")
processar_todas_pastas(pasta_alvo)