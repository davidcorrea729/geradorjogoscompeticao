import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientByToken } from "../../lib/clientStorage";
import { loginClient, getClientSession, logoutClient } from "../../lib/auth";
import { getGlobalSettings } from "../../lib/clientStorage";
import type { Client } from "../../lib/clientStorage";

export const Route = createFileRoute("/cliente/$token")({
  component: ClientePage,
});

function ClientLoginScreen({ token, onLogin }: { token: string; onLogin: (c: Client) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const settings = getGlobalSettings();
  const client = getClientByToken(token);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!client || client.status !== "active") {
      setError("Este link não está disponível. Entre em contato com o administrador.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const session = loginClient(token, username, password);
    if (session) {
      onLogin(client);
    } else {
      setError("Usuário ou senha incorretos.");
    }
    setLoading(false);
  }

  const isInactive = client && client.status !== "active";
  const notFound = !client;

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" style={{ background: settings.primaryColor }} />
        <div className="login-orb login-orb-2" style={{ background: settings.accentColor }} />
        <div className="login-orb login-orb-3" style={{ background: settings.primaryColor }} />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon" style={{ background: settings.primaryColor }}>
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2.5" />
              <path d="M13 20 L20 13 L27 20 L20 27 Z" fill="white" />
              <circle cx="20" cy="20" r="3" fill="white" opacity="0.6" />
            </svg>
          </div>
          <h1 className="login-title">{settings.systemName}</h1>
          <p className="login-subtitle">{settings.systemSubtitle}</p>
        </div>

        {notFound ? (
          <div className="client-error-box">
            <p>⚠️ Link de acesso inválido ou expirado.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.7 }}>
              Verifique com o administrador do sistema.
            </p>
          </div>
        ) : isInactive ? (
          <div className="client-error-box">
            <p>🚫 Este acesso está suspenso.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.7 }}>
              Entre em contato com o administrador.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {settings.welcomeMessage && (
              <div className="client-welcome-msg">
                {settings.welcomeMessage}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="client-username" className="login-label">Usuário</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                  </svg>
                </span>
                <input
                  id="client-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="client-password" className="login-label">Senha</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  id="client-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="Sua senha"
                  required
                />
                <button type="button" className="login-eye-btn" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                  {showPass ? (
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}

            <button id="client-login-submit" type="submit" disabled={loading} className="login-btn" style={{ background: settings.primaryColor }}>
              {loading ? <span className="login-spinner" /> : <>Entrar <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg></>}
            </button>
          </form>
        )}

        {settings.showBranding && (
          <p className="login-hint" style={{ opacity: 0.5 }}>Powered by {settings.systemName}</p>
        )}
      </div>
    </div>
  );
}

function ClientAppScreen({ client, onLogout }: { client: Client; onLogout: () => void }) {
  const settings = getGlobalSettings();

  // Listen for real-time settings changes
  const [liveSettings, setLiveSettings] = useState(settings);
  useEffect(() => {
    const handler = () => setLiveSettings(getGlobalSettings());
    window.addEventListener("gg-settings-change", handler);
    return () => window.removeEventListener("gg-settings-change", handler);
  }, []);

  return (
    <div className="client-app">
      {/* Header */}
      <header className="client-header" style={{ background: `linear-gradient(135deg, ${liveSettings.primaryColor}, ${liveSettings.accentColor})` }}>
        <div className="client-header-left">
          <div className="client-header-logo">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2.5" />
              <path d="M13 20 L20 13 L27 20 L20 27 Z" fill="white" />
              <circle cx="20" cy="20" r="3" fill="white" opacity="0.6" />
            </svg>
          </div>
          <div>
            <h1 className="client-header-title">{liveSettings.systemName}</h1>
            <p className="client-header-sub">{liveSettings.systemSubtitle}</p>
          </div>
        </div>
        <div className="client-header-right">
          <div className="client-user-chip">
            <div className="client-user-avatar">{client.name.charAt(0).toUpperCase()}</div>
            <div className="client-user-info">
              <p className="client-user-name">{client.name}</p>
              <p className="client-user-org">{client.organization || client.email}</p>
            </div>
          </div>
          <button id="client-logout-btn" className="client-logout-btn" onClick={onLogout} title="Sair">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Maintenance Mode Banner */}
      {liveSettings.maintenanceMode && (
        <div className="maintenance-banner">
          ⚠️ O sistema está em manutenção no momento. Algumas funções podem estar indisponíveis.
        </div>
      )}

      {/* Welcome */}
      {liveSettings.welcomeMessage && (
        <div className="client-welcome-bar">
          {liveSettings.welcomeMessage}
        </div>
      )}

      {/* Content */}
      <main className="client-main">
        <div className="client-welcome-card">
          <div className="client-welcome-icon" style={{ background: `linear-gradient(135deg, ${liveSettings.primaryColor}, ${liveSettings.accentColor})` }}>
            🏆
          </div>
          <h2>Bem-vindo, {client.name}!</h2>
          <p>
            Você está conectado ao <strong>{liveSettings.systemName}</strong>.
            {client.organization && ` — ${client.organization}`}
          </p>
          {client.plan === "premium" && (
            <span className="badge badge-premium" style={{ marginTop: "0.5rem" }}>⭐ Plano Premium</span>
          )}
        </div>

        {/* Sports Grid */}
        <div className="client-section">
          <h3 className="client-section-title">Esportes Disponíveis</h3>
          <div className="sports-grid">
            {liveSettings.allowedSports.map((sport) => (
              <div key={sport} className="sport-card">
                <div className="sport-card-icon" style={{ background: `linear-gradient(135deg, ${liveSettings.primaryColor}22, ${liveSettings.accentColor}22)`, border: `1px solid ${liveSettings.primaryColor}44` }}>
                  {sport.includes("Tênis") ? "🎾" :
                   sport.includes("Vôlei") ? "🏐" :
                   sport.includes("Futsal") || sport.includes("Futebol") ? "⚽" :
                   sport.includes("Basquete") ? "🏀" :
                   sport.includes("Natação") ? "🏊" :
                   "🏆"}
                </div>
                <span className="sport-card-name">{sport}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="client-section">
          <h3 className="client-section-title">Capacidades do Sistema</h3>
          <div className="client-info-grid">
            <div className="client-info-card">
              <span className="client-info-number" style={{ color: liveSettings.primaryColor }}>
                {liveSettings.maxTeamsPerCompetition}
              </span>
              <span className="client-info-label">Times máx. por competição</span>
            </div>
            <div className="client-info-card">
              <span className="client-info-number" style={{ color: liveSettings.primaryColor }}>
                {liveSettings.maxAthletesPerClub}
              </span>
              <span className="client-info-label">Atletas máx. por clube</span>
            </div>
            <div className="client-info-card">
              <span className="client-info-number" style={{ color: liveSettings.primaryColor }}>
                {liveSettings.allowedSports.length}
              </span>
              <span className="client-info-label">Modalidades disponíveis</span>
            </div>
          </div>
        </div>
      </main>

      {liveSettings.showBranding && (
        <footer className="client-footer">
          Powered by {liveSettings.systemName}
        </footer>
      )}
    </div>
  );
}

function ClientePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getClientSession());
  const [clientData, setClientData] = useState<Client | null>(() => {
    const s = getClientSession();
    return s ? getClientByToken(s.token) : null;
  });

  // If session token doesn't match URL token, clear session
  useEffect(() => {
    const s = getClientSession();
    if (s && s.token !== token) {
      logoutClient();
      setSession(null);
      setClientData(null);
    }
  }, [token]);

  function handleLogin(c: Client) {
    setSession(getClientSession());
    setClientData(c);
  }

  function handleLogout() {
    logoutClient();
    setSession(null);
    setClientData(null);
    navigate({ to: "/" });
  }

  if (session && clientData) {
    return <ClientAppScreen client={clientData} onLogout={handleLogout} />;
  }

  return <ClientLoginScreen token={token} onLogin={handleLogin} />;
}
