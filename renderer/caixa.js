// caixa.js

// Variável para armazenar o valor de abertura
let valorAbertura = 0;

// Simulação de vendas (pode ser substituído pela lógica de banco de dados)
let vendas = [];

// Função para abrir caixa
function abrirCaixa(valor) {
  valorAbertura = valor; // Armazenar o valor de abertura
  console.log(`Caixa aberto com o valor de R$ ${valorAbertura}`);
  exibirValorAbertura(); // Chamar a função para exibir o valor
}

// Função para mostrar o valor da abertura na interface
function exibirValorAbertura() {
  const valorAberturaDisplay = document.getElementById("valor-abertura");
  if (valorAberturaDisplay) {
    valorAberturaDisplay.textContent = `Valor de Abertura: R$ ${valorAbertura.toFixed(
      2
    )}`;
  }
}

// Função para calcular o total de vendas
function calcularTotalVendas() {
  return vendas.reduce((total, venda) => total + venda.total, 0);
}

// Função para fechar caixa
function fecharCaixa() {
  const totalVendas = calcularTotalVendas();
  const valorFinal = valorAbertura + totalVendas;
  exibirResumoCaixa(valorFinal, totalVendas);
}

// Função para exibir o resumo do caixa no modal
function exibirResumoCaixa(valorFinal, totalVendas) {
  document.getElementById("resumo-modal").style.display = "block";
  document.getElementById(
    "valor-inicial"
  ).textContent = `Valor Inicial: R$ ${valorAbertura.toFixed(2)}`;
  document.getElementById(
    "total-vendas"
  ).textContent = `Total de Vendas: R$ ${totalVendas.toFixed(2)}`;
  document.getElementById(
    "valor-final"
  ).textContent = `Valor Final: R$ ${valorFinal.toFixed(2)}`;
}

// Função para adicionar uma venda ao histórico
function adicionarVenda(id, produto, quantidade, total) {
  const venda = {
    id,
    produto,
    quantidade,
    total,
    data: new Date().toLocaleString(),
  };
  vendas.push(venda);
  atualizarHistorico();
}

// Função para atualizar a tabela de histórico
function atualizarHistorico() {
  const tbody = document
    .getElementById("historico-vendas")
    .querySelector("tbody");
  tbody.innerHTML = ""; // Limpa a tabela existente

  vendas.forEach((venda) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${venda.id}</td>
            <td>${venda.produto}</td>
            <td>${venda.quantidade}</td>
            <td>R$ ${venda.total.toFixed(2)}</td>
            <td>${venda.data}</td>
        `;
    tbody.appendChild(tr);
  });
}

// Adiciona evento ao botão de abrir caixa
document.getElementById("abrir-btn").addEventListener("click", () => {
  const valorInput = parseFloat(document.getElementById("valor").value);
  if (!isNaN(valorInput) && valorInput > 0) {
    abrirCaixa(valorInput);
  } else {
    alert("Por favor, insira um valor válido.");
  }
});

// Adiciona evento ao botão de fechar caixa
document.getElementById("fechar-btn").addEventListener("click", fecharCaixa);

// Adiciona evento para fechar o modal quando clicar no "X"
document.querySelector(".close-button").addEventListener("click", () => {
  document.getElementById("resumo-modal").style.display = "none";
});

// Para teste, adicione uma venda (remova isso na versão final)
adicionarVenda(1, "Produto A", 2, 10.0);
adicionarVenda(2, "Produto B", 1, 15.5);
