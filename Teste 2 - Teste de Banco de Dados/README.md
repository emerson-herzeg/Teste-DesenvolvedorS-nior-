# Teste de Banco de Dados

O objetivo desse teste é avaliar o conhecimento avançado em modelagem de banco de dados, indexação, otimização de queries e concorrência.

## Estratégia
Criação comandos DDL para geração das tabelas solicitadas no teste e seus respectivos índices visando a otimização da performance levando em consideração que essas tabelas serão usadas num sistema de e-commerce. Será aplicado até a Quarta Forma Normal (3FN) nas tabelas de usuários, produtos e pedidos, até tabela de relação entre pedidos e produtos será normalizada até a Quarta Forma Normal (4FN), garantindo uma estrutura eficiente e sem redundâncias ou anomalias de dados.

## Pré-Requitos
Será usado o banco de dados PostGres para a criação das tabelas e execução das query e será considerado que o banco já existe e está configurado e em execução.

## Setup 
Execute os DDL abaixo para a criação das tabelas no banco
### Tabela de usuários
```
CREATE TABLE usuarios (
	id serial4 NOT NULL,
	nome varchar(100) NOT NULL,
    criado_em date NOT NULL,
	CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);
CREATE INDEX usuarios_nome_idx ON public.usuarios (nome);
```
Na tabela de usuários foi criado um índice na coluna `nome` para otimizar a consulta de usuários pelo nome.

### Tabela de produtos
```
CREATE TABLE produtos (
	id serial4 NOT NULL,
	nome varchar(100) NOT NULL,
	estoque int4 NULL,
    criado_em date NOT NULL,
	CONSTRAINT produtos_pkey PRIMARY KEY (id)
);
CREATE INDEX produtos_nome_idx ON produtos (nome);
CREATE INDEX idx_produtos_estoque ON produtos (estoque);
```
Na tabela de produtos foi criado um índice na coluna `nome` para otimizar a consulta de pedutos pelo nome.


### Tabela de pedidos
```
CREATE TABLE pedidos (
	id serial4 NOT NULL,
	usuarios_id int4 NOT NULL,
    criado_em date NOT NULL,
	CONSTRAINT pedidos_pk PRIMARY KEY (id)
);
ALTER TABLE pedidos ADD CONSTRAINT pedidos_usuarios_fk FOREIGN KEY (usuarios_id) REFERENCES usuarios(id);
CREATE INDEX idx_pedidos_usuarios ON pedidos (usuarios_id);
```
Criação do índice `idx_pedidos_usuarios`para melhorar o desempenho ao buscar pedidos de um usuário sem precisar escanear toda a tabela.

### Tabela de relação entre produtos e pedidos (pedidos-produtos)
```
CREATE TABLE pedidos_produtos (
	id serial4 NOT NULL,
	pedidos_id int4 NOT NULL,
	produtos_id int4 NOT NULL,
	quantidade int4 NOT NULL,
	CONSTRAINT pedidos_produtos_pk PRIMARY KEY (id)
);

ALTER TABLE pedidos_produtos ADD CONSTRAINT pedidos_produtos_pedidos_fk FOREIGN KEY (pedidos_id) REFERENCES pedidos(id);
ALTER TABLE pedidos_produtos ADD CONSTRAINT pedidos_produtos_produtos_fk FOREIGN KEY (produtos_id) REFERENCES produtos(id);
```
### Uso de Transações para Garantir Consistência
A estrutura das tabelas envolve múltiplas operações ao inserir um pedido (ex.: pedidos, pedidos_produtos e atualização do estoque). Para evitar inconsistências, é essencial usar transações para que todas as operações sejam confirmadas ou revertidas juntas.
Exemplo:
```
BEGIN;

-- Criar um novo pedido
INSERT INTO pedidos (usuarios_id) VALUES (1) RETURNING id;

-- Suponha que o id retornado do pedido seja 10
INSERT INTO pedidos_produtos (pedidos_id, produtos_id, quantidade) VALUES (10, 2, 3);

-- Atualizar o estoque do produto
UPDATE produtos SET estoque = estoque - 3 WHERE id = 2;

COMMIT;
```
Caso qualquer operação falhe (ex.: estoque insuficiente), um ROLLBACK deve ser acionado para evitar que o banco fique em um estado inconsistente.

### Controle de Concorrência com Locks Estratégicos

Se múltiplos processos tentarem modificar o mesmo produto ao mesmo tempo, podemos ter problemas de race condition e dirty reads. O PostgreSQL oferece mecanismos para evitar isso, veja exemplo do uso do `SELECT ... FOR UPDATE`:
```
BEGIN;

-- Bloqueia a linha do produto para garantir que apenas um pedido por vez possa modificar o estoque
SELECT estoque FROM produtos WHERE id = 2 FOR UPDATE;

-- Atualizar estoque
UPDATE produtos SET estoque = estoque - 3 WHERE id = 2;

-- Criar pedido e relação com os produtos
INSERT INTO pedidos (usuarios_id) VALUES (1) RETURNING id;
INSERT INTO pedidos_produtos (pedidos_id, produtos_id, quantidade) VALUES (10, 2, 3);

COMMIT;
```

### Uso de Constrains para Garantir Integridade
É possível criar uma constrain na tabela de produtos para evitar estoque negativo.
```
ALTER TABLE produtos ADD CONSTRAINT estoque_nao_negativo CHECK (estoque >= 0);
```

## Execução de Queries
Seguem exemplos práticos de situações reais e suas querys otimizadas

### Recuperar os últimos 10 pedidos de um usuário específico, incluindo os produtos comprados
```
SELECT p.id AS pedido_id, p.usuarios_id, ppr.produtos_id, pr.nome AS produto_nome, ppr.quantidade
FROM pedidos p
JOIN pedidos_produtos ppr ON p.id = ppr.pedidos_id
JOIN produtos pr ON ppr.produtos_id = pr.id
WHERE p.usuarios_id = 123
ORDER BY p.id DESC
LIMIT 10;
```

### Obter os produtos mais vendidos nos últimos 30 dias, ordenados do mais vendido para o menos vendido
```
SELECT ppr.produtos_id, pr.nome AS produto_nome, SUM(ppr.quantidade) AS total_vendido
FROM pedidos_produtos ppr
JOIN pedidos p ON ppr.pedidos_id = p.id
JOIN produtos pr ON ppr.produtos_id = pr.id
WHERE p.id IN (
    SELECT id FROM pedidos WHERE criado_em >= NOW() - INTERVAL '30 days'
)
GROUP BY ppr.produtos_id, pr.nome
ORDER BY total_vendido DESC
LIMIT 10;
```

### Atualizar o estoque de um produto durante um pedido, garantindo que múltiplas compras simultâneas não causem inconsistências
```
UPDATE produtos
SET estoque = estoque - 3
WHERE id = 2 AND estoque >= 3
RETURNING estoque;
```

## Escalabilidade
Algumas estratégias para ganhar escala e suportar 1 milhão de pedidos por dia: <br>
###  Particionamento de Dados (Sharding)
Dividir a tabela pedidos em partições por data. Isso melhora a performance porque as queries de leitura e escrita atuam apenas na partição ativa. Exemplo de particionamento por mês:
```
CREATE TABLE pedidos_2025_02 PARTITION OF pedidos
FOR VALUES FROM ('2025-02-01') TO ('2025-02-28');
```
O PostgreSQL automaticamente direciona novos pedidos para a partição correta.

### Usar Redis ou Memcached para cachear consultas de produtos mais vendidos.
Exemplo de cache Redis para evitar consultas repetitivas:
```
const cacheKey = `produtos_mais_vendidos_30dias`;
const cacheData = await redis.get(cacheKey);

if (!cacheData) {
  const produtos = await db.query("SELECT ..."); // Consulta no PostgreSQL
  await redis.set(cacheKey, JSON.stringify(produtos), "EX", 3600); // Cache por 1 hora
  return produtos;
}
return JSON.parse(cacheData);
```

### Arquitetura Baseada em Microsserviços
Em vez de um monólito, dividir o sistema em serviços menores, como:<br>
Serviço de Pedidos (Pedidos e Pagamentos)
Serviço de Estoque (Controle de estoque e disponibilidade)
Conectar os serviços através de mensagens usando o RabbitMQ por exemplo.