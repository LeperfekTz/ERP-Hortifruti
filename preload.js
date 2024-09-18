const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  cadastrarUsuario: (nome, email, senha) =>
    ipcRenderer.invoke("cadastrar-usuario", nome, email, senha),
  adicionarProduto: (nome, preco) =>
    ipcRenderer.invoke("adicionar-produto", nome, preco),
  obterProdutos: () => ipcRenderer.invoke("obter-produtos"),
  registrarVenda: (produtoId, quantidade) =>
    ipcRenderer.invoke("registrar-venda", produtoId, quantidade),
  obterRelatorioVendas: () => ipcRenderer.invoke("obter-relatorio-vendas"),
});
