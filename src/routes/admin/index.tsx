import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClients, getGlobalSettings } from "../../lib/clientStorage";
import type { Client } from "../../lib/clientStorage";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({ label, value, icon, color, sub }: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const settings = getGlobalSettings();

  useEffect(() => {
    const load = () => setClients(getClients());
    load();
    window.addEventListener("gg-clients-change", load);
    return () => window.removeEventListener("gg-clients-change", load);
  }, []);

  const active = clients.filter((c) => c.status === "active").length;
  const inactive = clients.filter((c) => c.status === "inactive").length;
  const premium = clients.filter((c) => c.plan === "premium").length;

  const recent = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do sistema — {settings.systemName}</p>
        </div>
        <Link to="/admin/clientes" className="btn-primary">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Novo Cliente
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total de Clientes"
          value={clients.length}
          color="linear-gradient(135deg, #6366f1, #8b5cf6)"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          sub="cadastrados no sistema"
        />
        <StatCard
          label="Clientes Ativos"
          value={active}
          color="linear-gradient(135deg, #10b981, #059669)"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          sub="com acesso liberado"
        />
        <StatCard
          label="Inativos"
          value={inactive}
          color="linear-gradient(135deg, #f59e0b, #d97706)"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          }
          sub="acesso suspenso"
        />
        <StatCard
          label="Plano Premium"
          value={premium}
          color="linear-gradient(135deg, #ec4899, #be185d)"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
          sub="clientes premium"
        />
      </div>

      {/* Recent clients */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Clientes Recentes</h2>
          <Link to="/admin/clientes" className="btn-ghost">
            Ver todos →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p>Nenhum cliente cadastrado ainda.</p>
            <Link to="/admin/clientes" className="btn-primary btn-sm">
              Cadastrar primeiro cliente
            </Link>
          </div>
        ) : (
          <div className="recent-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Organização</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Cadastrado</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="client-name">{c.name}</p>
                          <p className="client-email">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{c.organization || "—"}</td>
                    <td>
                      <span className={`badge ${c.plan === "premium" ? "badge-premium" : "badge-basic"}`}>
                        {c.plan === "premium" ? "Premium" : "Básico"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === "active" ? "badge-active" : "badge-inactive"}`}>
                        {c.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick info */}
      <div className="dashboard-section">
        <h2 className="section-title">Configurações do Sistema</h2>
        <div className="quick-info-grid">
          <div className="quick-info-card">
            <span className="quick-info-label">Nome do Sistema</span>
            <span className="quick-info-value">{settings.systemName}</span>
          </div>
          <div className="quick-info-card">
            <span className="quick-info-label">Max. Times/Competição</span>
            <span className="quick-info-value">{settings.maxTeamsPerCompetition}</span>
          </div>
          <div className="quick-info-card">
            <span className="quick-info-label">Modo Manutenção</span>
            <span className={`quick-info-value ${settings.maintenanceMode ? "text-warning" : "text-success"}`}>
              {settings.maintenanceMode ? "⚠️ Ativado" : "✅ Desativado"}
            </span>
          </div>
          <div className="quick-info-card">
            <span className="quick-info-label">Esportes Disponíveis</span>
            <span className="quick-info-value">{settings.allowedSports.length} esportes</span>
          </div>
        </div>
        <div className="quick-info-action">
          <Link to="/admin/configuracoes" className="btn-secondary">
            Gerenciar Configurações
          </Link>
        </div>
      </div>
    </div>
  );
}
