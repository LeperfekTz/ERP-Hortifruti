const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  path.join(__dirname, "db", "database.db"),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Erro ao abrir o banco de dados:", err.message);
    } else {
      console.log("Banco de dados conectado com sucesso.");

      // Configura o modo WAL
      db.exec("PRAGMA journal_mode = WAL;", (err) => {
        if (err) {
          console.error("Erro ao configurar o modo WAL:", err.message);
        } else {
          console.log("Modo WAL configurado com sucesso.");
        }
      });
    }
  }
);

// Define um timeout de 5 segundos
db.configure("busyTimeout", 5000);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  win.loadFile("renderer/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("cadastrar-usuario", (event, nome, email, senha) => {
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
});

ipcMain.handle("adicionar-produto", (event, nome, preco) => {
  console.log(`Adicionando produto: Nome=${nome}, Preço=${preco}`);
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
});

ipcMain.handle("obter-produtos", () => {
  console.log("Obtendo produtos");
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM produtos`, [], (err, rows) => {
      if (err) {
        reject(new Error("Erro ao obter produtos: " + err.message));
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle("registrar-venda", (event, produtoId, quantidade) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.get(
        `SELECT preco FROM produtos WHERE id = ?`,
        [produtoId],
        (err, row) => {
          if (err) {
            db.run("ROLLBACK");
            reject(new Error("Erro ao obter preço do produto: " + err.message));
            return;
          }

          if (!row) {
            db.run("ROLLBACK");
            reject(new Error("Produto não encontrado"));
            return;
          }

          const valorTotal = row.preco * quantidade;

          db.run(
            `INSERT INTO vendas (nomeProd, quantidade, valor_total) VALUES (?, ?, ?)`,
            [produtoId, quantidade, valorTotal],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                reject(new Error("Erro ao registrar venda: " + err.message));
              } else {
                db.run("COMMIT");
                resolve("Venda registrada com sucesso!");
              }
            }
          );
        }
      );
      0;
    });
  });
});

ipcMain.handle("obter-relatorio-vendas", () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.nome AS produto, SUM(v.quantidade) AS quantidade, SUM(v.valor_total) AS valor_total
       FROM vendas v
       JOIN produtos p ON v.nomeProd = p.id
       GROUP BY p.nome`,
      [],
      (err, rows) => {
        if (err) {
          reject(
            new Error("Erro ao obter relatório de vendas: " + err.message)
          );
        } else {
          resolve(rows);
        }
      }
    );
  });
});


