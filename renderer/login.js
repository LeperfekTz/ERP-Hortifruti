document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const resultado = await window.api.login(email, senha);
      console.log(resultado);
      
      // Redirecionar para a tela principal
      // Para Electron, você pode usar:
      window.location.href = "index.html"; // Use um caminho relativo

      // Ocultar a tela de login e mostrar o cabeçalho
      // document.getElementById("login-screen").style.display = "none";
      // document.getElementById("main-header").style.display = "block";
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      document.getElementById("login-error").textContent = error.message;
      document.getElementById("login-error").style.display = "block"; // Mostra a mensagem de erro
    }
  });
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("email").addEventListener("input", function () {
    let input = this.value;
    let list = document.getElementById("email-autocomplete-list");
    list.innerHTML = ""; // Limpa as sugestões anteriores

    if (input.length === 0) {
      list.style.display = "none"; // Esconde a lista se não houver input
      return; // Se o campo estiver vazio, não faça nada
    }

    const suggestion = `${input}@gmail.com`;

    let item = document.createElement("li");
    item.textContent = suggestion;
    item.addEventListener("click", function () {
      document.getElementById("email").value = suggestion;
      list.innerHTML = ""; // Limpa a lista após a seleção
      list.style.display = "none"; // Esconde a lista após a seleção
    });
    list.appendChild(item);

    // Ajusta a altura da lista com base no número de itens
    if (list.children.length > 0) {
      list.style.display = "block"; // Exibe a lista
      const itemHeight = 40; // Defina a altura de cada item
      const maxVisibleItems = 5; // Número máximo de itens visíveis
      const itemCount = Math.min(list.children.length, maxVisibleItems);
      list.style.height = `${itemHeight * itemCount}px`; // Ajusta a altura
    } else {
      list.style.display = "none"; // Esconde a lista se não houver sugestões
    }
  });
});

