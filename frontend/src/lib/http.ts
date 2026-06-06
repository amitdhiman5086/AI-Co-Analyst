/**
 * Custom error class representing an API failure (HTTP error or network failure).
 */
export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;
  body?: unknown;

  constructor(message: string, options?: { status?: number; isNetworkError?: boolean; body?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.isNetworkError = options?.isNetworkError ?? false;
    this.body = options?.body;
  }
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Core HTTP client wrapper around native fetch.
 * Handles timeouts, content-type parsing, and converts network/HTTP errors into typed ApiErrors.
 */
export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 15000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(id);

    let body: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      const detail =
        body && typeof body === "object" && "detail" in body
          ? String((body as Record<string, unknown>).detail)
          : undefined;

      throw new ApiError(
        detail || `Request failed with status ${response.status}`,
        {
          status: response.status,
          isNetworkError: false,
          body,
        }
      );
    }

    return body as T;
  } catch (err: unknown) {
    clearTimeout(id);

    if (err instanceof ApiError) {
      throw err;
    }

    const error = err as Error;
    if (error.name === "AbortError") {
      throw new ApiError("Request timed out", { isNetworkError: true });
    }

    // Distinguish network issues (CORS, DNS lookup, disconnected, etc.)
    throw new ApiError(error.message || "Network error occurred", { isNetworkError: true });
  }
}
