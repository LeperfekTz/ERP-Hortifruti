const { ipcRenderer } = require("electron");

// Função para cadastrar o usuário
function cadastrarUsuario(nome, email, senha) {
  ipcRenderer
    .invoke("cadastrar-usuario", nome, email, senha)
    .then((message) => {
      alert(message);
    })
    .catch((error) => {
      alert("Erro ao cadastrar usuário: " + error.message);
    });
}

// Função para adicionar um novo produto
function adicionarProduto(nome, preco) {
  ipcRenderer
    .invoke("adicionar-produto", nome, preco)
    .then((message) => {
      alert(message);
      // Opcional: Limpar o formulário após o cadastro
      document.getElementById("form-cadastrar-produto").reset();
    })
    .catch((error) => {
      alert("Erro ao adicionar produto: " + error.message);
    });
}

// Função para listar todos os produtos
function listarProdutos() {
  ipcRenderer
    .invoke("obter-produtos")
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
}

// Lidar com o envio do formulário de cadastro de produtos
document
  .getElementById("form-cadastrar-produto")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const preco = parseFloat(document.getElementById("preco").value);

    adicionarProduto(nome, preco);
  });

// Lidar com o clique para listar produtos
document.getElementById("btn-listar-produtos").addEventListener("click", () => {
  listarProdutos();
});
// Exemplo de chamada ao manipular cadastro de usuário
document.getElementById("cadastro-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const resultado = await ipcRenderer.invoke("cadastrar-usuario", nome, email, senha);
    console.log(resultado); // Para ver a mensagem de sucesso
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error); // Para ver a mensagem de erro
  }
});

ipcRenderer
  .invoke("excluir-categoria", categoriaId)
  .then((mensagem) => {
    alert(mensagem); // Isso mostrará "Deletado"
  })
  .catch((error) => {
    console.error(error);
  });
