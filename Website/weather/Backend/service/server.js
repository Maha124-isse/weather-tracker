import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import createWeatherService from './backend/service/weatherservice.js';
import db from './backend/models/database.js';
import createProxyFetch from './backend/lib/proxyfetch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize services
const fetchClient = createProxyFetch(60000);
const weatherService = createWeatherService({
  db,
  fetchClient,
  apiUrl: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY&units=metric'
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// New API endpoint for snapshots
app.get('/api/snapshots', async (req, res) => {
  try {
    const rows = await weatherService.getLatestSnapshots(10);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route for the HTML page
app.get('/newpage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'newpage.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
