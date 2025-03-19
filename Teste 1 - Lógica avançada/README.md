# Teste de Lógica Avançada

O objetivo desse script é realizar a importação de um arquivo JSON contendo informações de transações bancárias.<br>Transações serão consideradas duplicadas de acordo com a regra abaixo e devem ser desconsideradas:<br>
* Transação com o mesmo valor.<br>
* Transação com mesmo pagador e recebedor.<br>
* Transação com diferença de tempo de no máximo 10 segundos.

## Estratégia
Inicalmente havia pensado que seria necessário transferir todos os registros do arquivo para um banco de dados não relacional para a partir dele realizar uma busca para remover as duplicidades com eficiência. <br>
Porém é possível realizar a pré ordenação de arquivos grandes em memória usando a função "localeCompare" do Javascript e a partir do arquivo ordenado realizar a persitência dos dados em banco ignorando as duplicidades utilizando um script relativamente mais simples.

## Pré-Requitos
O teste considera a existência de um banco de dados Postgress cuja instalação e configuração não faz parte desse teste. Abaixo a estrutura da tabela de transações que deve existir no banco de dados para que o script funcione. Caso não existe execute o SQL.

```
CREATE TABLE transactions (
	id int4 NULL,
	valor float8 NULL,
	pagador varchar(255) NULL,
	recebedor varchar(255) NULL,
	"timestamp" timestamp NULL
);
```
O arquivo a ser processado deve estar na pasta do projeto.

## Setup
Configure o arquivo .env com os dados de conexão com o banco de dados Postgres.
```
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
```

Instale as dependências do script
```
npm install
```

## Execução
Para executar a importação execute o comando abaixo, onde `nome-arquivo` deve ser subistituido pelo nome original do arquivo a ser importado.
```
node index.js <nome-arquivo>
```

## Resultado
Após a execução, será exebido o tempo total em segundos da importação.
```
Processing ...
Execution time: 140 seconds.
Processing completed.
```