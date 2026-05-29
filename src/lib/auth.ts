// ============================================================
// auth.ts — Autenticação do sistema (Admin + Clientes)
// ============================================================

export const ADMIN_SESSION_KEY = "gg_admin_session";
export const CLIENT_SESSION_KEY = "gg_client_session";

// Credenciais do admin (podem ser alteradas nas configurações)
const ADMIN_CREDENTIALS_KEY = "gg_admin_credentials";

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface ClientSession {
  clientId: string;
  clientName: string;
  token: string;
  expiresAt: number;
}

// ---- ADMIN AUTH ----

export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // Credenciais padrão
  return { username: "admin", password: "admin123" };
}

export function setAdminCredentials(credentials: AdminCredentials) {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function loginAdmin(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (
    username.trim().toLowerCase() === creds.username.toLowerCase() &&
    password === creds.password
  ) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    window.dispatchEvent(new CustomEvent("gg-auth-change"));
    return true;
  }
  return false;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new CustomEvent("gg-auth-change"));
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

// ---- CLIENT AUTH ----

export function loginClient(token: string, username: string, password: string): ClientSession | null {
  const clients = getClients();
  const client = clients.find(
    (c) =>
      c.token === token &&
      c.username.toLowerCase() === username.toLowerCase() &&
      c.password === password &&
      c.status === "active"
  );
  if (!client) return null;

  const session: ClientSession = {
    clientId: client.id,
    clientName: client.name,
    token: client.token,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 dias
  };
  localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("gg-auth-change"));
  return session;
}

export function logoutClient() {
  localStorage.removeItem(CLIENT_SESSION_KEY);
  window.dispatchEvent(new CustomEvent("gg-auth-change"));
}

export function getClientSession(): ClientSession | null {
  try {
    const raw = localStorage.getItem(CLIENT_SESSION_KEY);
    if (!raw) return null;
    const session: ClientSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      logoutClient();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// ---- IMPORT getClients (lazy to avoid circular dep) ----
function getClients() {
  try {
    const raw = localStorage.getItem("gg_clients");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
