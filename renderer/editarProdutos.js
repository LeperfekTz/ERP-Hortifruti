// Executar o código após o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", function () {
  const voltarBtn = document.getElementById("voltar-btn");

  // Lidar com o clique no botão Voltar
  voltarBtn.addEventListener("click", () => {
    window.close(); // Fecha a janela atual
  });

  // Função para listar produtos
  function listarProdutos() {
    console.log("Listando produtos");

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
            "<tr><td colspan='5'>Nenhum produto cadastrado.</td></tr>";
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
          row.insertCell(3).textContent =
            "R$ " + (produto.preco || 0).toFixed(2);

          const editButton = document.createElement("button");
          editButton.textContent = "Editar";
          editButton.addEventListener("click", () => {
            // Abrir o modal ou formulário para edição do produto
            abrirFormularioEdicao(produto);
          });
          row.insertCell(4).appendChild(editButton);

          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Excluir";
          deleteButton.addEventListener("click", () => {
            if (confirm("Tem certeza de que deseja excluir este produto?")) {
              window.api
                .excluirProduto(produto.id)
                .then((message) => {
                  alert(message);
                  listarProdutos(); // Atualizar a lista de produtos após exclusão
                })
                .catch((error) => {
                  console.error("Erro ao excluir produto:", error.message);
                  alert("Erro ao excluir produto: " + error.message);
                });
            }
          });
          row.insertCell(5).appendChild(deleteButton);
        });
      })
      .catch((error) => {
        console.error("Erro ao listar produtos:", error.message);
        alert("Erro ao listar produtos: " + error.message);
      });
  }

  // Função para abrir o formulário de edição
  function abrirFormularioEdicao(produto) {
    const nome = prompt("Nome do produto:", produto.nome);
    const preco = prompt("Preço do produto:", produto.preco);
    const quantidade = prompt("Quantidade do produto:", produto.quantidade);
    const categoria = prompt("Categoria do produto:", produto.categoria);

    if (nome && preco && quantidade && categoria) {
      window.api
        .editarProduto(
          produto.id,
          nome,
          parseFloat(preco),
          parseInt(quantidade),
          categoria
        )
        .then((message) => {
          alert(message);
          listarProdutos(); // Atualizar a lista de produtos após edição
        })
        .catch((error) => {
          console.error("Erro ao editar produto:", error.message);
          alert("Erro ao editar produto: " + error.message);
        });
    } else {
      alert("Todos os campos são obrigatórios.");
    }
  }

  // Listar produtos ao carregar a página
  listarProdutos();
});
