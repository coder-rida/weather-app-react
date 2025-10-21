import React, { useEffect, useState } from "react";
import "../App.css"; // or Forecast.css if you separate styles

const Forecast = ({ lat, lon, API_KEY }) => {
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchForecast = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();

        // Filter forecast to one record per day at 12:00 PM
        const dailyData = data.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );

        const formatted = dailyData.slice(0, 5).map((item) => ({
          date: item.dt_txt,
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          rainChance: Math.round((item.pop || 0) * 100), // Convert probability to percentage
        }));

        setForecastData(formatted);
      } catch (error) {
        console.error("Error fetching forecast:", error);
      }
    };

    fetchForecast();
  }, [lat, lon, API_KEY]);

  return (
    <div className="forecast-wrapper">
      <h2 className="forecast-title">Forecast</h2>
      <div className="forecast-grid">
        {forecastData.map((day, index) => (
          <div className="forecast-card" key={index}>
            <p className="forecast-date">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>

            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="forecast-icon"
            />

            <p className="forecast-temp">{day.temp}°C</p>
            <p className="forecast-desc">{day.description}</p>

            <p className="forecast-rain">
              🌧️ Rain – {day.rainChance}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;
