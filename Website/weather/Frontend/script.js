const temperatureElement = document.getElementById('temperature');
const weatherElement = document.getElementById('weather');
const windElement = document.getElementById('wind');
const lastUpdatedElement = document.getElementById('lastUpdated');
const ctx = document.getElementById('tempChart').getContext('2d');

const temperatureData = {
  labels: [],
  datasets: [{
    label: 'Temperature (°C)',
    data: [],
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    tension: 0.3,
    fill: true,
  }],
};

const config = {
  type: 'line',
  data: temperatureData,
  options: {
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
        suggestedMin: 0,
        suggestedMax: 30,
      }
    }
  }
};

const tempChart = new Chart(ctx, config);
async function loadSnapshots() {
  try {
    const response = await fetch('http://localhost:3000/api/snapshots?limit=20');
    const data = await response.json();
    if (!data.length) return;

    const last = data[data.length - 1];

    temperatureElement.textContent = `${last.temperature.toFixed(1)} °C`;
    weatherElement.textContent = last.weather;
    windElement.textContent = `${last.wind.toFixed(1)} m/s`;
    lastUpdatedElement.textContent = `Last updated: ${new Date(last.timestamp).toLocaleTimeString()}`;

    temperatureData.labels = data.map(item =>
      new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    temperatureData.datasets[0].data = data.map(item => item.temperature);
    tempChart.update();
  } catch (err) {
    console.error('Error loading cached snapshots:', err);
  }
}

async function fetchAndDisplayWeather() {
  try {
    await fetch('http://localhost:3000/api/fetch-now');

    const response = await fetch('http://localhost:3000/api/snapshots?limit=20');
    const data = await response.json();

    if (!data.length) return;

    const last = data[data.length - 1];

    temperatureElement.textContent = `${last.temperature.toFixed(1)} °C`;
    weatherElement.textContent = last.weather;
    windElement.textContent = `${last.wind.toFixed(1)} m/s`;
    lastUpdatedElement.textContent = `Last updated: ${new Date(last.timestamp).toLocaleTimeString()}`;

    temperatureData.labels = data.map(item =>
      new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    temperatureData.datasets[0].data = data.map(item => item.temperature);

    tempChart.update();
  } catch (err) {
    console.error('Error:', err);
  }
}

const updateButton = document.getElementById('updateButton');

window.addEventListener('DOMContentLoaded', () => {
  loadSnapshots();
  updateButton.addEventListener('click', fetchAndDisplayWeather);
});

