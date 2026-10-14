### Estrutura de Pastas Esperada

A pasta **PET PSE** (ou o arquivo compactado) pode seguir um dos dois formatos abaixo:

* **1. Organização direta por escola (Recomendado):**
  * Uma pasta para cada escola contendo os arquivos `.xlsx` soltos diretamente dentro dela.
* **2. Organização com subpastas (Turnos ou Etapas):**
  * Dentro da pasta da escola, pastas de etapas (ex: *Anos Iniciais*, *Educação Infantil*) contendo os relatórios das turmas.

### Regras e Comportamento dos Arquivos

* **Formato:** Apenas planilhas `.xlsx` geradas pelo sistema **EducarWEB**. Arquivos de outros formatos são ignorados automaticamente.
* **Atenção às subpastas:** Se a pasta de uma escola contiver subpastas, o leitor processará **exclusivamente** os arquivos dessas subpastas. Planilhas soltas na raiz dessa escola serão desconsideradas.
* **Nome das Turmas:**
  * **Planilhas com 1 turma:** O nome da turma é extraído e limpo a partir do nome do arquivo (removendo *Relatório*, *EducarWEB*, cópias e extensões).
  * **Planilhas com múltiplas turmas:** Se estiverem na raiz da escola, os nomes originais de cada turma (`Série: ...`) são preservados.
* **Cadastro de Escolas:** O nome da escola no cabeçalho da planilha será verificado e sincronizado com a tabela de escolas no banco.