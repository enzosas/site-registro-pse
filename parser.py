import pandas as pd
import json

def pse_xlsx_to_json(caminho):
    df = pd.read_excel(caminho)

    nome_escola = str(df['Unnamed: 14'][0]).strip().title()
    ano = int(df['Unnamed: 27'][2])

    nomes = df['Unnamed: 5'].tolist()
    datas = df['Unnamed: 12'].tolist()
    turmas_raw = df['Unnamed: 1'].tolist()

    conjunto_turmas = []
    turma_atual = []
    nome_turma_atual = ""
    nome_turma_lista = ""
    
    turma_id = 1
    aluno_id = 1

    for nome, data, turma_info in zip(nomes, datas, turmas_raw):
        if pd.notna(turma_info):
            turma_info_str = str(turma_info).strip()
            if "Série:" in turma_info_str:
                nome_turma_atual = turma_info_str

        if pd.isna(nome):
            continue
            
        nome_str = str(nome).strip()
        
        if nome_str == 'Nome':
            if turma_atual:
                conjunto_turmas.append({
                    "id": turma_id,
                    "nome": f"{nome_turma_lista} {ano}".title(),
                    "alunos": turma_atual
                })
                turma_id += 1
            turma_atual = []
            nome_turma_lista = nome_turma_atual
        else:
            data_str = str(data).strip()[:10] if not pd.isna(data) else ""
            
            aluno = {
                "id": aluno_id,
                "nome": nome_str.title(),
                "dataNascimento": data_str
            }
            aluno_id += 1
            turma_atual.append(aluno)

    if turma_atual:
        conjunto_turmas.append({
            "id": turma_id,
            "nome": f"{nome_turma_lista} {ano}".title(),
            "alunos": turma_atual
        })

    resultado = {
        "nome": nome_escola,
        "turmas": conjunto_turmas
    }

    return json.dumps(resultado, indent=4, ensure_ascii=False)

caminho_arquivo = r"c:\Users\enzos\OneDrive\Área de Trabalho\Relatorio Anos Iniciais EducarWEB.xlsx"
resultado_json = pse_xlsx_to_json(caminho_arquivo)
print(resultado_json)