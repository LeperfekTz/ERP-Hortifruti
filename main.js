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

// Função para adicionar um produto
ipcMain.handle(
  "adicionar-produto",
  async (event, nome, preco, quantidade, categoria) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO produtos (nome, preco, quantidade, categoria) VALUES (?, ?, ?, ?)`;
      db.run(query, [nome, preco, quantidade, categoria], function (err) {
        if (err) {
          reject(
            new Error(
              "Erro ao adicionar produto ao banco de dados: " + err.message
            )
          );
        } else {
          resolve("Produto adicionado com sucesso!");
        }
      });
    });
  }
);

ipcMain.handle("obter-produtos", () => {
  console.log("Obtendo produtos");
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, nome, categoria, quantidade, preco FROM produtos`,
      [],
      (err, rows) => {
        if (err) {
          reject(new Error("Erro ao obter produtos: " + err.message));
        } else {
          resolve(rows);
        }
      }
    );
  });
});

// Manipulador para registrar vendas
ipcMain.handle("registrar-venda", (event, produtoId, quantidade) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Obter o preço e a quantidade disponível do produto
      db.get(
        `SELECT preco, quantidade FROM produtos WHERE id = ?`,
        [produtoId],
        (err, row) => {
          if (err) {
            db.run("ROLLBACK");
            reject(
              new Error(
                "Erro ao obter preço e quantidade do produto: " + err.message
              )
            );
            return;
          }

          if (!row) {
            db.run("ROLLBACK");
            reject(new Error("Produto não encontrado"));
            return;
          }

          if (row.quantidade < quantidade) {
            db.run("ROLLBACK");
            reject(new Error("Quantidade insuficiente em estoque"));
            return;
          }

          const valorTotal = row.preco * quantidade;

          // Registrar a venda
          db.run(
            `INSERT INTO vendas (nomeProd, quantidade, valor_total) VALUES (?, ?, ?)`,
            [produtoId, quantidade, valorTotal],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                reject(new Error("Erro ao registrar venda: " + err.message));
                return;
              }

              // Atualizar a quantidade do produto em estoque
              db.run(
                `UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?`,
                [quantidade, produtoId],
                function (err) {
                  if (err) {
                    db.run("ROLLBACK");
                    reject(
                      new Error(
                        "Erro ao atualizar quantidade do produto: " +
                          err.message
                      )
                    );
                  } else {
                    db.run("COMMIT");
                    resolve("Venda registrada com sucesso!");
                  }
                }
              );
            }
          );
        }
      );
    });
  });
});

ipcMain.handle("obter-relatorio-vendas", () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.nome AS produto, p.categoria, v.data_venda,
              SUM(v.quantidade) AS total_quantidade,
              SUM(v.valor_total) AS valor_total
       FROM vendas v
       JOIN produtos p ON v.nomeProd = p.id
       GROUP BY p.nome, p.categoria, v.data_venda
       ORDER BY v.data_venda DESC`,
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
