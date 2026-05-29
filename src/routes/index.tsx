import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClients, Client } from "../lib/clientStorage";

export const Route = createFileRoute("/")({
  component: PublicLandingPage,
});

function PublicLandingPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [clients, setClients] = useState<Client[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    const load = () => {
      // Removemos temporariamente o filtro de status para garantir que apareçam
      const allClients = getClients();
      setClients(allClients);
    };
    load();
    window.addEventListener("gg-clients-change", load);
    return () => window.removeEventListener("gg-clients-change", load);
  }, []);

  const selectedClient = clients.find(c => c.token === selectedTenant);

  const handleConsultar = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant) {
      nav({ to: `/cliente/${selectedTenant}` });
    }
  };

  const handleClassificacao = () => {
    if (selectedTenant) {
      // Typically navigating to a client specific classification page
      nav({ to: `/cliente/${selectedTenant}` });
    }
  };

  const handleResultados = () => {
    if (selectedTenant) {
      // Typically navigating to a client specific results page
      nav({ to: `/cliente/${selectedTenant}` });
    }
  };

  return (
    <div className="login-page" style={{ padding: 0, flexDirection: "column", justifyContent: "flex-start" }}>
      {/* Background with Overlays */}
      <div className="login-bg" style={{ zIndex: 0, opacity: 0.6 }}>
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1 }}></div>

      {/* Header - discreto com link Admin */}
      <header style={{ position: "relative", zIndex: 20, width: "100%", padding: "1.5rem 2rem", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        <button 
          onClick={() => nav({ to: "/login" })}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer", transition: "color 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "white"}
          onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          Admin
        </button>
      </header>

      {/* Main Content */}
      <main style={{ position: "relative", zIndex: 20, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "0 1rem", paddingBottom: "4rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "white", textShadow: "0 4px 20px rgba(0,0,0,0.5)", lineHeight: 1.1, marginBottom: "1rem" }}>
            Acompanhe a competição <br/> em tempo real
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "#a5b4fc", fontWeight: 500, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            Selecione o organizador para consultar os dados da competição.
          </p>

          {/* Barra de seleção de organizador */}
          <form onSubmit={handleConsultar} style={{ maxWidth: "800px", margin: "2.5rem auto 0", display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            <div style={{ position: "relative", flex: "1 1 300px" }}>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                style={{
                  width: "100%", height: "4.5rem", padding: "0 3rem 0 1.5rem",
                  borderRadius: "999px", color: "#111827", fontSize: "1.1rem",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)", outline: "none",
                  border: "2px solid transparent", transition: "all 0.2s",
                  background: "rgba(255,255,255,0.95)", backdropFilter: "blur(4px)",
                  appearance: "none", cursor: "pointer", fontWeight: 500
                }}
              >
                <option value="" disabled>Selecione o organizador da competição...</option>
                {clients.map(c => (
                  <option key={c.token} value={c.token}>
                    {c.name}{c.organization ? ` — ${c.organization}` : ""}
                  </option>
                ))}
              </select>
              <div style={{ position: "absolute", right: "1.25rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={!selectedTenant}
              style={{
                height: "4.5rem", borderRadius: "999px", background: selectedTenant ? "#2563eb" : "rgba(37,99,235,0.5)",
                color: "white", fontWeight: 700, fontSize: "1rem", padding: "0 2.5rem",
                textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s",
                boxShadow: selectedTenant ? "0 10px 25px -5px rgba(37,99,235,0.4)" : "none",
                border: "none", cursor: selectedTenant ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Consultar Competição
            </button>
          </form>
        </div>

        {/* Cards de Classificação e Resultados */}
        {selectedTenant && selectedClient && (
          <div style={{ width: "100%", maxWidth: "800px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginTop: "1rem", animation: "card-in 0.5s ease" }}>
            
            {/* Card Classificação */}
            <button
              onClick={handleClassificacao}
              style={{
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: "1rem",
                padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                color: "#111827", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
                textAlign: "left", transition: "transform 0.3s, box-shadow 0.3s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 25px 30px -5px rgba(59,130,246,0.3)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "#dbeafe", padding: "0.75rem", borderRadius: "0.75rem", color: "#2563eb" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: "1.25rem", textTransform: "uppercase", letterSpacing: "0.025em", margin: 0 }}>Classificação</h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 500, margin: "0.25rem 0 0 0" }}>Ranking e posições</p>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.5rem 0 0 0" }}>
                Competições de <strong style={{ color: "#374151" }}>{selectedClient.name}</strong>
              </p>
            </button>

            {/* Card Resultados */}
            <button
              onClick={handleResultados}
              style={{
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: "1rem",
                padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                color: "#111827", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
                textAlign: "left", transition: "transform 0.3s, box-shadow 0.3s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 25px 30px -5px rgba(16,185,129,0.3)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "#d1fae5", padding: "0.75rem", borderRadius: "0.75rem", color: "#059669" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="m4 10 4 4 4-4"/><path d="m16 14 4-4-4-4"/></svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: "1.25rem", textTransform: "uppercase", letterSpacing: "0.025em", margin: 0 }}>Resultados</h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 500, margin: "0.25rem 0 0 0" }}>Programação e placares</p>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.5rem 0 0 0" }}>
                Competições de <strong style={{ color: "#374151" }}>{selectedClient.name}</strong>
              </p>
            </button>

          </div>
        )}

        {!selectedTenant && (
          <p style={{ color: "rgba(165,180,252,0.6)", fontSize: "0.875rem", marginTop: "2rem", fontStyle: "italic" }}>
            Selecione um organizador acima para ver as opções de consulta.
          </p>
        )}

      </main>
    </div>
  );
}
