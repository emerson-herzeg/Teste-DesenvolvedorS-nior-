const fs = require('fs');
const { Pool } = require('pg');
const StreamArray = require('stream-json/streamers/StreamArray');
require('dotenv').config();

const sufixOrder = '_sort';

/**
 * Rename ordered file
 * @param {*} filename 
 * @param {*} suffix 
 * @returns string
 */
function addSuffixToFilename(filename, suffix) {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // File whitout extension
    return filename + suffix;
  }

  const namePart = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);

  return namePart + suffix + extension;
}

/**
 * Sorts the file by the timestamp property and returns the sorted file name
 * @param {*} file 
 * @returns string
 */
async function fileSort(file, sufix) {
  if (!fs.existsSync(file)) {
    throw ('File not found');
  }
  const fileSortName = addSuffixToFilename(file, sufix);
  const dados = JSON.parse(fs.readFileSync(file, 'utf8'));
  dados.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  fs.writeFileSync(fileSortName, JSON.stringify(dados, null, 2));

  return fileSortName;
}

/**
 * Main function that processes the JSON file and inserts the non-duplicate transactions
 * @param {*} file 
 * @returns void
 */
async function processTransactions(file) {
  console.log('Processing ...');
  const startTime = Date.now();

  const fileSortName = await fileSort(file, sufixOrder);
  const jsonStream = fs.createReadStream(fileSortName)
    .pipe(StreamArray.withParser());
  const ultimoInserido = new Map();

  const batchSize = 1000;
  let batch = [];

  for await (const { value: tx } of jsonStream) {
    const chave = `${tx.valor}-${tx.pagador}-${tx.recebedor}`;
    const tsAtual = new Date(tx.timestamp).getTime() / 1000;

    if (ultimoInserido.has(chave)) {
      const tsAnterior = ultimoInserido.get(chave);
      if ((tsAtual - tsAnterior) <= 10) {
        continue;
      }
    }
    batch.push(tx);
    ultimoInserido.set(chave, tsAtual);

    if (batch.length >= batchSize) {
      await insertBatch(batch);
      batch = [];
    }
  }
  if (batch.length > 0) {
    await insertBatch(batch);
  }

  removeFileSort(fileSortName);
  const endTime = Date.now();
  const executionTime = Math.floor((endTime - startTime) / 1000);

  console.log(`Execution time: ${executionTime} seconds.`);
}

/**
 * 
 * @param {*} transactions 
 */
async function insertBatch(transactions) {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let query = 'INSERT INTO transactions (id, valor, pagador, recebedor, timestamp) VALUES ';
    const params = [];
    const valuesArr = [];
    let paramIndex = 1;

    for (const tx of transactions) {
      valuesArr.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(tx.id, tx.valor, tx.pagador, tx.recebedor, tx.timestamp);
    }
    query += valuesArr.join(', ');

    await client.query(query, params);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error on insert batch:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * 
 * @param {*} file 
 */
function removeFileSort(file) {
  if (!fs.existsSync(file)) {
    throw ('File not found');
  }
  fs.unlink(file, (err) => {
    if (err) {
      console.error('Delete error:', err);
      return;
    }
  });
}

const args = process.argv.slice(1);
if (args.length < 1) {
  console.log("Use: node app.js <filename>");
  process.exit(1);
}
const fileName = args[1];

(async () => {
  try {
    await processTransactions(fileName);
    console.log('Processing completed.');
  } catch (error) {
    console.error('Process error:', error);
  }
})();