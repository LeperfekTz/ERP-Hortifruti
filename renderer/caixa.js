document.addEventListener("DOMContentLoaded", () => {
  const abrirBtn = document.getElementById("abrir-btn");
  const fecharBtn = document.getElementById("fechar-btn");
  const vendaBtn = document.getElementById("venda-btn"); // Botão de registrar venda
  const valorInput = document.getElementById("valor");
  const valorAberturaDisplay = document.getElementById("valor-abertura");
  const historicoVendasTableBody = document.querySelector(
    "#historico-vendas tbody"
  );

  let valorAbertura = 0;

  // Função para abrir o caixa
  if (abrirBtn) {
    abrirBtn.addEventListener("click", () => {
      const valor = parseFloat(valorInput.value);
      if (!isNaN(valor) && valor > 0) {
        valorAbertura = valor;
        valorAberturaDisplay.textContent = `Valor de Abertura: R$ ${valorAbertura.toFixed(
          2
        )}`;
        window.api
          .abrirCaixa(valor)
          .then(() => {
            alert("Caixa aberto com sucesso!");
            listarHistoricoVendas(); // Atualiza o histórico ao abrir o caixa
          })
          .catch((error) => {
            console.error("Erro ao abrir caixa:", error);
          });
      } else {
        alert("Digite um valor válido para abertura do caixa.");
      }
    });
  }

  // Função para fechar o caixa
  if (fecharBtn) {
    fecharBtn.addEventListener("click", () => {
      window.api
        .fecharCaixa()
        .then(() => {
          mostrarResumoCaixa();
        })
        .catch((error) => {
          console.error("Erro ao fechar caixa:", error);
        });
    });
  }

  // Função para registrar a venda
  if (vendaBtn) {
    vendaBtn.addEventListener("click", () => {
      const produtoId = document.getElementById("produto").value; // Campo para ID do produto
      const quantidade = parseInt(
        document.getElementById("quantidade").value,
        10
      ); // Campo para quantidade

      if (produtoId && quantidade > 0) {
        window.api
          .registrarVenda(produtoId, quantidade)
          .then((message) => {
            alert(message);
            listarHistoricoVendas(); // Atualiza o histórico após registrar a venda
          })
          .catch((error) => {
            console.error("Erro ao registrar venda:", error);
            alert(error.message); // Mostra mensagem de erro para o usuário
          });
      } else {
        alert("Preencha todos os campos corretamente.");
      }
    });
  }

  // Função para mostrar o resumo do caixa
  function mostrarResumoCaixa() {
    const valorFinal = valorAbertura; // Aqui você pode calcular o valor final com base nas vendas

    // Atualiza o modal com o resumo
    document.getElementById(
      "valor-inicial"
    ).textContent = `Valor Inicial: R$ ${valorAbertura.toFixed(2)}`;
    document.getElementById(
      "total-vendas"
    ).textContent = `Total de Vendas: R$ 0.00`; // Calcule o total de vendas conforme necessário
    document.getElementById(
      "valor-final"
    ).textContent = `Valor Final: R$ ${valorFinal.toFixed(2)}`;

    // Exibir o modal
    const modal = document.getElementById("resumo-modal");
    modal.style.display = "block";

    // Adiciona evento para fechar o modal
    const closeButton = document.querySelector(".close-button");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    // Fechar o modal quando clicar fora dele
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // Função para listar histórico de vendas
  function listarHistoricoVendas() {
    window.api
      .obterHistoricoVendas()
      .then((vendas) => {
        console.log("Dados de vendas:", vendas); // Para verificar a estrutura dos dados
        historicoVendasTableBody.innerHTML = ""; // Limpa a tabela antes de adicionar os novos dados
        vendas.forEach((venda) => {
          // Aqui, assume-se que venda.data_venda é uma string em um formato válido.
          const dataVenda = new Date(venda.data_venda); // Converte a string de data para um objeto Date

          // Formata a data para exibição
          const dataFormatada = dataVenda.toLocaleString("pt-BR", {
            year: "numeric", // Exibe o ano com 4 dígitos
            month: "2-digit", // Exibe o mês com 2 dígitos
            day: "2-digit", // Exibe o dia com 2 dígitos
            hour: "2-digit", // Exibe a hora com 2 dígitos
            minute: "2-digit", // Exibe os minutos com 2 dígitos
            second: "2-digit", // Exibe os segundos com 2 dígitos
            hour12: false, // Exibe a hora no formato 24 horas
          });

          const tr = document.createElement("tr");
          tr.innerHTML = `
        <td>${venda.id}</td>
        <td>${venda.nomeProd}</td>
        <td>${venda.quantidade}</td>
        <td>R$ ${venda.valor_total.toFixed(2)}</td>
        <td>${dataFormatada}</td> <!-- Exibe a data formatada -->
      `;
          historicoVendasTableBody.appendChild(tr);
        });
      })
      .catch((error) => {
        console.error("Erro ao obter histórico de vendas:", error);
      });
  }

  // Carregar o histórico de vendas ao abrir a página
  listarHistoricoVendas();
});
