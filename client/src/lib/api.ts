import { supabase } from "./supabase";



const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

async function getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

/**
 *  Base wrapper for API to call the backend.
 *  Will automatically prepend the base URL and set the content type to JSON.
 * @param path path to api endpoint, relative to base url, e.g., "/users" 
 * @param init optional RequestInit object. this is meant to be used for setting method, body, and additional headers.
 * @throws Error if NEXT_PUBLIC_API_BASE_URL is not set or if response is not 200 OK
 * @returns the response body parsed as JSON.
 */
export async function api<T>(path: string, init?: RequestInit & { responseType?: "json" | "blob"}): Promise<T> {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");

    const token = await getAccessToken();
    const { responseType = "json" } = init ?? {};

    
    const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}`} : {}),
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) throw new Error(await res.text());
      
    if (responseType === "blob") return res.blob() as Promise<T>;
    return res.json() as Promise<T>;
    
}