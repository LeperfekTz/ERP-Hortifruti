const { ipcRenderer } = require("electron");

// Função para login
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    ipcRenderer.invoke("login", username, password).then((isValid) => {
      if (isValid) {
        window.location.href = "dashboard.html"; // Redireciona para a tela principal
      } else {
        alert("Usuário ou senha inválidos");
      }
    });
  });
