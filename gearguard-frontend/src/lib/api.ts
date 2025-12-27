export const API_BASE = "http://localhost:3001/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authRequest(endpoint: string, data: any) {
  const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Authentication failed");
  }
  
  return res.json();
}