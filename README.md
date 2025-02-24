# Testes para Desenvolvedor Sênior

Este repositório contém uma série de testes técnicos para a posição de Desenvolvedor Sênior. Os testes avaliam diferentes aspectos das habilidades técnicas e de arquitetura necessárias para a posição.

## 🎯 Estrutura dos Testes

O repositório está organizado em 4 testes distintos, cada um focando em diferentes competências:

### 1. Teste de Lógica Avançada
Algoritmo de Processamento de Dados

Objetivo: Avaliar a habilidade de resolver problemas complexos e otimizar algoritmos.

Existem 1 milhão de transações bancárias no arquivo "transacoes1m.json" é necessário implementar um algoritmo que detecta transações duplicadas considerando:
 - Mesmo valor.
 - Mesmo pagador e recebedor.
 - Diferença de tempo de no máximo 10 segundos.

As transações duplicadas deverão ser ignoradas e as demais inseridas em um banco de dados da sua escolha.

O código deve ser otimizado para performance e exibir o tempo de duração no final da execução.

O arquivo "transacoes1k.json" possui mil transações que podem ser utilizadas para testes antes da solução final.

Critérios de avaliação:

Eficiência do algoritmo.
Uso correto de estruturas de dados.
Clareza e organização do código.
https://drive.google.com/drive/folders/1Dc695kkqb6Gt2G4inLzWT1-T3s4c9-15?usp=drive_link 

### 2. Teste de Banco de Dados
Modelagem e Query Performance

Objetivo: Avaliar o conhecimento avançado do candidato em modelagem de banco de dados, indexação, otimização de queries e concorrência.

Cenário:

Você foi contratado para otimizar a performance de um sistema de e-commerce que possui milhões de registros em sua base de dados. O sistema possui três entidades principais:

Usuários (usuarios)
Pedidos (pedidos)
Produtos (produtos)

Cada pedido pode conter vários produtos, e cada produto pode estar em vários pedidos (relação N:N). O banco de dados atual sofre com lentidão quando há muitos acessos simultâneos e tem problemas de concorrência ao atualizar os estoques.

Parte 1: Modelagem de Banco de Dados

O candidato deve modelar as tabelas em PostgreSQL ou MySQL, garantindo boas práticas de normalização e indexação.

Requisitos:

 - Criar a estrutura das tabelas e tabela de associação N:N.
 - Definir índices apropriados para otimizar buscas frequentes.
 - Explicar como garantir consistência de dados e evitar locking em cenários de concorrência.


Parte 2: Queries para Análise de Performance

O candidato deve escrever consultas otimizadas para os seguintes casos:

 - Recuperar os últimos 10 pedidos de um usuário específico, incluindo os produtos comprados.
 - Obter os produtos mais vendidos nos últimos 30 dias, ordenados do mais vendido para o menos vendido.
 - Atualizar o estoque de um produto durante um pedido, garantindo que múltiplas compras simultâneas não causem inconsistências.

O candidato deve explicar como evitar race conditions

Parte 3: Solução para Escalabilidade

Como você escalaria esse sistema para suportar 1 milhão de pedidos por dia?


### 3. Teste de Arquitetura e Delegação
Arquitetura e Delegação de Tarefas

Objetivo: Avaliar a capacidade do candidato de liderar um time, dividir tarefas complexas e definir responsabilidades.

Cenário:

Você é o desenvolvedor sênior responsável pela equipe de backend em uma empresa de tecnologia. Sua equipe possui 1 desenvolvedor pleno e 2 desenvolvedores juniores.

A empresa precisa implementar uma fila de processamento de documentos para um sistema de RH que recebe arquivos PDF e os converte para texto estruturado antes de enviá-los por email. O fluxo deve ser assíncrono e escalável, garantindo que a carga do sistema não impacte o tempo de resposta da API.

Desafio:

Sua tarefa principal é dividir essa funcionalidade em pequenas partes, delegando atividades ao pleno e aos juniores, garantindo eficiência e boas práticas.

 - A API recebe um PDF e armazena o arquivo em um bucket S3 ou similar.
 - Uma fila assíncrona processa os PDFs, convertendo-os em texto usando OCR (Tesseract, AWS Textract, etc.).
 - O texto extraído é salvo no banco de dados, vinculado ao usuário que enviou o PDF.
 - Após a extração, o sistema dispara um email ao usuário notificando que seu arquivo foi processado.
 - A arquitetura deve ser escalável e suportar picos de tráfego.

Parte 1: Definição da Arquitetura

O candidato deve definir como a aplicação será estruturada:

 - Qual tecnologia usará para a fila de mensagens? 
 - Como a API será organizada? 
 - Como garantir que o sistema seja escalável e resiliente?

Parte 2: Delegação de Tarefas

Agora, o candidato deve dividir a implementação entre a equipe:

Sênior (Você mesmo)
Pleno
Júnior 1
Júnior 2

O candidato deve justificar a divisão e garantir que os juniores não fiquem com tarefas muito complexas, mas ainda contribuam com a entrega.

### 4. Teste de Arquitetura e Web Scraping
Arquitetura de Sistema para Extração de Dados de PDFs com Web Scraping

Objetivo: Avaliar a capacidade do desenvolvedor sênior de projetar uma arquitetura eficiente e escalável para extração de dados a partir de PDFs baixados automaticamente via navegador, minimizando custos operacionais.

Cenário:

Uma empresa precisa automatizar a extração de dados de documentos em PDF que estão disponíveis em portais governamentais e sites públicos. O sistema deve:

 - Baixar os PDFs automaticamente, navegando por sites que exigem login, resolução de captchas, preenchimento de formulários ou paginação.
 - Converter os PDFs para texto de forma eficiente.
 - Identificar e extrair nomes próprios e documentos (CPF, CNPJ, RG, Passaporte, etc.).
 - Associar os dados ao PDF original e armazená-los em um banco de dados.
 - Implementar uma estrutura de baixo custo, já que o sistema precisará processar milhões de documentos.

Parte 1: Definição da Arquitetura

O candidato deve projetar a arquitetura completa do sistema, incluindo:

- Servidores necessários (Backend, Banco de Dados, Workers, Cache, etc.).
- Infraestrutura (Cloud vs. On-Premises) com justificativa para escolha.
- Estratégia para escalabilidade e paralelismo sem inflacionar os custos.
- Mecanismo de balanceamento de carga e recuperação de falhas.

Parte 2: Tecnologias e Ferramentas

O candidato deve justificar quais tecnologias usaria e por quê:

Linguagens
Bibliotecas
Banco de Dados (para buscas eficientes).
Armazenamento
Cache
Monitoramento

Parte 3: Modelagem do Banco de Dados

O candidato deve estruturar as tabelas considerando:

Relação entre PDFs, nomes e documentos identificados.
Otimização para consultas rápidas (indexação, particionamento de tabelas).
Como garantir integridade e consistência dos dados.

Parte 4: O candidato deve propor um método eficiente para associar nomes e documentos, considerando que:

Os nomes não estão necessariamente vinculados a um documento.
O sistema precisa identificar se um nome e um documento estão relacionados com base no contexto da extração.

Como garantir que um CPF ou CNPJ encontrado no texto realmente pertence a um nome extraído?

Parte 5: Estratégia para Baixo Custo

A empresa quer gastar o mínimo possível, então o candidato deve propor estratégias para:

Minimizar custos com servidores
Evitar desperdício de processamento
Evitar armazenamento desnecessário
Utilizar soluções open-source quando possível
## 📋 Instruções Gerais

1. **Organização**:
   - Crie uma branch com seu nome
   - Organize cada solução em sua respectiva pasta
   - Inclua documentação clara

2. **Documentação**:
   - README para cada solução
   - Instruções de execução
   - Justificativas técnicas
   - Considerações sobre escalabilidade

3. **Código**:
   - Código limpo e bem organizado
   - Comentários relevantes
   - Testes unitários (quando aplicável)
   - Tratamento de erros

## 🚀 Como Começar

1. Clone o repositório
2. Crie uma branch com seu nome: `git checkout -b seu-nome`
3. Escolha qual teste deseja iniciar
4. Leia atentamente a documentação específica de cada teste
5. Implemente sua solução
6. Documente suas decisões
7. Faça commit de suas alterações
8. Push para sua branch

## 📝 Critérios Gerais de Avaliação

- Qualidade e organização do código
- Eficiência das soluções propostas
- Clareza na documentação
- Decisões de arquitetura
- Considerações sobre escalabilidade
- Tratamento de edge cases
- Boas práticas de desenvolvimento

## ⏱️ Tempo Esperado

- Teste 1: ~35 minutos
- Teste 2: ~35 minutos
- Teste 3: ~35 minutos
- Teste 4: ~35 minutos

## 📬 Entrega

. Certifique-se que todo o código está commitado
. Verifique se a documentação está completa
. Confirme se todos os requisitos foram atendidos
. Envie o link do seu repositório para avaliação

## 🤝 Boa Sorte!

Lembre-se: Qualidade é mais importante que velocidade. Foque em entregar uma solução bem estruturada e documentada.

---
© 2024 Omnis Soluções Jurídicas - Todos os direitos reservados
```



