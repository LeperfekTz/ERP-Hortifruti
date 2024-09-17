const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(path.join(__dirname, "db", "database.db"));

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Configuração do preload
      nodeIntegration: false, // Desativa a integração do Node.js no renderer
      contextIsolation: true, // Isola o contexto do renderer
      enableRemoteModule: false, // Desativa o módulo remoto
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

// Handlers IPC
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
