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
