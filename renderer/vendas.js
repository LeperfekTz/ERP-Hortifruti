// Lidar com o envio do formulário de registro de venda
const formRegistrarVenda = document.getElementById("form-registrar-venda");

formRegistrarVenda.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("Formulário de registro de venda enviado.");

  const produtoId = document.getElementById("produto").value;
  const quantidade = parseInt(document.getElementById("quantidade").value, 10);

  console.log(
    `Dados da venda: ProdutoID=${produtoId}, Quantidade=${quantidade}`
  );

  // Verificar se produtoId e quantidade são válidos
  if (!produtoId || isNaN(quantidade) || quantidade <= 0) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  // Chamar a função do backend para registrar a venda
  window.api
    .registrarVenda(produtoId, quantidade)
    .then((message) => {
      console.log("Venda registrada com sucesso:", message);
      alert(message);
      // Limpar o formulário após o registro
      formRegistrarVenda.reset();
      atualizarProdutos(); // Atualizar a lista de produtos após o registro
    })
    .catch((error) => {
      // Exibir apenas a mensagem de erro amigável
      let errorMessage = error.message;

      // Personalizar a mensagem para casos específicos
      if (errorMessage.includes("Quantidade insuficiente em estoque")) {
        errorMessage = "Fora de estoque";
      }

      console.error("Erro ao registrar a venda:", error.message);
      alert(errorMessage); // O alerta mostrará apenas a mensagem personalizada
    });
});

// Função para atualizar o select com os produtos disponíveis
function atualizarProdutos() {
  window.api
    .obterProdutos()
    .then((produtos) => {
      console.log("Produtos retornados do backend:", produtos);
      const selectProduto = document.getElementById("produto");
      const listaProdutosVenda = document.getElementById(
        "lista-produtos-venda"
      );

      selectProduto.innerHTML = ""; // Limpar opções anteriores
      listaProdutosVenda.innerHTML = ""; // Limpar lista anterior

      if (produtos.length === 0) {
        console.log("Nenhum produto cadastrado.");
        selectProduto.innerHTML =
          "<option value=''>Nenhum produto disponível</option>";
        listaProdutosVenda.innerHTML = "<li>Nenhum produto disponível</li>";
        return;
      }

      // Atualizar o select e a lista de produtos
      produtos.forEach((produto) => {
        // Adicionar ao <select>
        const option = document.createElement("option");
        option.value = produto.id; // Certifique-se de que a propriedade id existe
        option.textContent = produto.nome;
        selectProduto.appendChild(option);

        // Adicionar à lista
        const listItem = document.createElement("li");
        listItem.textContent = `${produto.nome} - Quantidade: ${
          produto.quantidade || "Não disponível"
        }`;
        listaProdutosVenda.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Erro ao obter produtos:", error.message);
      alert("Erro ao obter produtos: " + error.message);
    });
}

// Atualizar a lista de produtos quando a página for carregada
document.addEventListener("DOMContentLoaded", atualizarProdutos);
