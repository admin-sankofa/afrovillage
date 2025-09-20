import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

export class ApiError extends Error {
  status: number;
  reason?: string;
  body?: unknown;

  constructor(message: string, options: { status: number; reason?: string; body?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.reason = options.reason;
    this.body = options.body;
  }
}

async function buildAuthHeaders(init: RequestInit): Promise<Headers> {
  const headers = new Headers(init.headers ?? {});

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (error) {
    console.warn('Failed to resolve Supabase session for apiFetch', error);
  }

  const hasBody = Boolean(init.body);
  if (hasBody && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

async function assertResponseOk(res: Response) {
  if (res.ok) {
    return;
  }

  let raw = '';
  let parsedBody: any;

  try {
    raw = await res.text();
    parsedBody = raw ? JSON.parse(raw) : undefined;
  } catch {
    parsedBody = raw || undefined;
  }

  const message = parsedBody?.message ?? res.statusText ?? 'Request failed';
  const reason = parsedBody?.reason;
  throw new ApiError(`${res.status}: ${message}`, {
    status: res.status,
    reason,
    body: parsedBody ?? raw,
  });
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = await buildAuthHeaders(init);

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });

  await assertResponseOk(response);
  return response;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  return apiFetch(url, {
    method,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await apiFetch(queryKey.join("/") as string, {
        method: 'GET',
      });
      return await res.json();
    } catch (error) {
      if (
        unauthorizedBehavior === "returnNull" &&
        error instanceof ApiError &&
        error.status === 401
      ) {
        return null as T;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
