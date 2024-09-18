const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Abrir a base de dados SQLite
const db = new sqlite3.Database(
  path.join(__dirname, "db", "database.db"),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Erro ao abrir o banco de dados:", err.message);
    } else {
      console.log("Banco de dados conectado com sucesso.");

      // Configura o modo WAL (Write-Ahead Logging)
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

// Define um timeout de 5 segundos para bloqueios
db.configure("busyTimeout", 5000);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("renderer/index.html");
}

function abrirJanelaEditarProdutos() {
  const editWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  editWindow.loadFile("renderer/editarProdutos.html");
}

function abrirJanelaEditarCategorias() {
  const editWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  editWindow.loadFile("renderer/editarCategorias.html");
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

ipcMain.handle("cadastrar-usuario", async (event, nome, email, senha) => {
  return new Promise((resolve, reject) => {
    // Verificar se o e-mail já está cadastrado
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
      if (err) {
        reject("Erro ao acessar o banco de dados");
      } else if (row) {
        // E-mail já cadastrado
        reject("Email já cadastrado");
      } else {
        // E-mail não cadastrado, prosseguir com o cadastro
        db.run(
          "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
          [nome, email, senha],
          (err) => {
            if (err) {
              reject("Erro ao cadastrar usuário");
            } else {
              resolve("Usuário cadastrado com sucesso");
            }
          }
        );
      }
    });
  });
});

// Manipulador IPC para adicionar um novo produto
ipcMain.handle(
  "adicionar-produto",
  (event, nome, preco, quantidade, categoria) => {
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

// Manipulador IPC para obter todos os produtos
ipcMain.handle("obter-produtos", () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, nome, preco, quantidade, categoria FROM produtos`,
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

// Manipulador IPC para obter todos os produtos para edição
ipcMain.handle("obter-produtos-editar", () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, nome, preco, quantidade FROM produtos`,
      [],
      (err, rows) => {
        if (err) {
          reject(
            new Error("Erro ao obter produtos para edição: " + err.message)
          );
        } else {
          resolve(rows);
        }
      }
    );
  });
});

// Manipulador IPC para registrar uma venda
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

// Manipulador IPC para obter relatório de vendas
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

// Manipulador IPC para abrir a janela de edição de produtos
ipcMain.handle("abrirJanelaEditarProdutos", () => {
  abrirJanelaEditarProdutos();
});

// Manipulador IPC para abrir a janela de edição de categorias
ipcMain.handle("abrirJanelaEditarCategorias", () => {
  abrirJanelaEditarCategorias();
});

// Manipulador IPC para editar um produto
ipcMain.handle(
  "editar-produto",
  (event, id, nome, preco, quantidade, categoria) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE produtos SET nome = ?, preco = ?, quantidade = ?, categoria = ? WHERE id = ?`;
      db.run(query, [nome, preco, quantidade, categoria, id], function (err) {
        if (err) {
          reject(new Error("Erro ao atualizar produto: " + err.message));
        } else {
          resolve("Produto atualizado com sucesso!");
        }
      });
    });
  }
);


// Manipulador IPC para editar uma categoria
ipcMain.handle("editar-categoria", (event, id, novaCategoria) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE produtos SET categoria = ? WHERE id = ?`;
    db.run(query, [novaCategoria, id], function (err) {
      if (err) {
        reject(new Error("Erro ao editar categoria: " + err.message));
      } else {
        resolve("Categoria editada com sucesso!");
      }
    });
  });
});

// Manipulador IPC para excluir um produto
ipcMain.handle("excluir-produto", (event, produtoId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM produtos WHERE id = ?`;
    db.run(query, [produtoId], function (err) {
      if (err) {
        reject(new Error("Erro ao excluir produto: " + err.message));
      } else {
        resolve("Produto excluído com sucesso!");
      }
    });
  });
});

// Manipulador IPC para adicionar uma nova categoria
// Adicionar categoria ao banco de dados
ipcMain.handle("adicionar-categoria", (event, nome) => {
  return new Promise((resolve, reject) => {
    if (!nome || nome.trim() === "") {
      reject(new Error("O nome da categoria não pode estar vazio."));
    } else {
      const query = `INSERT INTO categorias (nome) VALUES (?)`;
      db.run(query, [nome], function (err) {
        if (err) {
          reject(new Error("Erro ao adicionar categoria: " + err.message));
        } else {
          resolve("Categoria adicionada com sucesso!");
        }
      });
    }
  });
});

// Obter categorias do banco de dados
ipcMain.handle("obter-categorias", (event) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM categorias";
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(new Error("Erro ao obter categorias: " + err.message));
      } else {
        resolve(rows);
      }
    });
  });
});

// Excluir categoria do banco de dados
ipcMain.handle("excluir-categoria", (event, id) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM categorias WHERE id = ?";
    db.run(query, [id], function (err) {
      if (err) {
        reject(new Error("Erro ao excluir categoria: " + err.message));
      } else {
        resolve("Categoria excluída com sucesso!");
      }
    });
  });
});

// Abrir janela principal
ipcMain.handle("abrirJanelaPrincipal", () => {
  mainWindow.loadFile("index.html");
});
