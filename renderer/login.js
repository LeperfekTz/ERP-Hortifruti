document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const resultado = await window.api.login(email, senha);
      console.log(resultado);
      window.location.href =
        "/home/leperfekt/Documents/ERP-Hortifruti/renderer/index.html"; // Correção feita aqui
      //document.getElementById("login-screen").style.display = "none"; // Oculta a tela de login
      //document.getElementById("main-header").style.display = "block"; // Mostra o cabeçalho principal
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      document.getElementById("login-error").textContent = error.message;
      document.getElementById("login-error").style.display = "block"; // Mostra a mensagem de erro
    }

  });
