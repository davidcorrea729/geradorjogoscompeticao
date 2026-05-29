import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getGlobalSettings, saveGlobalSettings } from "../../lib/clientStorage";
import type { GlobalSettings } from "../../lib/clientStorage";
import { getAdminCredentials, setAdminCredentials } from "../../lib/auth";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [settings, setSettings] = useState<GlobalSettings>(getGlobalSettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSport, setNewSport] = useState("");

  // Admin credentials
  const [adminUser, setAdminUser] = useState(getAdminCredentials().username);
  const [adminPass, setAdminPass] = useState(getAdminCredentials().password);
  const [adminPassConfirm, setAdminPassConfirm] = useState("");
  const [credSaved, setCredSaved] = useState(false);
  const [credError, setCredError] = useState("");

  useEffect(() => {
    window.addEventListener("gg-settings-change", () => setSettings(getGlobalSettings()));
  }, []);

  async function handleSaveSettings() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    saveGlobalSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleAddSport() {
    const sport = newSport.trim();
    if (sport && !settings.allowedSports.includes(sport)) {
      setSettings({ ...settings, allowedSports: [...settings.allowedSports, sport] });
      setNewSport("");
    }
  }

  function handleRemoveSport(s: string) {
    setSettings({ ...settings, allowedSports: settings.allowedSports.filter((x) => x !== s) });
  }

  function handleSaveCredentials() {
    setCredError("");
    if (!adminUser.trim()) { setCredError("Usuário não pode ser vazio."); return; }
    if (adminPass.length < 6) { setCredError("Senha deve ter pelo menos 6 caracteres."); return; }
    if (adminPass !== adminPassConfirm) { setCredError("As senhas não coincidem."); return; }
    setAdminCredentials({ username: adminUser, password: adminPass });
    setCredSaved(true);
    setTimeout(() => setCredSaved(false), 2500);
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações do Sistema</h1>
          <p className="page-subtitle">
            As configurações abaixo se aplicam a <strong>todos os clientes</strong> automaticamente.
          </p>
        </div>
      </div>

      <div className="config-sections">
        {/* ---- Identidade ---- */}
        <section className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              🎨
            </div>
            <div>
              <h2 className="config-section-title">Identidade do Sistema</h2>
              <p className="config-section-desc">Nome e aparência exibidos aos clientes.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Nome do Sistema</label>
              <input
                id="cfg-system-name"
                type="text"
                className="form-input"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                placeholder="Ex: GerComp"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Subtítulo</label>
              <input
                id="cfg-subtitle"
                type="text"
                className="form-input"
                value={settings.systemSubtitle}
                onChange={(e) => setSettings({ ...settings, systemSubtitle: e.target.value })}
                placeholder="Ex: Plataforma de Competições"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Cor Primária</label>
              <div className="color-field">
                <input
                  id="cfg-primary-color"
                  type="color"
                  className="color-picker"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Cor de Destaque</label>
              <div className="color-field">
                <input
                  id="cfg-accent-color"
                  type="color"
                  className="color-picker"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>
            <div className="form-field form-field--full">
              <label className="form-label">Mensagem de Boas-Vindas</label>
              <textarea
                id="cfg-welcome"
                className="form-input form-textarea"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                rows={2}
                placeholder="Mensagem exibida ao cliente ao entrar no sistema"
              />
            </div>
          </div>
        </section>

        {/* ---- Competições ---- */}
        <section className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              🏆
            </div>
            <div>
              <h2 className="config-section-title">Regras de Competição</h2>
              <p className="config-section-desc">Limites e esportes disponíveis no sistema.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Máx. Times por Competição</label>
              <input
                id="cfg-max-teams"
                type="number"
                className="form-input"
                value={settings.maxTeamsPerCompetition}
                onChange={(e) => setSettings({ ...settings, maxTeamsPerCompetition: Number(e.target.value) })}
                min={2}
                max={256}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Máx. Atletas por Clube</label>
              <input
                id="cfg-max-athletes"
                type="number"
                className="form-input"
                value={settings.maxAthletesPerClub}
                onChange={(e) => setSettings({ ...settings, maxAthletesPerClub: Number(e.target.value) })}
                min={1}
                max={500}
              />
            </div>

            <div className="form-field form-field--full">
              <label className="form-label">Esportes Disponíveis</label>
              <div className="sport-tags">
                {settings.allowedSports.map((s) => (
                  <span key={s} className="sport-tag">
                    {s}
                    <button className="sport-tag-remove" onClick={() => handleRemoveSport(s)} title="Remover">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="add-sport-row">
                <input
                  id="cfg-new-sport"
                  type="text"
                  className="form-input"
                  placeholder="Adicionar esporte..."
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSport()}
                />
                <button className="btn-secondary" onClick={handleAddSport}>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Controle ---- */}
        <section className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              ⚙️
            </div>
            <div>
              <h2 className="config-section-title">Controle do Sistema</h2>
              <p className="config-section-desc">Configurações operacionais do sistema.</p>
            </div>
          </div>

          <div className="toggle-list">
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Exibir Branding</p>
                <p className="toggle-desc">Mostra o nome do sistema no rodapé dos clientes.</p>
              </div>
              <button
                id="cfg-branding-toggle"
                className={`toggle-btn ${settings.showBranding ? "toggle-btn--on" : ""}`}
                onClick={() => setSettings({ ...settings, showBranding: !settings.showBranding })}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <div>
                <p className="toggle-label" style={{ color: settings.maintenanceMode ? "#f59e0b" : undefined }}>
                  {settings.maintenanceMode ? "⚠️ " : ""}Modo Manutenção
                </p>
                <p className="toggle-desc">
                  Quando ativado, os clientes não conseguem acessar o sistema.
                </p>
              </div>
              <button
                id="cfg-maintenance-toggle"
                className={`toggle-btn ${settings.maintenanceMode ? "toggle-btn--on toggle-btn--warn" : ""}`}
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="config-save-bar">
          <button
            id="btn-save-settings"
            className={`btn-primary btn-lg ${saved ? "btn-saved" : ""}`}
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <span className="login-spinner" />
            ) : saved ? (
              <>✅ Configurações salvas!</>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Salvar Configurações
              </>
            )}
          </button>
          <p className="config-save-hint">
            As alterações são aplicadas imediatamente a todos os clientes.
          </p>
        </div>

        {/* ---- Admin Credentials ---- */}
        <section className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon" style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
              🔐
            </div>
            <div>
              <h2 className="config-section-title">Credenciais do Administrador</h2>
              <p className="config-section-desc">Altere o usuário e senha do painel admin.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Usuário Admin</label>
              <input
                id="cfg-admin-user"
                type="text"
                className="form-input"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="usuario"
              />
            </div>
            <div className="form-field" />
            <div className="form-field">
              <label className="form-label">Nova Senha</label>
              <input
                id="cfg-admin-pass"
                type="password"
                className="form-input"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Confirmar Nova Senha</label>
              <input
                id="cfg-admin-pass-confirm"
                type="password"
                className="form-input"
                value={adminPassConfirm}
                onChange={(e) => setAdminPassConfirm(e.target.value)}
                placeholder="Repita a senha"
              />
            </div>
          </div>

          {credError && <p className="form-error" style={{ marginTop: "0.5rem" }}>{credError}</p>}

          <div style={{ marginTop: "1rem" }}>
            <button
              id="btn-save-credentials"
              className={`btn-secondary ${credSaved ? "btn-saved" : ""}`}
              onClick={handleSaveCredentials}
            >
              {credSaved ? "✅ Credenciais salvas!" : "Alterar Credenciais"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
