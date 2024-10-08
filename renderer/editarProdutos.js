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
            "<tr><td colspan='6'>Nenhum produto cadastrado.</td></tr>"; // Atualizado para 6
          return;
        }

        // Listar cada produto
        produtos.forEach((produto) => {
          console.log(
            `Produto: Nome=${produto.nome}, Categoria=${produto.categoria}, Quantidade=${produto.quantidade}, Preço=${produto.preco}, Unidade=${produto.unidade}`
          );
          const row = tabelaProdutos.insertRow();
          row.insertCell(
            0
          ).innerHTML = `<input type="text" value="${produto.nome}" data-id="${produto.id}" class="edit-nome">`;
          row.insertCell(
            1
          ).innerHTML = `<input type="text" value="${produto.categoria}" data-id="${produto.id}" class="edit-categoria">`;
          row.insertCell(
            2
          ).innerHTML = `<input type="number" value="${produto.quantidade}" data-id="${produto.id}" class="edit-quantidade">`;
          row.insertCell(
            3
          ).innerHTML = `<input type="number" step="0.01" value="${produto.preco}" data-id="${produto.id}" class="edit-preco">`;
          row.insertCell(
            4
          ).innerHTML = `<input type="text" value="${produto.unidade}" data-id="${produto.id}" class="edit-unidade">`; // Nova entrada para unidade

          const saveButton = document.createElement("button");
          saveButton.textContent = "Salvar";
          saveButton.addEventListener("click", () => {
            const id = row.querySelector(".edit-nome").getAttribute("data-id");
            const nome = row.querySelector(".edit-nome").value;
            const categoria = row.querySelector(".edit-categoria").value;
            const quantidade = parseInt(
              row.querySelector(".edit-quantidade").value,
              10
            );
            const preco = parseFloat(row.querySelector(".edit-preco").value);
            const unidade = row.querySelector(".edit-unidade").value; // Adicionado

            if (nome && categoria && quantidade >= 0 && preco >= 0 && unidade) {
              window.api
                .editarProduto(id, nome, preco, quantidade, categoria, unidade) // Atualizado
                .then((message) => {
                  alert(message);
                  listarProdutos(); // Atualizar a lista de produtos após edição
                })
                .catch((error) => {
                  console.error("Erro ao editar produto:", error.message);
                  alert("Erro ao editar produto: " + error.message);
                });
            } else {
              alert(
                "Todos os campos são obrigatórios e devem ter valores válidos."
              );
            }
          });
          row.insertCell(5).appendChild(saveButton); // Atualizado para 5

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
          row.insertCell(6).appendChild(deleteButton); // Atualizado para 6
        });
      })
      .catch((error) => {
        console.error("Erro ao listar produtos:", error.message);
        alert("Erro ao listar produtos: " + error.message);
      });
  }

  // Listar produtos ao carregar a página
  listarProdutos();
});
