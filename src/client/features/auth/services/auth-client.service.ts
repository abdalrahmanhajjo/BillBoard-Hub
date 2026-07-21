import type { LoginSchemaInput } from "@/shared/contracts/auth/login.schema";
import type { RegisterSchemaInput } from "@/shared/contracts/auth/register.schema";

async function parseResponse(response: Response) {
  const payload = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error ?? "Request failed.",
      data: payload?.data,
    };
  }

  return {
    ok: payload?.ok ?? true,
    error: payload?.error,
    data: payload?.data,
  };
}

export const authClientService = {
  async register(payload: RegisterSchemaInput) {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return parseResponse(response);
  },

  async login(payload: LoginSchemaInput) {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return parseResponse(response);
  },

  async logout() {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    return parseResponse(response);
  },

  async me() {
    const response = await fetch("/api/v1/auth/me", {
      method: "GET",
      credentials: "include",
    });

    return parseResponse(response);
  },

  async refresh() {
    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    return parseResponse(response);
  },
};
