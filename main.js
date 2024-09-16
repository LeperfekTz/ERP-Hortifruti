const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Criação da janela principal
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "renderer", "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Carregar o arquivo HTML principal
  win.loadFile("renderer/index.html");

  // Abrir as ferramentas de desenvolvedor (opcional)
  // win.webContents.openDevTools();
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fechar o app quando todas as janelas forem fechadas (exceto no macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
