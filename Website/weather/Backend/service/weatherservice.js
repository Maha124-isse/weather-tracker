function createWeatherService({ db, fetchClient, apiUrl, realFetch = fetchClient }) {
  async function fetchAndStoreWeather(force = false) {
    try {
      const client = force ? realFetch : fetchClient;
      const res = await client(apiUrl);

      if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
      const data = await res.json();

      const timestamp = new Date().toISOString();
      const temperature = data.main.temp;
      const wind = data.wind.speed;
      const weather = data.weather[0]?.description || 'Unknown';

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO snapshots (timestamp, temperature, wind, weather) VALUES (?, ?, ?, ?)`,
          [timestamp, temperature, wind, weather],
          err => (err ? reject(err) : resolve())
        );
      });

      console.log(`[${timestamp}] Snapshot saved: ${temperature}°C, ${wind} m/s, ${weather}`);
    } catch (err) {
      console.error('Fetch Error:', err.message);
    }
  }

  async function getLatestSnapshots(limit) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM snapshots ORDER BY timestamp DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.reverse());
        }
      );
    });
  }

  return {
    fetchAndStoreWeather,
    getLatestSnapshots,
  };
}

export default createWeatherService;