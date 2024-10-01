document.getElementById("abrir-btn").addEventListener("click", () => {
  const valorAbertura = document.getElementById("valor").value;

  window.api
    .abrirCaixa(parseFloat(valorAbertura))
    .then((resposta) => {
      document.getElementById("valor-abertura").textContent = `Valor de Abertura: R$ ${resposta.valor_abertura}`;
    })
    .catch((erro) => {
      console.error("Erro ao abrir o caixa:", erro.message);
    });
});

document.getElementById("fechar-btn").addEventListener("click", () => {
  window.api
    .fecharCaixa()
    .then((resumo) => {
      document.getElementById("valor-inicial").textContent = `Valor Inicial: R$ ${resumo.valor_inicial}`;
      document.getElementById("total-vendas").textContent = `Total de Vendas: R$ ${resumo.total_vendas}`;
      document.getElementById("valor-final").textContent = `Valor Final: R$ ${resumo.valor_final}`;

      document.getElementById("resumo-modal").style.display = "block";
    })
    .catch((erro) => {
      console.error("Erro ao fechar o caixa:", erro.message);
    });
});

window.api
  .obterHistoricoVendas()
  .then((vendas) => {
    const tabelaHistorico = document
      .getElementById("historico-vendas")
      .getElementsByTagName("tbody")[0];
    tabelaHistorico.innerHTML = ""; // Limpar a tabela antes de preencher

    const labels = [];
    const values = [];

    vendas.forEach((venda) => {
      const row = tabelaHistorico.insertRow();
      row.insertCell(0).textContent = venda.id;
      row.insertCell(1).textContent = venda.nomeProd;
      row.insertCell(2).textContent = venda.quantidade;
      row.insertCell(3).textContent = `R$ ${venda.valor_total.toFixed(2)}`;
      row.insertCell(4).textContent = venda.data_venda;

      // Preparar dados para o gráfico
      labels.push(venda.nomeProd);
      values.push(venda.valor_total);
    });

    // Atualizar o gráfico
    renderSalesChart({ labels, values });
  })
  .catch((erro) => {
    console.error("Erro ao carregar histórico de vendas:", erro.message);
  });

function renderSalesChart(data) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  new Chart(ctx, {
    type: "bar", // ou 'line', 'pie', etc.
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Valor Total das Vendas",
          data: data.values,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
