# Teste de Arquitetura e Delegação
## Cenário
Sou um desenvolvedor sênior responsável pela equipe de backend em uma empresa de tecnologia. Sua equipe possui 1 desenvolvedor pleno e 2 desenvolvedores juniores.<br>
A empresa precisa implementar uma fila de processamento de documentos para um sistema de RH que recebe arquivos PDF e os converte para texto estruturado antes de enviá-los por email. O fluxo deve ser assíncrono e escalável, garantindo que a carga do sistema não impacte o tempo de resposta da API.

## Escopo
* A API recebe um PDF e armazena o arquivo em um bucket S3 ou similar.<br>
* Uma fila assíncrona processa os PDFs, convertendo-os em texto usando OCR (Tesseract, AWS Textract, etc.).<br>
* O texto extraído é salvo no banco de dados, vinculado ao usuário que enviou o PDF. <br>
* Após a extração, o sistema dispara um email ao usuário notificando que seu arquivo foi processado.<br>
* A arquitetura deve ser escalável e suportar picos de tráfego.<br>

## Arquitetura
### Qual tecnologia usará para a fila de mensagens?
Para a implementação das filas será usado o Amazon SQS, pois possui um gerenciamento simplificado e escalabilidade automática.

### Como a API será organizada?
A arquitetura baseada em microserviços com a seguinte organização:
#### Camada de API de Recepção do PDF
Esse end-point pode ser um API Gateway apontando para uma Lambda que validar o arquivo, transferir para um bucket S3 e disparar uma notificação para uma fila SQS, contendo metadados necessários para o processamento (como referência ao arquivo e identificação do usuário).
#### Camada de processamento do PDF
Assim que o PDF é armazenado, a API publica uma mensagem em uma fila de processamento. Essa mensagem contém as informações necessárias (como a URL do arquivo no S3, o ID do usuário, etc.) para que o processamento seja realizado de forma assíncrona.
Tecnologia recomendada: AWS SQS ou RabbitMQ, que oferecem escalabilidade e gerenciamento de mensagens com recursos de retry e dead-letter.
#### Camada de processamento do texto
Uma função Lambda ou outro serviço é acionado quando uma mensagem é recebida na fila. Essa função lê o conteúdo do arquivo do S3, realiza a conversão de texto usando OCR (como AWS Textract, Tesseract, etc.) e salva o texto extraído no banco de dados.
#### Camada de persistência e notificação
Uma função Lambda ou outro serviço é acionado quando o texto é extraído. Essa função atualiza o banco de dados com o texto extraído e envia um email (por exemplo, Amazon SES, SendGrid ou similar) ao usuário notificando que o processamento foi concluído.
#### Escalabilidade e Resiliência
* `Escalabilidade`: Utilizar serviços gerenciados (como S3, SQS e Lambda, se necessário) permite que o sistema escale automaticamente conforme a demanda, garantindo alta disponibilidade mesmo durante picos de tráfego.
* `Resiliência`: A arquitetura desacoplada (API, fila, workers e serviços externos) permite isolar falhas. Mecanismos de retry, circuit breakers e monitoramento (logs e métricas) são essenciais para identificar e corrigir problemas rapidamente.

## Delegação de Tarefas
A divisão das tarefas deve levar em conta as competências de cada membro, evitando sobrecarregar os desenvolvedores juniores com atividades muito complexas, mas garantindo que contribuam de forma significativa para a entrega. Uma proposta de delegação pode ser:
### Desenvolvedor Sênior
#### Responsabilidades
* `Definição e Arquitetura`: Liderar a definição da arquitetura geral, escolher as tecnologias e definir padrões de desenvolvimento, escalabilidade e segurança.
* `Integração dos Serviços Críticos`: Implementar ou supervisionar a integração com o serviço de armazenamento (S3), a publicação na fila de mensagens e a configuração dos mecanismos de retry e logging.
* `Monitoramento e Escalabilidade`: Configurar ferramentas de monitoramento, logging e alertas para garantir a operação contínua do sistema.
* `Revisão de Código`: Revisar o código desenvolvido pelos demais membros, garantindo qualidade e aderência às boas práticas.
### Desenvolvedor Pleno
#### Responsabilidades
* `Desenvolvimento da API REST`: Criar os endpoints para o upload dos PDFs, gerenciar autenticação, autorização e validações necessárias.
* `Integração com o Armazenamento`: Implementar a lógica de upload para o bucket S3 ou serviço similar.
* `Publicação na Fila`: Integrar a API com a fila de mensagens, garantindo que as mensagens sejam formatadas corretamente e publicadas assim que o upload for concluído.
* `Testes`: Escrever testes unitários e de integração para os endpoints desenvolvidos.
### Desenvolvedor Júnior 1
#### Responsabilidades
* `Implementação do Worker de Processamento`: Desenvolver o componente que consome as mensagens da fila. Essa tarefa envolve:<br>
    ** Conectar-se à fila de mensagens e fazer a leitura das tarefas.<br>
    ** Implementar a lógica para fazer o download do arquivo a partir do armazenamento.
* `Integração com OCR`: Implementar a chamada ao serviço de OCR (Tesseract ou AWS Textract), tratando possíveis erros e garantindo que a extração seja realizada com sucesso.
* `Testes e Validação`: Testar o fluxo de processamento do worker, assegurando que, em caso de falhas, os mecanismos de retry estejam funcionando.
### Desenvolvedor Júnior 2
#### Responsabilidades
* `Persistência dos Dados`: Desenvolver a camada de persistência que salva o texto extraído no banco de dados, garantindo a associação correta com o usuário.
* `Implementação do Serviço de Email`: Desenvolver a funcionalidade que dispara o email de notificação ao usuário assim que o processamento estiver concluído. Essa tarefa envolve a integração com um provedor de email (como Amazon SES ou SendGrid).
* `Integração e Testes Finais`: Garantir que, após o processamento, os dados estejam corretamente salvos e que o usuário receba a notificação, realizando testes de ponta a ponta.
## Justificativa da Divisão de Tarefas
### Nível de Complexidade:
* As tarefas mais críticas e que exigem visão global (arquitetura, integração de serviços essenciais, monitoramento) ficam com o sênior e o pleno.
* Os desenvolvedores juniores trabalham em partes mais delimitadas e específicas, como a implementação do worker, persistência de dados e disparo de email, o que permite que se concentrem em tarefas com escopo bem definido, sem a necessidade de lidar com toda a complexidade do sistema.
### Crescimento e Aprendizado:
* Essa divisão permite que os juniores ganhem experiência em áreas específicas (fila, OCR, persistência e notificações) e, com o tempo, possam assumir responsabilidades maiores.
* O desenvolvedor pleno, com mais experiência, lida com a integração da API com os serviços externos, apoiando os juniores e garantindo a solidez do fluxo.
### Coesão da Equipe:
* A liderança técnica do sênior garante que todos os componentes se integrem de forma eficiente e seguindo as melhores práticas, enquanto o pleno serve como ponte entre o sênior e os juniores, ajudando a resolver dúvidas e orientar durante a implementação.