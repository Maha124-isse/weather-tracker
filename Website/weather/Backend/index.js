require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');
const db = require('./models/database');
const createWeatherService = require('./service/weatherservice').default;
const createProxyFetch = require('./lib/proxyFetch');  


const PORT = 3000;
const CITY = 'Odense,dk';
const API_KEY = process.env.API_KEY;
const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;


const app = express();
app.use(cors());
app.use(express.json());


const proxyFetch = createProxyFetch(30000);


const weatherService = createWeatherService({
  db,
  fetchClient: proxyFetch,  
  realFetch: fetch,         
  apiUrl: API_URL,
});

app.get('/api/snapshots', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const snapshots = await weatherService.getLatestSnapshots(limit);
    res.json(snapshots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fetch-now', async (req, res) => {
  try {
    await weatherService.fetchAndStoreWeather();
    res.json({ message: 'Fetched and stored current weather.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // Initial fetch on startup
  weatherService.fetchAndStoreWeather();

  // Schedule fetch every 10 minutes
  cron.schedule('*/10 * * * *', () => weatherService.fetchAndStoreWeather());
});
