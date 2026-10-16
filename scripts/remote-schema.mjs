/**
 * Check raw HTTP status: postgrest-js normalizes an empty HEAD 404 into 204.
 * This guard must run before creating remote TEST fixtures.
 * @param {{origin:string,serviceKey:string,tables:string[],fetchImpl?:typeof fetch}} options
 */
export async function requireRemoteSchema({
  origin,
  serviceKey,
  tables,
  fetchImpl = fetch,
}) {
  for (const table of tables) {
    let response;
    try {
      response = await fetchImpl(
        `${origin.replace(/\/$/, "")}/rest/v1/${table}?select=*`,
        {
          method: "HEAD",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
          redirect: "error",
          signal: AbortSignal.timeout(12000),
        },
      );
    } catch {
      throw new Error(
        "Remote schema preflight could not reach the provider; no fixtures created.",
      );
    }
    if (!response.ok)
      throw new Error(
        "Required remote schema is unavailable; no fixtures created.",
      );
  }
}
