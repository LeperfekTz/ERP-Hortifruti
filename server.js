const express = require("express");
const app = express();
const port = 3001; // Mude para 3001 ou outra porta disponível
const PORT = process.env.PORT || 3001; // Mude para 3001

app.use(express.json()); // Para lidar com JSON

// Rotas
app.post("/api/login", (req, res) => {
  // Lógica de autenticação
  res.send("Login bem-sucedido");
});

// Outras rotas podem ser definidas aqui

app.listen(port, () => {
  console.log(`Servidor HTTP rodando na porta ${port}`);
});
