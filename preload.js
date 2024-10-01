const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Funções de autenticação e cadastro
  login: (email, senha) => ipcRenderer.invoke("login", email, senha),
  cadastrarUsuario: (nome, email, senha) =>
    ipcRenderer.invoke("cadastrar-usuario", nome, email, senha),

  // Funções para gerenciar produtos
  adicionarProduto: (nome, preco, quantidade, categoria) =>
    ipcRenderer.invoke("adicionar-produto", nome, preco, quantidade, categoria),
  obterProdutos: () => ipcRenderer.invoke("obter-produtos"),
  editarProduto: (id, nome, preco, quantidade, categoria) =>
    ipcRenderer.invoke(
      "editar-produto",
      id,
      nome,
      preco,
      quantidade,
      categoria
    ),
  excluirProduto: (id) => ipcRenderer.invoke("excluir-produto", id),

  // Funções para gerenciar categorias
  editarCategoria: (categoria, novaCategoria) =>
    ipcRenderer.invoke("editar-categoria", categoria, novaCategoria),
  adicionarCategoria: (nome) => ipcRenderer.invoke("adicionar-categoria", nome),
  obterCategorias: () => ipcRenderer.invoke("obter-categorias"),
  excluirCategoria: (id) => ipcRenderer.invoke("excluir-categoria", id),

  // Funções para gerenciar vendas
  registrarVenda: (produtoId, quantidade) =>
    ipcRenderer.invoke("registrar-venda", produtoId, quantidade),
  obterRelatorioVendas: () => ipcRenderer.invoke("obter-relatorio-vendas"),

  // Funções específicas para o caixa
  abrirCaixa: (valor) => ipcRenderer.invoke("abrir-caixa", valor),
  fecharCaixa: () => ipcRenderer.invoke("fechar-caixa"),
  obterHistoricoVendas: () => ipcRenderer.invoke("obter-historico-vendas"),

  // Outras funções relacionadas
  abrirJanelaCadastroProduto: () =>
    ipcRenderer.invoke("abrirJanelaCadastroProduto"),
  abrirJanelaEditarProdutos: () =>
    ipcRenderer.invoke("abrirJanelaEditarProdutos"),
  abrirJanelaEditarCategorias: () =>
    ipcRenderer.invoke("abrirJanelaEditarCategorias"),
});
