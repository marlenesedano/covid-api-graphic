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
  const queryParams = `from=${from}&to=${to}`;
  const url = `${baseUrl}/country/${country}?${queryParams}`;

  const response = await fetch(url);
  const countryList = await response.json();

  return countryList.reduce(
    (sum, country) => {
      return {
        confirmed: sum.confirmed + country.Confirmed,
        deaths: sum.deaths + country.Deaths,
        recovered: sum.recovered + country.Recovered,
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
  from = moment(from, "yyyy-MM-dd")
    .subtract(1, "days")
    .format("yyyy-MM-DDTHH:mm:ss");
  console.log(from);
  const queryParams = `from=${from}&to=${to}`;
  const url = `${baseUrl}/country/${country}?${queryParams}`;

  const response = await fetch(url);
  const countryList = await response.json();

  const dates = countryList.slice(0, 30).map((country) => {
    return moment(new Date(country.Date)).format("yyyy-MM-DD");
  });

  const quantities = countryList.slice(0, 30).map((country) => {
    return country[status];
  });

  const options = {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Curva diária de Covid-19",
          data: quantities,
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
  };

  if (!chart) {
    chart = new Chart(lineChart, options);
  } else {
    chart.options = options;
  }
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
