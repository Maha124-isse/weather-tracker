const apiKey = '6f6bca4ad5e5cce6eed9e1953a55d542';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const windElement = document.getElementById('wind');
const precipitationElement = document.getElementById('precipitation');

searchButton.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        fetchWeather(location);
    }
});

function fetchWeather(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            locationElement.textContent = data.name || 'Unknown location';
            temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
            descriptionElement.textContent = data.weather?.[0]?.description || 'No description';

            // Wind speed
            windElement.textContent = data.wind?.speed !== undefined
                ? `${data.wind.speed.toFixed(1)} m/s`
                : 'No wind data';

            // Precipitation (rain or snow in last hour)
            const rain = data.rain?.['1h'] || 0;
            const snow = data.snow?.['1h'] || 0;
            const totalPrecip = rain + snow;
            precipitationElement.textContent = totalPrecip > 0
                ? `${totalPrecip} mm in last hour`
                : 'No precipitation';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            locationElement.textContent = 'Error fetching data';
            temperatureElement.textContent = '-';
            descriptionElement.textContent = '-';
            windElement.textContent = '-';
            precipitationElement.textContent = '-';
        });
}

