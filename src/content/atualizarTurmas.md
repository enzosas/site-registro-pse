### Como as Pastas Devem Estar Organizadas

Ao baixar a pasta de relatórios do Google Drive, ela virá no formato compactado (**.ZIP**). Antes de enviar, certifique-se de que os arquivos no Drive seguem um dos dois modelos comuns de organização:

* **Organização Direta (Modelo Padrão):**
  * A pasta traz o nome da escola e as planilhas das turmas estão guardadas diretamente dentro dela.
  * *Exemplo:*  
    Pasta `EMEF Adelmo Simas Genro` contendo o arquivo `Relatorio 1º Ano EducarWEB.xlsx`.

* **Organização com Subpastas (Por Turno ou Etapa):**
  * Em escolas maiores, a pasta da escola pode conter divisões internas (como `Manhã`, `Tarde`, `Educação Infantil`, `Anos Iniciais` ou `Turmas`), e as planilhas ficam dentro dessas subdivisões.
  * *Exemplo:*  
    Pasta `EMEF Bernardino Fernandes` > subpasta `Anos Iniciais` > arquivo `Relatorio 2º Ano EducarWEB.xlsx`.

### O Que Conferir nos Arquivos

* **Formato das Planilhas (.xlsx):**  
  O sistema reconhece apenas relatórios modernos gerados pelo **EducarWEB** (arquivos terminados em `.xlsx`). Documentos em PDF, fotos ou arquivos temporários não serão lidos.

* **Arquivos em Subpastas:**  
  * Caso a pasta de uma escola possua subpastas por turno ou etapa, o leitor processará **somente** os relatórios que estiverem dentro dessas divisões (arquivos que ficarem soltos fora das subpastas serão desconsiderados).
  * **Importante:** Em subpastas, cada arquivo deve conter os dados de **apenas 1 turma**. Se um mesmo arquivo dentro de uma subpasta trouxer várias turmas agrupadas, essa planilha específica será ignorada pelo leitor (as demais planilhas continuarão sendo lidas normalmente).

* **Nomes das Turmas e Escolas:**  
  Não é necessário renomear nada manualmente. O sistema identifica a escola pelo cabeçalho do relatório. Para as turmas, se o arquivo conter mais de uma turma, o nome de cada uma das turmas será o que aparece dentro do arquivo, como `5° ANO`. Se o arquivo está dentro de uma subpasta, o nome que a turma irá receber será o nome do arquivo, no qual o sistema faz a limpeza de termos como *"Relatório"*, *"EducarWEB"* ou marcações de cópia

* **Impacto nas Turmas Já Cadastradas:**  
  Apenas as escolas que apresentarem mudanças nas planilhas terão seus dados atualizados. Se uma turma antiga deixou de existir nos novos relatórios baixados do Drive, ela será substituída pela estrutura atualizada. Todas as avaliações e registros já realizados no passado continuam preservados no sistema com total segurança.