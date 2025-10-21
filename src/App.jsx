import React from 'react';
import './App.css';
import Weather from './components/Weather';
import Forecast from './components/Forecast';


const App = () => {
  return (
    <div className="app">
      <Weather />
      <Forecast/>
    </div>
  );
};

export default App;
