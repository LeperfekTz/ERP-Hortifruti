// Lidar com o envio do formulário de cadastro de produtos
const formCadastrarProduto = document.getElementById("form-cadastrar-produto");
formCadastrarProduto.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);

  // Chamar a função do backend para adicionar o produto
  window.api
    .adicionarProduto(nome, preco)
    .then((message) => {
      alert(message);
      // Opcional: Limpar o formulário após o cadastro
      formCadastrarProduto.reset();
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Lidar com o clique para listar produtos
const btnListarProdutos = document.getElementById("btn-listar-produtos");
btnListarProdutos.addEventListener("click", () => {
  // Chamar a função do backend para obter os produtos
  window.api
    .obterProdutos()
    .then((produtos) => {
      const listaProdutos = document.getElementById("lista-produtos");
      listaProdutos.innerHTML = ""; // Limpar a lista antes de adicionar novos itens

      produtos.forEach((produto) => {
        const li = document.createElement("li");
        li.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        listaProdutos.appendChild(li);
      });
    })
    .catch((error) => {
      alert("Erro ao listar produtos: " + error.message);
    });
});
