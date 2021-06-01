const baseUrl = "https://api.covid19api.com";
const comboCountries = document.getElementById("cmbCountry");
const dataStart = document.getElementById("date_start");
const dataEnd = document.getElementById("date_end");
const comboData = document.getElementById("cmbData");
const lineChart = document.getElementById("linhas").getContext("2d");
let chart = null;

Number.prototype.format = function () {
  return this ? this.toLocaleString("pt-BR") : "-";
};

function updateCountries() {
  const url = "https://api.covid19api.com/countries";
  fetch(url)
    .then((r) => r.json())
    .then((response) => {
      response.forEach((country) => {
        let option = document.createElement("option");
        option.innerHTML = country.Country;
        option.value = country.Slug;
        comboCountries.appendChild(option);
      });

      comboCountries.value = "brazil";
      dataStart.value = moment().subtract(20, "days").format("yyyy-MM-DD");
      dataEnd.value = moment().subtract(1, "days").format("yyyy-MM-DD");
    });
}

async function countryAllStatus(country, from, to) {
  from = moment(from, "yyyy-MM-DD")
    .subtract(1, "days")
    .format("yyyy-MM-DDTHH:mm:ss");

  const queryParams = `from=${from}&to=${to}`;
  const url = `${baseUrl}/country/${country}?${queryParams}`;

  const response = await fetch(url);
  const countryList = await response.json();

  const data = countryList.map(
    (country, index) => {
      return {
        confirmed:
          country.Confirmed -
          (index - 1 >= 0 ? countryList[index - 1].Confirmed : 0),
        deaths:
          country.Deaths - (index - 1 >= 0 ? countryList[index - 1].Deaths : 0),
        recovered:
          country.Recovered -
          (index - 1 >= 0 ? countryList[index - 1].Recovered : 0),
      };
    },
    {
      confirmed: 0,
      deaths: 0,
      recovered: 0,
    }
  );

  return data.slice(1).reduce(
    (sum, country) => {
      return {
        confirmed: sum.confirmed + country.confirmed,
        deaths: sum.deaths + country.deaths,
        recovered: sum.recovered + country.recovered,
      };
    },
    {
      confirmed: 0,
      deaths: 0,
      recovered: 0,
    }
  );
}

async function graphic(from, to, country, status) {
  console.log(status);
  from = moment(from, "yyyy-MM-DD")
    .subtract(1, "days")
    .format("yyyy-MM-DDTHH:mm:ss");

  const queryParams = `from=${from}&to=${to}`;
  const url = `${baseUrl}/country/${country}?${queryParams}`;

  const response = await fetch(url);
  const countryList = await response.json();

  const dates = countryList.slice(1, 31).map((country) => {
    return moment(new Date(country.Date)).format("yyyy-MM-DD");
  });

  const quantities = countryList
    .slice(0, 31)
    .map((country, index) => {
      if (index - 1 < 0) {
        return country[status];
      }

      return country[status] - countryList[index - 1][status];
    })
    .slice(1, 31);

  const avg =
    quantities.reduce((sum, value) => sum + value, 0) / quantities.length;

  const avgLines = Array(quantities.length).fill(avg);

  const i18n = {
    Confirmed: "Confirmados",
    Deaths: "Mortes",
    Recovered: "Recuperados",
  };

  const options = {
    type: "line",
    label: "terfytv",
    data: {
      labels: dates,
      datasets: [
        {
          label: `Número diário de ${i18n[status]}`,
          data: quantities,
          backgroundColor: "#7209b7",
          borderWidth: 1,
        },
        {
          label: `Média de ${i18n[status]}`,
          data: avgLines,
          backgroundColor: "#7209",
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
  };

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(lineChart, options);
}

async function routes() {
  const confirmed = document.getElementById("kpiconfirmed");
  const deaths = document.getElementById("kpideaths");
  const recovered = document.getElementById("kpirecovered");
  const from = `${dataStart.value}T00:00:00Z`;
  const to = `${dataEnd.value}T23:59:59Z`;
  const country = comboCountries.value;

  const result = await countryAllStatus(country, from, to);

  confirmed.innerHTML = result.confirmed.format();
  deaths.innerHTML = result.deaths.format();
  recovered.innerHTML = result.recovered.format();
  await graphic(from, to, country, comboData.value);
}

updateCountries();
