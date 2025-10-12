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

const weatherIcons = {
    Clear: "☀️", 
    Clouds: "⛅",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️"
};

 
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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data || parseInt(data.cod) !== 200) {
                locationDiv.innerHTML = `<p style="color: red;">Error: ${data && data.message ? data.message : 'Unable to fetch weather'}</p>`;
                return;
            }
            displayWeatherData(data);
            updateDateTime(data.timezone);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
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
    const windKmh = (data.wind && data.wind.speed) ? (data.wind.speed * 3.6).toFixed(1) : "--";
    windDiv.innerHTML = `${windKmh} km/h`;
    humidityDiv.innerHTML = `${data.main.humidity}%`;
    visibilityDiv.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
    sunriseDiv.innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunsetDiv.innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    uvDiv.innerHTML = "N/A"; 
    airQualityDiv.innerHTML = "N/A"; 
}

function updateDateTime(timezoneOffset) {
    if (dateInterval) clearInterval(dateInterval);

    function refreshTime() {
        const now = new Date();
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
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data || parseInt(data.cod) !== 200) {
                forecastInfoDiv.innerHTML = `<p style="color: red;">Error: ${data && data.message ? data.message : 'Unable to fetch forecast'}</p>`;
                return;
            }
            displayForecastData(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            forecastInfoDiv.innerHTML = `<p style="color: red;">Error fetching forecast data</p>`;
        });
}

function displayForecastData(data) {
    let dayCount = 0;
    let forecastHtml = `<div class="forecast-container">`;

    data.list.forEach((forecast, index) => {
        if (index % 8 === 0 && dayCount < 5) {
            const cond = forecast.weather[0].main;
            const icon = weatherIcons[cond] || "☀️";
            const dayData = {
                date: new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
                temp: forecast.main.temp.toFixed(1),
                desc: forecast.weather[0].description,
                humidity: forecast.main.humidity,
                pressure: forecast.main.pressure,
                wind: (forecast.wind.speed * 3.6).toFixed(1)
            };

            // create each card clickable
            forecastHtml += `
                <div class="forecast-card" onclick='viewDetails(${JSON.stringify(JSON.stringify(dayData))})'>
                    <p><b>${dayData.date}</b></p>
                    <div style="font-size:30px">${icon}</div>
                    <p>${dayData.temp}°C</p>
                    <p>${dayData.desc}</p>
                </div>
            `;
            dayCount++;
        }
    });

    forecastHtml += `</div>`;
    forecastInfoDiv.innerHTML = forecastHtml;
}

// when card clicked 
function viewDetails(dayDataString) {
    const dayData = JSON.parse(dayDataString);
//THIS PART below creates DUMMY sunrise/sunset times 
//It’s not using API data, just your computer’s current time + 6 hours
    dayData.sunrise = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
    dayData.sunset = new Date(Date.now() + 6 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 

    localStorage.setItem("selectedDay", JSON.stringify(dayData));
    window.location.href = "details.html";
}
if (document.getElementById("details")) {
    const detailsContainer = document.getElementById("details");
    const selectedDay = JSON.parse(localStorage.getItem("selectedDay"));

    if (selectedDay) {
        detailsContainer.innerHTML = `
            <h1>Weather Details</h1>
            <div class="details-grid">
                <div class="detail-card">
                    <i class="fas fa-temperature-high"></i>
                    <h3>Temperature</h3>
                    <p>${selectedDay.temp}°C</p>
                </div>
                <div class="detail-card">
                    <i class="fas fa-tint"></i>
                    <h3>Humidity</h3>
                    <p>${selectedDay.humidity}%</p>
                </div>
                <div class="detail-card">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <h3>Pressure</h3>
                    <p>${selectedDay.pressure} hPa</p>
                </div>
                <div class="detail-card">
                    <i class="fas fa-wind"></i>
                    <h3>Wind</h3>
                    <p>${selectedDay.wind} km/h</p>
                </div>
                <div class="detail-card">
                    <i class="fas fa-cloud"></i>
                    <h3>Description</h3>
                    <p>${selectedDay.desc}</p>
                </div>
                <div class="detail-card">
                    <i class="fas fa-sun"></i>
                    <h3>Sunrise & Sunset</h3>
                    <p>🌅 Sunrise: ${selectedDay.sunrise}</p>
                    <p>🌇 Sunset: ${selectedDay.sunset}</p>
                </div>
            </div>
            <a href="index.html" class="back-btn"><i class="fas fa-arrow-left"></i> Back</a>
        `;
    } else {
        detailsContainer.textContent = "No details available.";
    }
}
