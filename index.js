const BASE_URL = "https://proxy.royaleapi.dev/v1";

async function callApi(path, env) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${env.CR_API_TOKEN}`,
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Countries
      if (path === "/api/locations") {
        return await callApi("/locations", env);
      }

      // Normal clan rankings
      if (path === "/api/rankings-clans") {
        const locationId = url.searchParams.get("locationId");
        const limit = url.searchParams.get("limit") || "100";

        if (!locationId) {
          return new Response(
            JSON.stringify({ error: "locationId لازم است" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/rankings/clans?limit=${limit}`,
          env
        );
      }

      // Clan Wars rankings — Top Clans
      if (path === "/api/rankings-clanwars") {
        const locationId = url.searchParams.get("locationId");
        const limit = url.searchParams.get("limit") || "500";

        if (!locationId) {
          return new Response(
            JSON.stringify({ error: "locationId لازم است" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/rankings/clanwars?limit=${limit}`,
          env
        );
      }

      // Path of Legends
      if (path === "/api/pathoflegend") {
        const locationId = url.searchParams.get("locationId");
        const limit = url.searchParams.get("limit") || "1000";

        if (!locationId) {
          return new Response(
            JSON.stringify({ error: "locationId لازم است" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/pathoflegend/players?limit=${limit}`,
          env
        );
      }

      // Available player leaderboards
      if (path === "/api/leaderboards") {
        return await callApi("/leaderboards", env);
      }

      // Specific player leaderboard
      if (path.startsWith("/api/leaderboard/")) {
        const leaderboardId = path.split("/").pop();

        if (!leaderboardId) {
          return new Response(
            JSON.stringify({ error: "leaderboardId لازم است" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const limit = url.searchParams.get("limit") || "500";

        return await callApi(
          `/leaderboard/${encodeURIComponent(leaderboardId)}?limit=${limit}`,
          env
        );
      }

      return new Response(
        JSON.stringify({ error: "Endpoint not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};