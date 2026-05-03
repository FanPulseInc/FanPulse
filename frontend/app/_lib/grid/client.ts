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