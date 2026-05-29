// ============================================================
// clientStorage.ts — CRUD de clientes e configurações globais
// ============================================================

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  plan: "basic" | "premium";
  status: "active" | "inactive";
  username: string;
  password: string;
  token: string;
  createdAt: string;
  notes?: string;
}

export interface GlobalSettings {
  systemName: string;
  systemSubtitle: string;
  primaryColor: string;
  accentColor: string;
  allowedSports: string[];
  maxTeamsPerCompetition: number;
  maxAthletesPerClub: number;
  showBranding: boolean;
  maintenanceMode: boolean;
  welcomeMessage: string;
}

const CLIENTS_KEY = "gg_clients";
const SETTINGS_KEY = "gg_global_settings";

// ---- Helpers ----

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateToken(): string {
  return Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9);
}

export function generateUsername(name: string, existing: string[]): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);

  if (!existing.includes(base)) return base;

  let i = 1;
  while (existing.includes(`${base}${i}`)) i++;
  return `${base}${i}`;
}

export function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ---- CLIENTS CRUD ----

export function getClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  window.dispatchEvent(new CustomEvent("gg-clients-change"));
}

export function createClient(data: Omit<Client, "id" | "token" | "username" | "password" | "createdAt"> & { username?: string; password?: string }): Client {
  const clients = getClients();
  const existingUsernames = clients.map((c) => c.username);

  const username = data.username || generateUsername(data.name, existingUsernames);
  const password = data.password || generatePassword();
  const token = generateToken();

  const client: Client = {
    id: uid(),
    ...data,
    username,
    password,
    token,
    createdAt: new Date().toISOString(),
  };

  saveClients([...clients, client]);
  return client;
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  clients[idx] = { ...clients[idx], ...updates };
  saveClients(clients);
  return clients[idx];
}

export function deleteClient(id: string): boolean {
  const clients = getClients();
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return false;
  saveClients(filtered);
  return true;
}

export function getClientByToken(token: string): Client | null {
  return getClients().find((c) => c.token === token) ?? null;
}

export function regenerateClientToken(id: string): Client | null {
  return updateClient(id, { token: generateToken() });
}

export function regenerateClientPassword(id: string): Client | null {
  return updateClient(id, { password: generatePassword() });
}

export function generateAccessLink(token: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/cliente/${token}`;
}

// ---- GLOBAL SETTINGS ----

const DEFAULT_SETTINGS: GlobalSettings = {
  systemName: "Gerador de Competições",
  systemSubtitle: "Plataforma de Gestão Esportiva",
  primaryColor: "#6366f1",
  accentColor: "#8b5cf6",
  allowedSports: ["Tênis de Mesa", "Tênis", "Vôlei", "Futsal", "Basquete"],
  maxTeamsPerCompetition: 32,
  maxAthletesPerClub: 50,
  showBranding: true,
  maintenanceMode: false,
  welcomeMessage: "Bem-vindo ao sistema de gerenciamento de competições!",
};

export function getGlobalSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGlobalSettings(settings: GlobalSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("gg-settings-change"));
}
