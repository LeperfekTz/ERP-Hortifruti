document.addEventListener("DOMContentLoaded", () => {
  const listaCategorias = document.getElementById("listaCategorias");

  // Função para listar as categorias existentes
  function listarCategorias() {
    window.api
      .obterCategorias()
      .then((categorias) => {
        listaCategorias.innerHTML = ""; // Limpa a lista antes de adicionar novamente
        categorias.forEach((categoria) => {
          const li = document.createElement("li");
          li.textContent = categoria.nome;

          // Botão para excluir a categoria
          const excluirBtn = document.createElement("button");
          excluirBtn.textContent = "Excluir";
          excluirBtn.addEventListener("click", () => {
            if (
              confirm(
                `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`
              )
            ) {
              window.api
                .excluirCategoria(categoria.id)
                .then(() => {
                  alert("Categoria excluída com sucesso!");
                  listarCategorias(); // Atualiza a lista
                })
                .catch((erro) =>
                  console.error("Erro ao excluir categoria:", erro)
                );
            }
          });

          li.appendChild(excluirBtn);
          listaCategorias.appendChild(li);
        });
      })
      .catch((erro) => console.error("Erro ao listar categorias:", erro));
  }

  // Chama a função para listar categorias ao carregar a página
  listarCategorias();

  // Adicionar nova categoria
  document
    .getElementById("adicionarCategoriaBtn")
    .addEventListener("click", () => {
      const nomeCategoria = document
        .getElementById("nomeCategoriaInput")
        .value.trim();

      if (nomeCategoria === "") {
        alert("O nome da categoria não pode estar vazio.");
      } else {
        window.api
          .adicionarCategoria(nomeCategoria)
          .then(() => {
            alert("Categoria adicionada com sucesso!");
            document.getElementById("nomeCategoriaInput").value = ""; // Limpa o campo
            listarCategorias(); // Atualiza a lista
          })
          .catch((erro) => console.error("Erro ao adicionar categoria:", erro));
      }
    });

  // Voltar à página anterior
  document.getElementById("voltarBtn").addEventListener("click", () => {
    window.api.abrirJanelaPrincipal(); // Função para voltar à página principal
  });
});
