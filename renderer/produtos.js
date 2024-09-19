// Lidar com o envio do formulário de cadastro de produtos
const formCadastrarProduto = document.getElementById("form-cadastrar-produto");

formCadastrarProduto.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("Formulário de cadastro de produto enviado.");

  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const quantidade = parseInt(document.getElementById("quantidade").value);
  const categoria = document.getElementById("categoria").value;

  console.log(
    `Dados do produto: Nome=${nome}, Preço=${preco}, Quantidade=${quantidade}, Categoria=${categoria}`
  );

  // Chamar a função do backend para adicionar o produto
  window.api
    .adicionarProduto(nome, preco, quantidade, categoria)
    .then((message) => {
      console.log("Produto adicionado com sucesso:", message);
      alert(message);
      // Limpar o formulário após o cadastro
      formCadastrarProduto.reset();
    })
    .catch((error) => {
      console.error("Erro ao adicionar o produto:", error.message);
      alert(error.message);
    });
});

// Lidar com o clique para listar produtos
const btnListarProdutos = document.getElementById("btn-listar-produtos");

btnListarProdutos.addEventListener("click", () => {
  console.log("Botão 'Listar Produtos' clicado.");

  // Chamar a função do backend para obter os produtos
  window.api
    .obterProdutos()
    .then((produtos) => {
      console.log("Produtos retornados do backend:", produtos);
      const tabelaProdutos = document
        .getElementById("tabela-produtos")
        .getElementsByTagName("tbody")[0];
      tabelaProdutos.innerHTML = ""; // Limpar a tabela antes de adicionar novos itens

      // Verificar se há produtos a serem listados
      if (produtos.length === 0) {
        console.log("Nenhum produto cadastrado.");
        tabelaProdutos.innerHTML =
          "<tr><td colspan='4'>Nenhum produto cadastrado.</td></tr>";
        return;
      }

      // Listar cada produto
      produtos.forEach((produto) => {
        console.log(
          `Produto: Nome=${produto.nome}, Categoria=${produto.categoria}, Quantidade=${produto.quantidade}, Preço=${produto.preco}`
        );
        const row = tabelaProdutos.insertRow();
        row.insertCell(0).textContent = produto.nome || "Não disponível";
        row.insertCell(1).textContent = produto.categoria || "Não disponível";
        row.insertCell(2).textContent =
          produto.quantidade !== null ? produto.quantidade : "Não disponível";
        row.insertCell(3).textContent = "R$ " + (produto.preco || 0).toFixed(2);
      });
    })
    .catch((error) => {
      console.error("Erro ao listar produtos:", error.message);
      alert("Erro ao listar produtos: " + error.message);
    });
});

// Adicionar novas categorias
document.addEventListener("DOMContentLoaded", function () {
  const selectCategoria = document.getElementById("categoria");
  const inputNovaCategoria = document.getElementById("nova-categoria");
  const btnAdicionarCategoria = document.getElementById(
    "btn-adicionar-categoria"
  );

  // Array de categorias iniciais
  let categorias = ["frutas", "legumes"];

  // Função para atualizar o <select> com as categorias
  function atualizarCategorias() {
    selectCategoria.innerHTML = ""; // Limpa as opções atuais
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      selectCategoria.appendChild(option);
    });
  }

  // Atualiza a lista de categorias ao carregar a página
  atualizarCategorias();

  // Adiciona uma nova categoria
  btnAdicionarCategoria.addEventListener("click", function () {
    const novaCategoria = inputNovaCategoria.value.trim();
    if (novaCategoria && !categorias.includes(novaCategoria)) {
      categorias.push(novaCategoria); // Adiciona ao array
      atualizarCategorias(); // Atualiza o <select>
      inputNovaCategoria.value = ""; // Limpa o campo de nova categoria
    } else if (categorias.includes(novaCategoria)) {
      alert("Essa categoria já existe.");
    }
  });
});

//código para abrir novas janelas ao clicar nos botões

document.getElementById("editar-produtos-btn").addEventListener("click", () => {
  window.api.abrirJanelaEditarProdutos();
});

document
  .getElementById("editar-categorias-btn")
  .addEventListener("click", () => {
    window.api.abrirJanelaEditarCategorias();
  });
