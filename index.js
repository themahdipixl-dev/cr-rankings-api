// * index.js — expanded Clash Royale API Worker

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

function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

function encodePathParam(value) {
  return encodeURIComponent(decodeURIComponent(value));
}

function getListQuery(url, defaultLimit = null) {
  const params = new URLSearchParams();

  const limit = url.searchParams.get("limit");
  const after = url.searchParams.get("after");
  const before = url.searchParams.get("before");

  if (limit) {
    params.set("limit", limit);
  } else if (defaultLimit !== null) {
    params.set("limit", defaultLimit);
  }

  if (after) {
    params.set("after", after);
  }

  if (before) {
    params.set("before", before);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // =========================================================
      // LOCATIONS
      // =========================================================

      // All locations / countries
      if (path === "/api/locations") {
        return await callApi("/locations", env);
      }

      // Single location
      if (path.startsWith("/api/location/")) {
        const locationId = path.split("/").pop();

        if (!locationId) {
          return errorResponse("locationId لازم است");
        }

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}`,
          env
        );
      }


      // =========================================================
      // PLAYER
      // =========================================================

      // Player battle log
      if (path.startsWith("/api/player/") && path.endsWith("/battlelog")) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("playerTag لازم است");
        }

        const playerTag = encodePathParam(rawTag);

        return await callApi(
          `/players/${playerTag}/battlelog`,
          env
        );
      }

      // Player upcoming chests
      if (
        path.startsWith("/api/player/") &&
        path.endsWith("/upcomingchests")
      ) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("playerTag لازم است");
        }

        const playerTag = encodePathParam(rawTag);

        return await callApi(
          `/players/${playerTag}/upcomingchests`,
          env
        );
      }

      // Full player profile
      if (path.startsWith("/api/player/")) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("playerTag لازم است");
        }

        const playerTag = encodePathParam(rawTag);

        return await callApi(
          `/players/${playerTag}`,
          env
        );
      }


      // =========================================================
      // CLANS
      // =========================================================

      // Clan members
      if (path.startsWith("/api/clan/") && path.endsWith("/members")) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("clanTag لازم است");
        }

        const clanTag = encodePathParam(rawTag);
        const query = getListQuery(url);

        return await callApi(
          `/clans/${clanTag}/members${query}`,
          env
        );
      }

      // Current River Race
      if (
        path.startsWith("/api/clan/") &&
        path.endsWith("/currentriverrace")
      ) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("clanTag لازم است");
        }

        const clanTag = encodePathParam(rawTag);

        return await callApi(
          `/clans/${clanTag}/currentriverrace`,
          env
        );
      }

      // River Race history
      if (
        path.startsWith("/api/clan/") &&
        path.endsWith("/riverracelog")
      ) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("clanTag لازم است");
        }

        const clanTag = encodePathParam(rawTag);
        const query = getListQuery(url);

        return await callApi(
          `/clans/${clanTag}/riverracelog${query}`,
          env
        );
      }

      // Full clan profile
      if (path.startsWith("/api/clan/")) {
        const parts = path.split("/");
        const rawTag = parts[3];

        if (!rawTag) {
          return errorResponse("clanTag لازم است");
        }

        const clanTag = encodePathParam(rawTag);

        return await callApi(
          `/clans/${clanTag}`,
          env
        );
      }

      // Clan search
      if (path === "/api/clans") {
        const params = new URLSearchParams();

        const allowedParams = [
          "name",
          "locationId",
          "minMembers",
          "maxMembers",
          "minScore",
          "limit",
          "after",
          "before",
        ];

        for (const param of allowedParams) {
          const value = url.searchParams.get(param);

          if (value !== null && value !== "") {
            params.set(param, value);
          }
        }

        const query = params.toString();

        return await callApi(
          `/clans${query ? `?${query}` : ""}`,
          env
        );
      }


      // =========================================================
      // NORMAL RANKINGS
      // =========================================================

      // Player trophy rankings
      if (path === "/api/rankings-players") {
        const locationId = url.searchParams.get("locationId");

        if (!locationId) {
          return errorResponse("locationId لازم است");
        }

        const query = getListQuery(url, "1000");

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/rankings/players${query}`,
          env
        );
      }

      // Clan rankings
      if (path === "/api/rankings-clans") {
        const locationId = url.searchParams.get("locationId");

        if (!locationId) {
          return errorResponse("locationId لازم است");
        }

        const query = getListQuery(url, "100");

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/rankings/clans${query}`,
          env
        );
      }

      // Clan Wars rankings
      if (path === "/api/rankings-clanwars") {
        const locationId = url.searchParams.get("locationId");

        if (!locationId) {
          return errorResponse("locationId لازم است");
        }

        const query = getListQuery(url, "500");

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/rankings/clanwars${query}`,
          env
        );
      }

      // Ranked / Path of Legends
      if (path === "/api/pathoflegend") {
        const locationId = url.searchParams.get("locationId");

        if (!locationId) {
          return errorResponse("locationId لازم است");
        }

        const query = getListQuery(url, "1000");

        return await callApi(
          `/locations/${encodeURIComponent(locationId)}/pathoflegend/players${query}`,
          env
        );
      }


      // =========================================================
      // RANKED SEASONS
      // =========================================================

      // List Ranked seasons
      if (path === "/api/seasons") {
        return await callApi(
          "/locations/global/seasons",
          env
        );
      }

      // Specific Ranked season
      if (path.startsWith("/api/season/")) {
        const parts = path.split("/");
        const seasonId = parts[3];

        if (!seasonId) {
          return errorResponse("seasonId لازم است");
        }

        // Historical Ranked / Path of Legends rankings
        if (parts[4] === "rankings") {
          const query = getListQuery(url, "1000");

          return await callApi(
            `/locations/global/pathoflegend/${encodePathParam(
              seasonId
            )}/rankings/players${query}`,
            env
          );
        }

        // Season information
        return await callApi(
          `/locations/global/seasons/${encodePathParam(seasonId)}`,
          env
        );
      }


      // =========================================================
      // LEADERBOARDS
      // =========================================================

      // Available game-mode leaderboards
      if (path === "/api/leaderboards") {
        return await callApi(
          "/leaderboards",
          env
        );
      }

      // Specific leaderboard
      if (path.startsWith("/api/leaderboard/")) {
        const leaderboardId = path.split("/").pop();

        if (!leaderboardId) {
          return errorResponse("leaderboardId لازم است");
        }

        const query = getListQuery(url, "500");

        return await callApi(
          `/leaderboard/${encodeURIComponent(leaderboardId)}${query}`,
          env
        );
      }


      // =========================================================
      // CARDS
      // =========================================================

      // Full card catalog
      if (path === "/api/cards") {
        return await callApi(
          "/cards",
          env
        );
      }


      // =========================================================
      // EVENTS
      // =========================================================

      // Active in-game events
      if (path === "/api/events") {
        return await callApi(
          "/events",
          env
        );
      }


      // =========================================================
      // TOURNAMENTS
      // =========================================================

      // Search player-created tournaments
      if (path === "/api/tournaments") {
        const params = new URLSearchParams();

        const allowedParams = [
          "name",
          "limit",
          "after",
          "before",
        ];

        for (const param of allowedParams) {
          const value = url.searchParams.get(param);

          if (value !== null && value !== "") {
            params.set(param, value);
          }
        }

        const query = params.toString();

        return await callApi(
          `/tournaments${query ? `?${query}` : ""}`,
          env
        );
      }

      // Specific player-created tournament
      if (path.startsWith("/api/tournament/")) {
        const tournamentTag = path.split("/").pop();

        if (!tournamentTag) {
          return errorResponse("tournamentTag لازم است");
        }

        return await callApi(
          `/tournaments/${encodePathParam(tournamentTag)}`,
          env
        );
      }


      // =========================================================
      // GLOBAL TOURNAMENTS
      // =========================================================

      // Active Supercell Global Tournaments
      if (path === "/api/globaltournaments") {
        return await callApi(
          "/globaltournaments",
          env
        );
      }

      // Global Tournament rankings
      if (path.startsWith("/api/globaltournament/")) {
        const tournamentTag = path.split("/").pop();

        if (!tournamentTag) {
          return errorResponse("tournamentTag لازم است");
        }

        return await callApi(
          `/locations/global/rankings/tournaments/${encodePathParam(
            tournamentTag
          )}${getListQuery(url, "1000")}`,
          env
        );
      }


      // =========================================================
      // 404
      // =========================================================

      return new Response(
        JSON.stringify({
          error: "Endpoint not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};