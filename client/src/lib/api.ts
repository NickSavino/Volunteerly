


const base_url = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 *  Base wrapper for API to call the backend.
 *  Will automatically prepend the base URL and set the content type to JSON.
 * @param path path to api endpoint, relative to base url, e.g., "/users" 
 * @param init optional RequestInit object. this is meant to be used for setting method, body, and additional headers.
 * @throws Error if NEXT_PUBLIC_API_BASE_URL is not set or if response is not 200 OK
 * @returns the response body parsed as JSON.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    if (!base_url) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
    const res = await fetch(`${base_url}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
    
}