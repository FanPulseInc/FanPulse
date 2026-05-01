export async function gridGraphql<T>(
    query: string,
    variables?: Record<string, unknown>
): Promise<T> {
    const response = await fetch(process.env.GRID_API_URL!, {
        method: "POST",
        headers: {
            "x-api-key": process.env.GRID_API_KEY!,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query,
            variables,
        }),
        cache: "no-store",
    });

    const json = await response.json();

    if (!response.ok || json.errors) {
        console.error("GRID API error:", json);
        throw new Error("GRID API request failed");
    }

    return json.data;
}

export async function gridLiveGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(
    "https://api-op.grid.gg/live-data-feed/series-state/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.GRID_API_KEY!,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors ?? json));
  }

  return json.data;
}