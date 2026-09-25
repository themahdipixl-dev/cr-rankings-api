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
      if (path === "/api/locations") {
        return await callApi("/locations", env);
      }

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
          `/locations/${locationId}/rankings/clans?limit=${limit}`,
          env
        );
      }

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
          `/locations/${locationId}/pathoflegend/players?limit=${limit}`,
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