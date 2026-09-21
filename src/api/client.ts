export const API_BASE = "http://localhost:8080";

function authHeaders(token?: string): HeadersInit {
  const t = token ?? localStorage.getItem("accessToken");
  const validToken = t && t !== "undefined" && t !== "null" ? t : null;
  return {
    "Content-Type": "application/json",
    ...(validToken ? { Authorization: `Bearer ${validToken}` } : {}),
  };
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.data?.accessToken) {
      localStorage.setItem("accessToken", json.data.accessToken);
      return json.data.accessToken;
    }
  } catch (_e) {
    // 네트워크 오류 등
  }

  // 갱신 실패 → 로그아웃
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return null;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const doRequest = (token?: string) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...authHeaders(token),
        ...(init?.headers ?? {}),
      },
    });

  let res = await doRequest();

  // 401이면 토큰 갱신 후 1회 재시도
  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      res = await doRequest(newToken);
    } else {
      // 갱신 실패 → 로그인 페이지로
      window.location.href = "/";
      throw new Error("Unauthorized");
    }
  }

  const text = await res.text();
  let json: { data?: unknown; message?: string } | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_e) {
    // JSON이 아닌 응답 무시
  }

  if (!res.ok) {
    throw new Error(json?.message ?? `HTTP ${res.status} ${res.statusText}`);
  }

  return (json?.data ?? null) as T;
}
