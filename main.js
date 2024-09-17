const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  path.join(__dirname, "db", "database.db"),
  (err) => {
    if (err) {
      console.error("Erro ao abrir o banco de dados:", err.message);
    } else {
      console.log("Banco de dados conectado com sucesso.");
    }
  }
);

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

  // Abrir as ferramentas de desenvolvedor automaticamente
  // win.webContents.openDevTools();
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

ipcMain.handle(
  "registrar-venda",
  (event, produtoId, quantidade, valorTotal) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO vendas (produto_id, quantidade, valor_total) VALUES (?, ?, ?)`,
        [produtoId, quantidade, valorTotal],
        function (err) {
          if (err) {
            reject(new Error("Erro ao registrar venda: " + err.message));
          } else {
            resolve("Venda registrada com sucesso!");
          }
        }
      );
    });
  }
);
