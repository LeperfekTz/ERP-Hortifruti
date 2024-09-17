const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  "/home/leperfekt/Documents/App em js/novo_app_electron/ERP-Hortifruti/db/database.db"
);

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
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
      [nome, email, senha],
      function (err) {
        if (err) {
          reject(new Error("Erro ao cadastrar usuário: " + err.message));
        } else {
          resolve("Usuário cadastrado com sucesso!");
        }
      }
    );
  });
};

// Função para adicionar um novo produto
window.api.adicionarProduto = (nome, preco) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO produtos (nome, preco) VALUES (?, ?)`,
      [nome, preco],
      function (err) {
        if (err) {
          reject(new Error("Erro ao adicionar produto: " + err.message));
        } else {
          resolve("Produto adicionado com sucesso!");
        }
      }
    );
  });
};

// Função para listar todos os produtos
window.api.obterProdutos = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM produtos`, [], (err, rows) => {
      if (err) {
        reject(new Error("Erro ao obter produtos: " + err.message));
      } else {
        resolve(rows);
      }
    });
  });
};

// Exemplo de utilização de IPC para resposta de cadastro de usuário
const { ipcRenderer } = require("electron");
ipcRenderer.on("usuario-cadastrado", (event, response) => {
  if (response.sucesso) {
    alert(response.mensagem); // Exibir sucesso
  } else {
    alert(response.mensagem); // Exibir erro (por exemplo, email duplicado)
  }
});
