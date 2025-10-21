//  useCallback to remember reference is same and dependencies stay stable.just change the city and data
import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import Forecast from "./Forecast";
import "react-toastify/dist/ReactToastify.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = "31cc1c0b79c50525deed610ccf45f23c";

  const getAirQuality = useCallback(
    async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await res.json();
        setAirQuality(data.list[0].main.aqi);
      } catch (error) {
        console.error("Error fetching air quality:", error);
      }
    },
    [API_KEY]
  );

  const getWeatherByCoords = useCallback(
    async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        setWeatherData(data);
        getAirQuality(lat, lon);
      } catch (error) {
        console.error("Error fetching weather:", error);
        toast.error("⚠️ Failed to fetch location weather!");
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, getAirQuality]
  );

  const getWeatherByCity = useCallback(
    async (cityName) => {
      if (!cityName.trim()) {
        toast.warn("⚠️ Please enter a city name!");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();

        if (data.cod === "404") {
          toast.error("❌ City not found! Please enter a correct name.");
          setLoading(false);
          return;
        }

        setWeatherData(data);
        getAirQuality(data.coord.lat, data.coord.lon);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        toast.error("⚠️ Unable to fetch weather data!");
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, getAirQuality]
  );

  //  Dependencies added to useEffect
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        toast.info("📍 Using default location: Islamabad");
        getWeatherByCity("Islamabad");
      }
    );
  }, [getWeatherByCoords, getWeatherByCity]);

  const getEmojiIcon = (weatherMain) => {
    const icons = {
      Clear: "☀️",
      Clouds: "⛅",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Smoke: "🌫️",
      Haze: "🌫️",
      Fog: "🌫️",
    };
    return icons[weatherMain] || "☀️";
  };

  const getAQIDesc = (aqi) => {
    const levels = [
      "Good 😊",
      "Fair 🙂",
      "Moderate 😐",
      "Poor 😷",
      "Very Poor 😫",
    ];
    return levels[aqi - 1] || "Unknown";
  };

  return (
    <div className="weather">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getWeatherByCity(city)}
        />
        <FaSearch
          className="search-icon"
          onClick={() => getWeatherByCity(city)}
        />
      </div>

      {loading ? (
        <p style={{ color: "white" }}>Loading weather...</p>
      ) : weatherData && weatherData.main ? (
        <>
          <p className="emoji-icon">
            {getEmojiIcon(weatherData.weather[0].main)}
          </p>
          <p className="temperature">{Math.round(weatherData.main.temp)}°C</p>
          <p className="city-name">{weatherData.name}</p>
          <p className="countary-name">{weatherData.sys.country}</p>

          <div className="weather-data">
            <div className="col">
              <span className="emoji">💧</span>
              <div>
                <p>{weatherData.main.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>

            <div className="col">
              <span className="emoji">🌬️</span>
              <div>
                <p>{weatherData.wind.speed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>

            <div className="col">
              <span className="emoji">👁️</span>
              <div>
                <p>{(weatherData.visibility / 1000).toFixed(1)} km</p>
                <span>Visibility</span>
              </div>
            </div>

            <div className="col">
              <span className="emoji">🌫️</span>
              <div>
                <p>{airQuality ? getAQIDesc(airQuality) : "Loading..."}</p>
                <span>Air Quality</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: "white" }}>City not found!</p>
      )}
      
      {weatherData?.coord && (
        <Forecast
          lat={weatherData.coord.lat}
          lon={weatherData.coord.lon}
          API_KEY={API_KEY}
        />
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Weather;
