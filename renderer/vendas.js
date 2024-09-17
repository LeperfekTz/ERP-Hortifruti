document.addEventListener("DOMContentLoaded", () => {
  const formRegistrarVenda = document.getElementById("form-registrar-venda");
  const selectProduto = document.getElementById("produto");

  // Carregar produtos no select
  window.api
    .obterProdutos()
    .then((produtos) => {
      produtos.forEach((produto) => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = produto.nome;
        selectProduto.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos:", error.message);
    });

  // Lidar com o envio do formulário
  formRegistrarVenda.addEventListener("submit", (e) => {
    e.preventDefault();

    const produtoId = parseInt(selectProduto.value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    window.api
      .registrarVenda(produtoId, quantidade)
      .then((message) => {
        alert(message);
        formRegistrarVenda.reset();
      })
      .catch((error) => {
        console.error("Erro ao registrar venda:", error.message);
        alert(error.message);
      });
  });
});
