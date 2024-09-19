const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: (email, senha) => ipcRenderer.invoke("login", email, senha),

  // Função para cadastrar um usuário
  cadastrarUsuario: (nome, email, senha) =>
    ipcRenderer.invoke("cadastrar-usuario", nome, email, senha),

  // Função para adicionar um produto
  adicionarProduto: (nome, preco, quantidade, categoria) =>
    ipcRenderer.invoke("adicionar-produto", nome, preco, quantidade, categoria),

  // Função para obter todos os produtos
  obterProdutos: () => ipcRenderer.invoke("obter-produtos"),

  // Função para registrar uma venda
  registrarVenda: (produtoId, quantidade) =>
    ipcRenderer.invoke("registrar-venda", produtoId, quantidade),

  // Função para obter o relatório de vendas
  obterRelatorioVendas: () => ipcRenderer.invoke("obter-relatorio-vendas"),

  // Função para editar um produto
  editarProduto: (id, nome, preco, quantidade, categoria) =>
    ipcRenderer.invoke(
      "editar-produto",
      id,
      nome,
      preco,
      quantidade,
      categoria
    ),

  // Função para editar uma categoria
  editarCategoria: (categoria, novaCategoria) =>
    ipcRenderer.invoke("editar-categoria", categoria, novaCategoria),

  // Função para abrir a janela de cadastro de produto
  abrirJanelaCadastroProduto: () =>
    ipcRenderer.invoke("abrirJanelaCadastroProduto"),

  // Função para abrir a janela de edição de produtos
  abrirJanelaEditarProdutos: () =>
    ipcRenderer.invoke("abrirJanelaEditarProdutos"),

  // Função para abrir a janela de edição de categorias
  abrirJanelaEditarCategorias: () =>
    ipcRenderer.invoke("abrirJanelaEditarCategorias"),

  // Função para excluir um produto
  excluirProduto: (id) => ipcRenderer.invoke("excluir-produto", id),

  // Função para adicionar uma nova categoria
  adicionarCategoria: (nome) => ipcRenderer.invoke("adicionar-categoria", nome),

  // Função para obter todas as categorias
  obterCategorias: () => ipcRenderer.invoke("obter-categorias"),

  // Função para excluir uma categoria
  excluirCategoria: (id) => ipcRenderer.invoke("excluir-categoria", id),
});
