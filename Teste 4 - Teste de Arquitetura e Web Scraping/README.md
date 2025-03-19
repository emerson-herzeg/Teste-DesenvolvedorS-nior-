
## Teste de Arquitetura e Web Scraping: Solução Proposta

**Visão Geral da Arquitetura Proposta:**

Propomos uma arquitetura baseada em microsserviços executados em nuvem, utilizando serviços gerenciados para minimizar a sobrecarga operacional e otimizar custos. A arquitetura será assíncrona e orientada a eventos para garantir escalabilidade e resiliência.

**Parte 1: Definição da Arquitetura**

* **Servidores Necessários:**
    * **Orquestrador/Scheduler:** Responsável por agendar e gerenciar a execução das tarefas de scraping e processamento.
    * **Scrapers (Workers):** Responsáveis por navegar nos sites, realizar login, resolver captchas, preencher formulários, paginar e baixar os PDFs. Serão executados sob demanda e em paralelo.
    * **Processadores de PDF (Workers):** Responsáveis por receber os PDFs baixados, convertê-los para texto e iniciar a extração de dados. Serão executados sob demanda e em paralelo.
    * **Extratores de Dados (Workers):** Responsáveis por receber o texto dos PDFs e aplicar algoritmos de reconhecimento de nomes e documentos. Serão executados sob demanda e em paralelo.
    * **API (Opcional):** Uma API para monitoramento, controle e consulta dos dados extraídos.
    * **Banco de Dados:** Para armazenar os metadados dos PDFs, os dados extraídos e a relação entre eles.
    * **Cache:** Para armazenar dados temporários, como sessões de login, resultados de captchas resolvidos e trechos de texto frequentemente acessados.
    * **Filas de Mensagens:** Para comunicação assíncrona entre os componentes, garantindo a resiliência do sistema.

* **Infraestrutura (Cloud vs. On-Premises):**
    * **Escolha:** Cloud (preferencialmente AWS, Google Cloud Platform ou Azure).
    * **Justificativa:**
        * **Escalabilidade Elástica:** A capacidade de escalar recursos (servidores, armazenamento, etc.) automaticamente de acordo com a demanda é crucial para processar milhões de documentos sem custos fixos elevados.
        * **Serviços Gerenciados:** A utilização de serviços gerenciados para banco de dados, filas de mensagens, cache e orquestração reduz a necessidade de gerenciamento manual da infraestrutura, diminuindo custos operacionais e a complexidade.
        * **Pay-as-you-go:** O modelo de pagamento por uso da nuvem permite otimizar custos, pagando apenas pelos recursos consumidos.
        * **Disponibilidade e Confiabilidade:** Os provedores de nuvem oferecem infraestrutura altamente disponível e resiliente.

* **Estratégia para Escalabilidade e Paralelismo:**
    * **Containerização (Docker):** Empacotar cada componente (Scrapers, Processadores, Extratores) em containers Docker permite fácil escalabilidade e portabilidade.
    * **Orquestração de Contêineres (Kubernetes ou AWS ECS/Fargate, GCP Cloud Run, Azure Container Instances):** Gerenciar a implantação, escalabilidade e orquestração dos containers de forma automatizada. O Fargate/Cloud Run/Container Instances são especialmente interessantes para minimizar o gerenciamento de servidores.
    * **Filas de Mensagens (AWS SQS, Google Cloud Pub/Sub, Azure Service Bus):** Utilizar filas para desacoplar os componentes. Por exemplo, os Scrapers depositam os PDFs baixados em uma fila, e os Processadores de PDF consomem dessa fila. Isso permite que cada componente escale independentemente e garante que as tarefas não sejam perdidas em caso de falha.
    * **Funções Serverless (AWS Lambda, Google Cloud Functions, Azure Functions):** Para tarefas pontuais e com picos de demanda, como a execução de um script específico de extração ou a resolução de um captcha, funções serverless podem ser uma opção extremamente econômica.
    * **Paralelismo:** Executar múltiplas instâncias dos Scrapers, Processadores e Extratores em paralelo para processar um grande volume de documentos simultaneamente.

* **Mecanismo de Balanceamento de Carga e Recuperação de Falhas:**
    * **Balanceamento de Carga:** Utilizar load balancers fornecidos pelo provedor de nuvem para distribuir o tráfego entre as múltiplas instâncias dos Scrapers e da API (se houver).
    * **Recuperação de Falhas:**
        * **Retries:** Implementar mecanismos de retry para tarefas que falham devido a problemas temporários (ex: falha na rede, timeout).
        * **Dead Letter Queues (DLQ):** Configurar DLQs para as filas de mensagens. Mensagens que não puderem ser processadas após várias tentativas são movidas para a DLQ para análise posterior.
        * **Monitoramento e Alertas:** Implementar um sistema de monitoramento robusto para identificar falhas e alertar a equipe de desenvolvimento.
        * **Infraestrutura Resiliente:** Utilizar os recursos de alta disponibilidade oferecidos pelo provedor de nuvem (múltiplas zonas de disponibilidade).

**Parte 2: Tecnologias e Ferramentas**

* **Linguagens:**
    * **Python:** Linguagem versátil e com vasta gama de bibliotecas para web scraping, processamento de PDFs e análise de texto. É uma escolha popular e eficiente para este tipo de tarefa.

* **Bibliotecas:**
    * **Web Scraping:**
        * **Selenium ou Playwright:** Para automação de navegadores, essencial para lidar com login, captchas, formulários e paginação dinâmica. Playwright é uma alternativa moderna e geralmente mais performática.
        * **Requests:** Para realizar requisições HTTP de forma eficiente quando a automação completa do navegador não é necessária.
        * **Beautiful Soup ou lxml:** Para parsing de HTML e XML, facilitando a navegação e extração de informações das páginas web.
    * **Processamento de PDF:**
        * **PyPDF2 ou pdfminer.six:** Para extrair o texto dos arquivos PDF. `pdfminer.six` tende a ser mais robusto para PDFs complexos.
        * **Tesseract OCR (com pytesseract):** Caso os PDFs contenham imagens de texto, será necessário utilizar OCR para converter as imagens em texto.
    * **Extração de Nomes e Documentos:**
        * **spaCy ou NLTK:** Bibliotecas de Processamento de Linguagem Natural (PLN) com modelos pré-treinados para reconhecimento de entidades nomeadas (NER), incluindo nomes próprios e potencialmente alguns tipos de documentos.
        * **Expressões Regulares (Regex):** Para identificar padrões específicos de documentos (CPF, CNPJ, RG, Passaporte) que podem não ser reconhecidos diretamente pelas bibliotecas de PLN.
    * **Outras:**
        * **Celery ou RQ:** Para gerenciamento de tarefas assíncronas e filas de trabalho (se não utilizar serviços de fila de mensagens da nuvem diretamente).

* **Banco de Dados (para buscas eficientes):**
    * **PostgreSQL:** Um banco de dados relacional robusto, open-source e com excelentes recursos para indexação e consultas complexas. Suporta extensões para busca textual completa (`pg_trgm` para buscas aproximadas).
    * **Opção (para grandes volumes e buscas textuais complexas):** Elasticsearch. Um motor de busca e análise distribuído, ideal para buscas rápidas e relevantes em grandes volumes de texto. Pode ser combinado com o PostgreSQL para armazenar os dados estruturados.

* **Armazenamento:**
    * **Cloud Object Storage (AWS S3, Google Cloud Storage, Azure Blob Storage):** Para armazenar os arquivos PDF originais de forma escalável e econômica.

* **Cache:**
    * **Redis ou Memcached:** Servidores de cache em memória para armazenar dados frequentemente acessados, como resultados de captchas resolvidos, sessões de login e trechos de texto processados recentemente.

* **Monitoramento:**
    * **Serviços de Monitoramento da Nuvem (AWS CloudWatch, Google Cloud Monitoring, Azure Monitor):** Para monitorar métricas de desempenho, logs e alertas do sistema.
    * **ELK Stack (Elasticsearch, Logstash, Kibana) ou Grafana:** Para centralização, análise e visualização de logs e métricas.
    * **Sentry ou similar:** Para rastreamento de erros e relatórios de exceções.

**Parte 3: Modelagem do Banco de Dados**

Considerando o PostgreSQL como banco de dados principal:

* **Tabelas:**
    * **`pdfs`:**
        * `id` (UUID, Primary Key)
        * `url_origem` (VARCHAR, Index)
        * `nome_arquivo` (VARCHAR)
        * `data_download` (TIMESTAMP WITH TIME ZONE)
        * `status_processamento` (VARCHAR) - Ex: 'baixado', 'convertido', 'extraido', 'erro'
        * `caminho_armazenamento` (VARCHAR) - Referência ao arquivo no Object Storage
        * `texto_extraido` (TEXT) - O texto completo extraído do PDF (pode ser opcional dependendo da necessidade de buscas no texto completo).
    * **`nomes`:**
        * `id` (UUID, Primary Key)
        * `nome` (VARCHAR, Index)
    * **`documentos`:**
        * `id` (UUID, Primary Key)
        * `tipo_documento` (VARCHAR) - Ex: 'CPF', 'CNPJ', 'RG', 'Passaporte'
        * `numero_documento` (VARCHAR, Index)
    * **`pdf_nomes` (Tabela de Junção):**
        * `id` (UUID, Primary Key)
        * `pdf_id` (UUID, Foreign Key references `pdfs`)
        * `nome_id` (UUID, Foreign Key references `nomes`)
        * `contexto_extracao` (TEXT) - Trecho do texto onde o nome foi encontrado.
        * `confianca` (NUMERIC) - Nível de confiança na identificação do nome.
        * `data_extracao` (TIMESTAMP WITH TIME ZONE)
        * `UNIQUE (pdf_id, nome_id)`
    * **`pdf_documentos` (Tabela de Junção):**
        * `id` (UUID, Primary Key)
        * `pdf_id` (UUID, Foreign Key references `pdfs`)
        * `documento_id` (UUID, Foreign Key references `documentos`)
        * `contexto_extracao` (TEXT) - Trecho do texto onde o documento foi encontrado.
        * `confianca` (NUMERIC) - Nível de confiança na identificação do documento.
        * `data_extracao` (TIMESTAMP WITH TIME ZONE)
        * `UNIQUE (pdf_id, documento_id)`

* **Otimização para Consultas Rápidas:**
    * **Indexação:** Criar índices nas colunas frequentemente utilizadas em consultas (ex: `url_origem` em `pdfs`, `nome` em `nomes`, `numero_documento` em `documentos`, `pdf_id` e `nome_id` em `pdf_nomes`, `pdf_id` e `documento_id` em `pdf_documentos`).
    * **Particionamento de Tabelas:** Para tabelas muito grandes (como `pdfs` ou as tabelas de junção), considerar o particionamento por data de download ou outro critério relevante para melhorar o desempenho das consultas.
    * **Busca Textual Completa:** Utilizar recursos de busca textual completa do PostgreSQL (como `tsvector` e `tsquery`) na coluna `texto_extraido` da tabela `pdfs` se a busca por conteúdo dentro dos PDFs for necessária.

* **Como Garantir Integridade e Consistência dos Dados:**
    * **Chaves Primárias e Estrangeiras:** Utilizar chaves primárias para identificar univocamente cada registro e chaves estrangeiras para garantir a integridade referencial entre as tabelas.
    * **Constraints (UNIQUE, NOT NULL):** Definir constraints para garantir que os dados sigam as regras de negócio (ex: um mesmo PDF não deve ter o mesmo nome associado várias vezes, a URL de origem não pode ser nula).
    * **Transações:** Utilizar transações para agrupar operações de banco de dados relacionadas e garantir que todas sejam concluídas com sucesso ou nenhuma seja aplicada, mantendo a consistência dos dados.

**Parte 4: Associação de Nomes e Documentos**

Para associar nomes e documentos, considerando que nem sempre estão explicitamente vinculados, podemos utilizar uma abordagem baseada em contexto e probabilidade:

1.  **Análise de Proximidade:** Durante a extração, registrar a posição (ou pelo menos o parágrafo/sentença) onde cada nome e documento é encontrado no texto do PDF. Nomes e documentos que aparecem próximos um do outro têm maior probabilidade de estarem relacionados.

2.  **Análise de Co-ocorrência:** Registrar se um nome e um documento aparecem na mesma frase ou parágrafo. A co-ocorrência aumenta a probabilidade de relacionamento.

3.  **Padrões Linguísticos:** Utilizar expressões regulares e, idealmente, análise sintática para identificar padrões linguísticos que indicam uma relação. Por exemplo:
    * "CPF de [Nome]: [Número do CPF]"
    * "[Nome], portador(a) do RG nº [Número do RG]"
    * "CNPJ da empresa [Nome da Empresa]: [Número do CNPJ]"

4.  **Atribuição de Pontuação/Confiança:** Atribuir uma pontuação de confiança para cada possível associação com base nos critérios acima. Associações com maior proximidade, co-ocorrência e correspondência a padrões linguísticos recebem pontuações mais altas.

5.  **Algoritmos de Machine Learning (Opcional, para maior precisão):** Para cenários mais complexos, treinar um modelo de aprendizado de máquina (ex: um classificador) utilizando dados anotados para prever se um nome e um documento estão relacionados com base em diversas características contextuais.

**Como Garantir que um CPF ou CNPJ Encontrado no Texto Realmente Pertence a um Nome Extraído:**

* **Priorizar Padrões Explícitos:** Se um padrão explícito como "CPF de [Nome]: [Número do CPF]" for encontrado, a associação é considerada de alta confiança.
* **Contexto Imediato:** Se um CPF ou CNPJ aparece imediatamente após um nome em um contexto que sugere posse ou identificação, a confiança na associação é alta.
* **Evitar Associações Ambíguas:** Se múltiplos nomes e documentos aparecem na mesma proximidade sem um contexto claro, pode ser necessário registrar essas possíveis associações com um nível de confiança mais baixo ou até mesmo separadamente para revisão humana posterior.
* **Validar Formatos:** Verificar se o formato do texto extraído corresponde ao formato esperado para cada tipo de documento (ex: número de dígitos para CPF, CNPJ, etc.). Isso ajuda a evitar falsos positivos.

**Parte 5: Estratégia para Baixo Custo**

* **Minimizar Custos com Servidores:**
    * **Utilizar Serviços Serverless:** Para tarefas como processamento de PDFs e extração de dados, funções serverless (Lambda, Cloud Functions, Azure Functions) podem ser muito econômicas, pois você paga apenas pelo tempo de computação utilizado.
    * **Utilizar Instâncias Spot/Preemptivas:** Para as instâncias EC2/Compute Engine/VMs que executam os Scrapers e outros workers, utilizar instâncias spot (AWS) ou preemptivas (GCP) pode reduzir significativamente os custos, embora haja o risco de serem interrompidas. Essas instâncias são ideais para tarefas tolerantes a falhas e que podem ser reiniciadas.
    * **Autoscaling Eficiente:** Configurar o autoscaling para escalar os recursos apenas quando necessário e reduzir a capacidade ociosamente.
    * **Right-Sizing:** Monitorar o uso dos recursos e ajustar o tamanho das instâncias para corresponder à demanda real, evitando o provisionamento excessivo.

* **Evitar Desperdício de Processamento:**
    * **Otimizar a Lógica de Scraping:** Ser eficiente nas requisições aos sites, evitando baixar conteúdo desnecessário e respeitando as políticas de `robots.txt`.
    * **Processamento Incremental:** Se possível, processar apenas os PDFs novos ou modificados, em vez de reprocessar todos os documentos.
    * **Caching Estratégico:** Utilizar o cache para armazenar resultados de tarefas repetitivas (ex: resolução de captchas para o mesmo site) e evitar recomputação.
    * **Paralelismo Otimizado:** Ajustar o nível de paralelismo para encontrar o equilíbrio entre velocidade de processamento e custos, evitando sobrecarregar os recursos.

* **Evitar Armazenamento Desnecessário:**
    * **Compactação de PDFs:** Considerar a compactação dos arquivos PDF antes de armazená-los no Object Storage para reduzir os custos de armazenamento.
    * **Política de Retenção de Dados:** Definir políticas de retenção para os dados extraídos e os PDFs originais, excluindo dados que não são mais necessários.
    * **Armazenamento em Camadas:** Se o acesso aos PDFs originais for raro após o processamento, considerar mover para camadas de armazenamento mais frias e mais baratas (ex: AWS S3 Glacier, Google Cloud Archive Storage, Azure Archive Storage).

* **Utilizar Soluções Open-Source Quando Possível:**
    * Priorizar linguagens (Python), bibliotecas (Selenium, Beautiful Soup, PyPDF2, spaCy), banco de dados (PostgreSQL) e ferramentas de monitoramento (ELK Stack, Grafana) de código aberto para evitar custos de licenciamento.
    * Considerar sistemas operacionais Linux para os servidores, que geralmente têm custos menores em comparação com sistemas proprietários.

**Considerações Adicionais:**

* **Resolução de Captchas:** A resolução de captchas pode ser um custo significativo. Avaliar a possibilidade de utilizar serviços de terceiros especializados em resolução de captchas ou implementar estratégias para minimizar a frequência com que eles aparecem.
* **Monitoramento de Custos:** Implementar um sistema de monitoramento de custos da nuvem para acompanhar os gastos e identificar áreas onde os custos podem ser otimizados.
* **Revisão Contínua:** A estratégia de baixo custo deve ser revisada e ajustada continuamente com base no desempenho do sistema e nos custos reais.

Esta proposta de arquitetura visa fornecer uma solução eficiente, escalável e de baixo custo para o problema apresentado. A escolha específica das tecnologias e serviços de nuvem pode ser ajustada dependendo das preferências da empresa e da familiaridade da equipe com as diferentes plataformas.