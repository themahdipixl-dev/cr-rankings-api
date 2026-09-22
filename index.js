const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.CR_API_TOKEN;
const BASE_URL = "https://proxy.royaleapi.dev/v1";

async function callApi(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
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

app.get("/api/rankings-clans", async (req, res) => {
  const { locationId, limit = 100 } = req.query;
  if (!locationId) return res.status(400).json({ error: "locationId لازم است" });
  try {
    const { status, data } = await callApi(
      `/locations/${locationId}/rankings/clans?limit=${limit}`
    );
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جدید: رتبه‌بندی Path of Legends به‌تفکیک کشور
app.get("/api/pathoflegend", async (req, res) => {
  const { locationId, limit = 1000 } = req.query;
  if (!locationId) return res.status(400).json({ error: "locationId لازم است" });
  try {
    const { status, data } = await callApi(
      `/locations/${locationId}/pathoflegend/players?limit=${limit}`
    );
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const cache = {};
const CACHE_TTL = 60 * 60 * 1000;

app.get("/api/top-players-by-country", async (req, res) => {
  const { locationId, target = 1000, maxClans = 60 } = req.query;
  if (!locationId) return res.status(400).json({ error: "locationId لازم است" });

  const cached = cache[locationId];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json({ fromCache: true, count: cached.data.length, players: cached.data });
  }

  try {
    const { data: clansData } = await callApi(
      `/locations/${locationId}/rankings/clans?limit=${maxClans}`
    );
    const clans = clansData.items || [];

    let allPlayers = [];
    for (const clan of clans) {
      const tag = encodeURIComponent(clan.tag);
      const { data: clanDetail } = await callApi(`/clans/${tag}`);
      const members = clanDetail.memberList || [];
      for (const m of members) {
        allPlayers.push({
          name: m.name,
          tag: m.tag,
          trophies: m.trophies,
          clanName: clan.name,
        });
      }
    }

    allPlayers.sort((a, b) => b.trophies - a.trophies);
    const top = allPlayers.slice(0, Number(target));

    cache[locationId] = { data: top, timestamp: Date.now() };
    res.json({ fromCache: false, count: top.length, players: top });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
