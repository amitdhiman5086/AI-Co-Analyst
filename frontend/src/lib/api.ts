import { request, type RequestOptions } from "./http";
import { env } from "./env";
import { supabase } from "./supabase";

/**
 * Retrieves the current user's session from Supabase and returns the authorization header.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Normalizes and builds the absolute API URL from the base URL.
 */
function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${env.VITE_API_BASE_URL}/${cleanPath}`;
}

/**
 * API client singleton wrapper around native fetch client.
 * Automatically handles base URL prepending, JWT auth token injection,
 * and standard header handling.
 */
export const api = {
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    return request<T>(buildUrl(path), {
      ...options,
      method: "GET",
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  },

  async post<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const isFormData = body instanceof FormData;

    return request<T>(buildUrl(path), {
      ...options,
      method: "POST",
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        ...authHeaders,
        ...(!isFormData && body !== undefined && { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  },

  async put<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const isFormData = body instanceof FormData;

    return request<T>(buildUrl(path), {
      ...options,
      method: "PUT",
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        ...authHeaders,
        ...(!isFormData && body !== undefined && { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  },

  async patch<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const isFormData = body instanceof FormData;

    return request<T>(buildUrl(path), {
      ...options,
      method: "PATCH",
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        ...authHeaders,
        ...(!isFormData && body !== undefined && { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  },

  async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    return request<T>(buildUrl(path), {
      ...options,
      method: "DELETE",
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  },
};
