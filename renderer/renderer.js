const { ipcRenderer } = require("electron");

// Função para exibir mensagens ao usuário
function mostrarMensagem(mensagem, tipo = "info") {
  alert(`${tipo}: ${mensagem}`);
}

// Função para cadastrar o usuário
async function cadastrarUsuario(nome, email, senha) {
  try {
    const message = await ipcRenderer.invoke(
      "cadastrar-usuario",
      nome,
      email,
      senha
    );
    mostrarMensagem(message, "Sucesso");
  } catch (error) {
    mostrarMensagem("Erro ao cadastrar usuário: " + error.message, "Erro");
  }
}

// Função para adicionar um novo produto
async function adicionarProduto(nome, preco) {
  try {
    const message = await ipcRenderer.invoke("adicionar-produto", nome, preco);
    mostrarMensagem(message, "Sucesso");
    document.getElementById("form-cadastrar-produto").reset(); // Limpar o formulário
  } catch (error) {
    mostrarMensagem("Erro ao adicionar produto: " + error.message, "Erro");
  }
}

// Função para listar todos os produtos
async function listarProdutos() {
  try {
    const produtos = await ipcRenderer.invoke("obter-produtos");
    const listaProdutos = document.getElementById("lista-produtos");
    listaProdutos.innerHTML = ""; // Limpar a lista antes de adicionar novos itens

    produtos.forEach((produto) => {
      const li = document.createElement("li");
      li.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
      listaProdutos.appendChild(li);
    });
  } catch (error) {
    mostrarMensagem("Erro ao listar produtos: " + error.message, "Erro");
  }
}

// Lidar com o envio do formulário de cadastro de produtos
document
  .getElementById("form-cadastrar-produto")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const preco = parseFloat(document.getElementById("preco").value);

    if (isNaN(preco) || preco <= 0) {
      mostrarMensagem("Por favor, insira um preço válido.", "Erro");
      return;
    }

    adicionarProduto(nome, preco);
  });

// Lidar com o clique para listar produtos
document.getElementById("btn-listar-produtos").addEventListener("click", () => {
  listarProdutos();
});

// Exemplo de chamada ao manipular cadastro de usuário
document
  .getElementById("cadastro-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    await cadastrarUsuario(nome, email, senha);
  });

// Exemplo de chamada para excluir categoria
async function excluirCategoria(categoriaId) {
  try {
    const mensagem = await ipcRenderer.invoke("excluir-categoria", categoriaId);
    mostrarMensagem(mensagem, "Sucesso");
  } catch (error) {
    console.error(error);
  }
}

// Função para abrir o caixa
document.getElementById("abrir-btn").addEventListener("click", () => {
  const valorAbertura = parseFloat(document.getElementById("valor").value);
  if (isNaN(valorAbertura) || valorAbertura <= 0) {
    alert("Por favor, insira um valor válido.");
    return;
  }

  ipcRenderer
    .invoke("abrir-caixa", valorAbertura)
    .then((result) => {
      document.getElementById("valor-abertura").textContent = `Valor de Abertura: R$ ${result.valor_abertura.toFixed(2)}`;
      alert("Caixa aberto com sucesso!");
    })
    .catch((error) => console.error("Erro ao abrir caixa:", error));
});

// Função para fechar o caixa
document.getElementById("fechar-btn").addEventListener("click", () => {
  ipcRenderer
    .invoke("fechar-caixa")
    .then((result) => {
      mostrarResumoFechamento(result);
    })
    .catch((error) => console.error("Erro ao fechar caixa:", error));
});

// Função para listar histórico de vendas
function listarHistoricoVendas() {
  ipcRenderer
    .invoke("obter-historico-vendas")
    .then((vendas) => {
      const tabelaHistorico = document.getElementById("historico-vendas").getElementsByTagName("tbody")[0];
      tabelaHistorico.innerHTML = ""; // Limpar tabela

      vendas.forEach((venda) => {
        const row = tabelaHistorico.insertRow();
        row.insertCell(0).textContent = venda.id;
        row.insertCell(1).textContent = venda.nomeProd;
        row.insertCell(2).textContent = venda.quantidade;
        row.insertCell(3).textContent = `R$ ${venda.valor_total.toFixed(2)}`;
        row.insertCell(4).textContent = venda.data_venda;
      });
    })
    .catch((error) => console.error("Erro ao obter histórico de vendas:", error));
}
async function invokeIpc(action, ...args) {
  try {
    return await ipcRenderer.invoke(action, ...args);
  } catch (error) {
    mostrarMensagem("Erro: " + error.message, "Erro");
    throw error; // Re-throw para lidar com erros em outros lugares, se necessário
  }
}

// Exemplos de uso:
async function adicionarProduto(nome, preco) {
  try {
    const message = await invokeIpc("adicionar-produto", nome, preco);
    mostrarMensagem(message, "Sucesso");
    document.getElementById("form-cadastrar-produto").reset(); // Limpar o formulário
  } catch (error) {
    // A mensagem já foi mostrada pela função invokeIpc
  }
}