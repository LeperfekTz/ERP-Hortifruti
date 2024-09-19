document.getElementById("btn-gerar-relatorio").addEventListener("click", () => {
  window.api
    .obterRelatorioVendas()
    .then((vendas) => {
      const tabelaRelatorio = document
        .getElementById("tabela-relatorio")
        .getElementsByTagName("tbody")[0];
      tabelaRelatorio.innerHTML = ""; // Limpar tabela antes de preencher

      const labels = [];
      const values = [];

      vendas.forEach((venda) => {
        const row = tabelaRelatorio.insertRow();
        row.insertCell(0).textContent = venda.produto;
        row.insertCell(1).textContent = venda.categoria;
        row.insertCell(2).textContent = venda.data_venda;
        row.insertCell(3).textContent = venda.total_quantidade;
        row.insertCell(4).textContent = "R$" + venda.valor_total.toFixed(2);

        
        // Preparar dados para o gráfico
        labels.push(venda.produto);
        values.push(venda.valor_total);
      });

      // Atualizar o gráfico
      renderSalesChart({ labels, values });
    })
    .catch((error) => {
      console.error("Erro ao carregar relatório de vendas:", error.message);
    });
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
