const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "erp-database.db"));

db.serialize(() => {
  // Criação de tabelas
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS vendas (id INTEGER PRIMARY KEY, produto_id INTEGER, quantidade INTEGER, data TEXT)"
  );
});

// Função para registrar usuários (criptografando a senha)
function registerUser(username, password, callback) {
  const hash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash],
    (err) => {
      callback(err);
    }
  );
}

// Função para validar login
function loginUser(username, password, callback) {
  db.get(
    "SELECT password FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err || !row) {
        return callback(false);
      }
      const isValid = bcrypt.compareSync(password, row.password);
      callback(isValid); // Retorna true se o login for válido, false caso contrário
    }
  );
}

module.exports = { registerUser, loginUser };
