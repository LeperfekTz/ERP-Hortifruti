const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.db");

// Criação de tabelas se não existirem
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    senha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    preco REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER,
    quantidade INTEGER,
    valor_total REAL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  )`);
});

// Função para cadastrar o usuário
window.api.cadastrarUsuario = (nome, email, senha) => {
  db.run(
    `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
    [nome, email, senha],
    function (err) {
      if (err) {
        alert("Erro ao cadastrar usuário: " + err.message);
      } else {
        alert("Usuário cadastrado com sucesso!");
      }
    }
  );
};

// Função para adicionar produto com preço decimal
window.api.adicionarProduto = (nome, preco) => {
  db.run(
    `INSERT INTO produtos (nome, preco) VALUES (?, ?)`,
    [nome, preco],
    function (err) {
      if (err) {
        alert("Erro ao adicionar produto: " + err.message);
      } else {
        alert("Produto adicionado com sucesso!");
      }
    }
  );
};

// Função para obter produtos
window.api.obterProdutos = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM produtos`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para obter relatório de vendas
window.api.obterRelatorioVendas = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT p.nome AS produto, SUM(v.quantidade) AS quantidade, SUM(v.valor_total) AS valor_total 
      FROM vendas v 
      JOIN produtos p ON v.produto_id = p.id 
      GROUP BY p.nome
    `,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};
