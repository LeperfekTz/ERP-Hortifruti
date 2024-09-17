// Função para carregar os produtos no formulário de venda
function carregarProdutos() {
  window.api
    .obterProdutos()
    .then((produtos) => {
      const selectProduto = document.getElementById("produto");
      const listaProdutosVenda = document.getElementById(
        "lista-produtos-venda"
      );

      selectProduto.innerHTML = ""; // Limpar o select antes de adicionar novos itens
      listaProdutosVenda.innerHTML = ""; // Limpar a lista antes de adicionar novos itens

      produtos.forEach((produto) => {
        // Adicionar produto ao select
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        selectProduto.appendChild(option);

        // Adicionar produto à lista de produtos disponíveis
        const li = document.createElement("li");
        li.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        listaProdutosVenda.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Erro ao obter produtos:", error);
    });
}

// Função para registrar uma nova venda
document
  .getElementById("form-registrar-venda")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const produtoId = document.getElementById("produto").value;
    const quantidade = parseInt(
      document.getElementById("quantidade").value,
      10
    );

    window.api.obterProdutos().then((produtos) => {
      const produto = produtos.find((p) => p.id == produtoId);
      if (produto) {
        const valorTotal = produto.preco * quantidade;

        // Registrar a venda no backend
        window.api
          .registrarVenda(produtoId, quantidade, valorTotal)
          .then((message) => {
            alert(message);
            document.getElementById("form-registrar-venda").reset();
          })
          .catch((error) => {
            alert("Erro ao registrar venda: " + error.message);
          });
      }
    });
  });

// Carregar produtos quando a página é carregada
document.addEventListener("DOMContentLoaded", carregarProdutos);
