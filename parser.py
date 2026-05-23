import pandas as pd
import json
import os
import warnings

warnings.simplefilter("ignore", category=UserWarning)

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
                nome_turma_atual = turma_info_str

        # pula celulas sem nome de aluno
        if pd.isna(nome):
            continue
            
        nome_str = str(nome).strip()
        
        # salva a turma atual quando chega no cabecalho do proximo lote
        if nome_str == 'Nome':
            if turma_atual:
                conjunto_turmas.append({
                    "nome": f"{nome_turma_lista} {ano}".title(),
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
            "nome": f"{nome_turma_lista} {ano}".title(),
            "alunos": turma_atual
        })

    return nome_escola, conjunto_turmas


# funcao que varre os arquivos e une os dados
def processar_todas_pastas(diretorio_raiz):
    # cria objeto base do relatorio
    banco_dados = {"escolas": []}
    
    # percorre a arvore de pastas
    for pasta_atual, subpastas, arquivos in os.walk(diretorio_raiz):
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
    caminho_saida = os.path.join(diretorio_raiz, "banco_dados_completo.json")
    with open(caminho_saida, 'w', encoding='utf-8') as f:
        json.dump(resultado_final, f, indent=4, ensure_ascii=False)
        
    print(f"arquivo unico salvo com sucesso em: {caminho_saida}")


# define as variaveis e executa
pasta_pet_pse = r"c:\Users\enzos\OneDrive\Área de Trabalho\PET PSE"
processar_todas_pastas(pasta_pet_pse)