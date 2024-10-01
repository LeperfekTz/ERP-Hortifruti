const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const log = require("electron-log");
const bcrypt = require("bcrypt");

// Configura o local do arquivo de log
log.transports.file.resolvePathFn = () =>
  `${app.getPath("userData")}/logs/main.log`;

// Abrir a base de dados SQLite
const db = new sqlite3.Database(
  path.join(__dirname, "db", "database.db"),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      log.error("Erro ao abrir o banco de dados:", err.message);
    } else {
      log.info("Banco de dados conectado com sucesso.");

      // Configura o modo WAL (Write-Ahead Logging)
      db.exec("PRAGMA journal_mode = WAL;", (err) => {
        if (err) {
          log.error("Erro ao configurar o modo WAL:", err.message);
        } else {
          log.info("Modo WAL configurado com sucesso.");
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
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("renderer/login.html");
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

// Manipuladores IPC para diversas funcionalidades
ipcMain.handle("cadastrar-usuario", async (event, nome, email, senha) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Verifica se o email já está cadastrado
      db.get(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        async (err, row) => {
          if (err) {
            reject("Erro ao acessar o banco de dados");
          } else if (row) {
            reject("Email já cadastrado");
          } else {
            // Criptografa a senha
            const hashedPassword = await bcrypt.hash(senha, 10);
            // Insere o novo usuário no banco de dados
            db.run(
              "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
              [nome, email, hashedPassword],
              (err) => {
                if (err) {
                  reject("Erro ao cadastrar usuário");
                } else {
                  resolve("Usuário cadastrado com sucesso");
                }
              }
            );
          }
        }
      );
    } catch (error) {
      reject("Erro ao cadastrar usuário: " + error.message);
    }
  });
});

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
// Manipulador IPC para obter categorias
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
ipcMain.handle("registrar-venda", (event, produtoId, quantidade) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.get(
        `SELECT nome, preco, quantidade FROM produtos WHERE id = ?`,
        [produtoId],
        (err, produto) => {
          // Aqui você deve usar 'produto' em vez de 'row'
          if (err) {
            db.run("ROLLBACK");
            reject(
              new Error(
                "Erro ao obter preço e quantidade do produto: " + err.message
              )
            );
            return;
          }

          if (!produto) {
            db.run("ROLLBACK");
            reject(new Error("Produto não encontrado"));
            return;
          }

          if (produto.quantidade < quantidade) {
            db.run("ROLLBACK");
            reject(new Error("Quantidade insuficiente em estoque"));
            return;
          }

          const valorTotal = produto.preco * quantidade;

          db.run(
            `INSERT INTO vendas (nomeProd, quantidade, valor_total, data_venda) VALUES (?, ?, ?, ?)`,
            [produto.nome, quantidade, valorTotal, new Date().toISOString()], // Insere o nome do produto
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                reject(new Error("Erro ao registrar venda: " + err.message));
                return;
              }

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

ipcMain.handle("abrirJanelaEditarProdutos", () => {
  abrirJanelaEditarProdutos();
});

ipcMain.handle("abrirJanelaEditarCategorias", () => {
  abrirJanelaEditarCategorias();
});

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
ipcMain.handle("excluir-categoria", async (event, categoriaId) => {
  try {
    await db.run("DELETE FROM categorias WHERE id = ?", categoriaId);
    return "Deletado"; // Retorna apenas a string "Deletado"
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    throw new Error("Erro ao excluir categoria");
  }
});

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

ipcMain.handle("login", async (event, email, senha) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM usuarios WHERE email = ?";
    db.get(query, [email], async (err, user) => {
      if (err) {
        reject(new Error("Erro ao acessar o banco de dados: " + err.message));
      } else if (!user) {
        reject(new Error("Usuário não encontrado."));
      } else {
        // Adicione os logs aqui
        log.info("Senha fornecida:", senha);
        log.info("Hash armazenado:", user.senha);

        const isMatch = await bcrypt.compare(senha, user.senha);
        log.info("Senha corresponde:", isMatch);

        if (!isMatch) {
          reject(new Error("Senha incorreta."));
        } else {
          resolve("Login bem-sucedido!");
        }
      }
    });
  });
});

// Carregar status do caixa
ipcMain.handle("carregar-caixa", async () => {
  const caixa = await db.getCaixaStatus(); // Função que busca os dados do caixa no SQL
  return caixa;
});

// Carregar movimentação do caixa
ipcMain.handle("carregar-movimentacao", async () => {
  const movimentacoes = await db.getMovimentacoes(); // Função que busca a movimentação do caixa no SQL
  return movimentacoes;
});

// Carregar resumo do caixa
ipcMain.handle("carregar-resumo", async () => {
  const resumo = await db.getResumoCaixa(); // Função que busca o resumo no SQL
  return resumo;
});
ipcMain.handle("abrir-caixa", async (event, valorAbertura) => {
  try {
    const dataAbertura = new Date().toISOString();
    const insertCaixa = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO caixa_historico (data_abertura, valor_abertura) VALUES (?, ?)",
        [dataAbertura, valorAbertura],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    return { id: insertCaixa, dataAbertura, valorAbertura };
  } catch (error) {
    console.error("Erro ao abrir caixa:", error);
    throw error;
  }
});

ipcMain.handle("fechar-caixa", async (event, valorAbertura) => {
  try {
    const totalVendas = await new Promise((resolve, reject) => {
      db.get(
        "SELECT SUM(valor_total) as totalVendas FROM vendas",
        (err, row) => {
          if (err) reject(err);
          else resolve(row.totalVendas || 0);
        }
      );
    });

    const dataFechamento = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE caixa_historico SET data_fechamento = ?, valor_fechamento = ?, total_vendas = ? WHERE data_fechamento IS NULL",
        [dataFechamento, valorAbertura + totalVendas, totalVendas],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return { total_vendas: totalVendas, data_fechamento: dataFechamento };
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    throw error;
  }
});


ipcMain.handle("obter-historico-vendas", async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM vendas ORDER BY data_venda DESC", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});
