// Lidar com o envio do formulário de cadastro de produtos
const formCadastrarProduto = document.getElementById("form-cadastrar-produto");

formCadastrarProduto.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("Formulário de cadastro de produto enviado.");

  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);

  console.log(`Dados do produto: Nome=${nome}, Preço=${preco}`);

  // Chamar a função do backend para adicionar o produto
  window.api
    .adicionarProduto(nome, preco)
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
      const listaProdutos = document.getElementById("lista-produtos");
      listaProdutos.innerHTML = ""; // Limpar a lista antes de adicionar novos itens

      // Verificar se há produtos a serem listados
      if (produtos.length === 0) {
        console.log("Nenhum produto cadastrado.");
        listaProdutos.innerHTML = "<li>Nenhum produto cadastrado.</li>";
        return;
      }

      // Listar cada produto
      produtos.forEach((produto) => {
        console.log(`Produto: Nome=${produto.nome}, Preço=${produto.preco}`);
        const li = document.createElement("li");
        li.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        listaProdutos.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Erro ao listar produtos:", error.message);
      alert("Erro ao listar produtos: " + error.message);
    });
});
