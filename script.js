const apiKey = '31cc1c0b79c50525deed610ccf45f23c';
const temperatureDiv = document.getElementById('temperature');
const conditionDiv = document.getElementById('condition');
const locationDiv = document.getElementById('location');
const weatherIconDiv = document.getElementById('weather-icon');
const dateTimeDiv = document.getElementById('date-time');
const forecastInfoDiv = document.getElementById('forecast-info');
// Highlights
const uvDiv = document.getElementById('uv');
const windDiv = document.getElementById('wind');
const sunriseDiv = document.getElementById('sunrise');
const sunsetDiv = document.getElementById('sunset');
const humidityDiv = document.getElementById('humidity');
const visibilityDiv = document.getElementById('visibility');
const airQualityDiv = document.getElementById('air-quality');

// Loading div
const loadingDiv = document.getElementById("loading");
const weatherIcons = {
    Clear: "☀️", 
    Clouds: "⛅",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️"
};

// Default location 
const defaultLat = 33.6952;
const defaultLon = 73.0581;

let dateInterval = null; //  clear previous interval in updateDateTime
window.addEventListener('load', getCurrentLocation);

function getCurrentLocation() {
    if (!navigator.geolocation) {
        locationDiv.innerHTML = "Geolocation not supported — showing WeatherWalay Islamabad (I-9).";
        getWeatherData(defaultLat, defaultLon);
        getForecastData(defaultLat, defaultLon);
        return;
    }
    locationDiv.innerHTML = "Detecting your location...";
    // Request current position with a reasonable timeout
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherData(lat, lon);
            getForecastData(lat, lon);
        },
        error => {
            console.warn('User denied location or error occurred:', error);
            locationDiv.innerHTML = "Showing WeatherWalay Islamabad (I-9) weather";
            getWeatherData(defaultLat, defaultLon);
            getForecastData(defaultLat, defaultLon);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
}

// Fetch current weather
function getWeatherData(lat, lon) {

    loadingDiv.style.display = "flex";

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Robust check: cod might be number or string
            if (!data || parseInt(data.cod) !== 200) {
                // Hide loading and show error
                loadingDiv.style.display = "none";
                locationDiv.innerHTML = `<p style="color: red;">Error: ${data && data.message ? data.message : 'Unable to fetch weather'}</p>`;
                return;
            }
            displayWeatherData(data);
            updateDateTime(data.timezone);
            // Hide loading 
            loadingDiv.style.display = "none";
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            loadingDiv.style.display = "none";
            locationDiv.innerHTML = `<p style="color: red;">Error fetching weather data</p>`;
        });
}

// LEFT PANEL
function displayWeatherData(data) {
    temperatureDiv.innerHTML = `${data.main.temp.toFixed(1)}°C`;
    const condition = data.weather[0].main;
    conditionDiv.innerHTML = data.weather[0].description;
    weatherIconDiv.innerHTML = weatherIcons[condition] || "☀️";
    locationDiv.innerHTML = `${data.name}, ${data.sys.country}`;
    // OpenWeather wind.speed is m/s — convert to km/h for display
    const windKmh = (data.wind && data.wind.speed) ? (data.wind.speed * 3.6).toFixed(1) : "--";
    windDiv.innerHTML = `${windKmh} km/h`;
    humidityDiv.innerHTML = `${data.main.humidity}%`;
    visibilityDiv.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
    sunriseDiv.innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunsetDiv.innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    uvDiv.innerHTML = "N/A"; // Needs One Call API
    airQualityDiv.innerHTML = "N/A"; // Needs Air Pollution API
}

function updateDateTime(timezoneOffset) {
    // Clear previous interval so multiple timers don't accumulate
    if (dateInterval) clearInterval(dateInterval);

    function refreshTime() {
        const now = new Date();
        // Convert to UTC ms, then add location timezone offset (timezoneOffset is seconds)
        const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localMs = utcMs + timezoneOffset * 1000;
        const localDate = new Date(localMs);
        const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
        dateTimeDiv.innerHTML = localDate.toLocaleDateString("en-US", options);
    }
    refreshTime();
    dateInterval = setInterval(refreshTime, 60000);
}

function getForecastData(lat, lon) {
    // Show loading
    loadingDiv.style.display = "flex"; 

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data || parseInt(data.cod) !== 200) {
                
                loadingDiv.style.display = "none";
                forecastInfoDiv.innerHTML = `<p style="color: red;">Error: ${data && data.message ? data.message : 'Unable to fetch forecast'}</p>`;
                return;
            }
            displayForecastData(data);

    
            loadingDiv.style.display = "none"; 
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            loadingDiv.style.display = "none";
            forecastInfoDiv.innerHTML = `<p style="color: red;">Error fetching forecast data</p>`;
        });
}

function displayForecastData(data) {
    let dayCount = 0;
    let forecastHtml = `<div class="forecast-container">`;// forecast cards 

    data.list.forEach((forecast, index) => {
        if (index % 8 === 0 && dayCount < 5) {
            const cond = forecast.weather[0].main;
            const icon = weatherIcons[cond] || "☀️";

            forecastHtml += `
                <div class="forecast-card">
                    <p><b>${new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</b></p>
                    <div style="font-size:30px">${icon}</div>
                    <p>${forecast.main.temp.toFixed(1)}°C</p>
                    <p>${forecast.weather[0].description}</p>
                </div>
            `;
            dayCount++;
        }
    });

    forecastHtml += `</div>`;
    forecastInfoDiv.innerHTML = forecastHtml;
}
