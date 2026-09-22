const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.CR_API_TOKEN;

async function callApi(path) {
  const response = await fetch(`https://api.clashroyale.com/v1${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await response.json();
  return { status: response.status, data };
}

app.get("/api/locations", async (req, res) => {
  try {
    const { status, data } = await callApi("/locations");
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/rankings", async (req, res) => {
  const { locationId, limit = 100 } = req.query;
  if (!locationId) {
    return res.status(400).json({ error: "locationId لازم است" });
  }
  try {
    const { status, data } = await callApi(
      `/locations/${locationId}/rankings/players?limit=${limit}`
    );
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
