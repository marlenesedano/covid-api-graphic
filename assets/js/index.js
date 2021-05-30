const baseUrl = "https://api.covid19api.com";
const summaryUrl = `${baseUrl}/summary`;

/* 
    - Ao concatenar strings, crie uma constante e dê um nome que represente sua utilidade
    - Separe diferentes contextos por uma linha em branco
    - Crie funções com responsabilidade únicas
*/

Number.prototype.format = function () {
  return this ? this.toLocaleString("pt-BR") : "-";
};

function updateKPIs() {
  fetch(summaryUrl)
    .then((r) => r.json())
    .then((summary) => {
      const confirmed = document.getElementById("confirmed");
      confirmed.innerHTML = summary.Global.TotalConfirmed.format();

      const death = document.getElementById("death");
      death.innerHTML = summary.Global.TotalDeaths.format();

      const recovered = document.getElementById("recovered");
      recovered.innerHTML = summary.Global.TotalRecovered.format();

      const dateElement = document.getElementById("date");
      const updateDate = new Date(summary.Global.Date);
      const formatedDate = moment(updateDate).format("DD.MM.YYYY HH:mm");
      dateElement.innerHTML += " " + formatedDate;
    });
}

function topDeaths() {
  fetch(summaryUrl)
    .then((r) => r.json())
    .then((summary) => {
      const barChart = document.getElementById("barras").getContext("2d");
      summary.Countries.sort((country, nextCountry) => {
        if (country.TotalDeaths < nextCountry.TotalDeaths) {
          return 1;
        }
        if (country.TotalDeaths > nextCountry.TotalDeaths) {
          return -1;
        }
        return 0;
      });

      const countries = summary.Countries.slice(0, 10).map((country) => {
        return country.Country;
      });
      const deathsResult = summary.Countries.slice(0, 10).map((country) => {
        return country.TotalDeaths;
      });
      new Chart(barChart, {
        type: "bar",
        data: {
          labels: countries,
          datasets: [
            {
              label: "Total de Mortes por país - TOP 10",
              data: deathsResult,
              backgroundColor: "#7209b7",
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
    });
}

function caseDistribution() {
  fetch(summaryUrl)
    .then((r) => r.json())
    .then((summary) => {
      const barChart = document.getElementById("pizza").getContext("2d");

      const data = {
        labels: ["Confirmados", "Recuperados", "Mortes"],
        datasets: [
          {
            data: [
              summary.Global.NewConfirmed,
              summary.Global.NewRecovered,
              summary.Global.NewDeaths,
            ],
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(54, 162, 235)",
              "rgb(255, 205, 86)",
            ],
            hoverOffset: 4,
          },
        ],
      };

      new Chart(barChart, {
        type: "pie",
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Distribuição de novos casos",
            },
          },
        },
      });
    });
}

updateKPIs();
topDeaths();
caseDistribution();
