const apiKey = '31cc1c0b79c50525deed610ccf45f23c'; 
const getLocationBtn = document.getElementById('get-location-btn');
const weatherInfoDiv = document.getElementById('weather');
const forecastInfoDiv = document.getElementById('forecast-info');

// Handle button click
getLocationBtn.addEventListener('click', getCurrentLocation);
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherData(lat, lon);
            getForecastData(lat, lon);
        }, error => {
            console.error('Error getting location:', error);
            weatherInfoDiv.innerHTML = `<p style="color: yellow;">Error: ${error.message}</p>`;
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Fetch current weather
function getWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Weather response:", data); // Debug
            if (data.cod !== 200) {
                weatherInfoDiv.innerHTML = `<p style="color: yellow;">Error: ${data.message}</p>`;
                return;
            }
            displayWeatherData(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Display current weather
function displayWeatherData(data) {
    const weatherHtml = `
        <h2>Current Weather</h2>
        <p><b>Location:</b> ${data.name}</p>
        <p><b>Temperature:</b> ${data.main.temp}°C</p>
        <p><b>Conditions:</b> ${data.weather[0].description}</p>
    `;
    weatherInfoDiv.innerHTML = weatherHtml;
}

// Fetch forecast data
function getForecastData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Forecast response:", data); // Debug
            if (data.cod !== "200") {  // forecast API returns string "200"
                forecastInfoDiv.innerHTML = `<p style="color: yellow;">Error: ${data.message}</p>`;
                return;
            }
            displayForecastData(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

// Display forecast
function displayForecastData(data) {
    let forecastHtml = `<h2>5-Day Forecast</h2>`;
    data.list.forEach((forecast, index) => {
        if (index % 8 === 0) {
            forecastHtml += `
                <p><b>${new Date(forecast.dt * 1000).toLocaleDateString()}</b></p>
                <p>Temperature: ${forecast.main.temp}°C</p>
                <p>Conditions: ${forecast.weather[0].description}</p>
                <hr>
            `;
        }
    });
    forecastInfoDiv.innerHTML = forecastHtml;
}
