import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  regenerateClientPassword,
  regenerateClientToken,
  generateAccessLink,
} from "../../lib/clientStorage";
import type { Client } from "../../lib/clientStorage";

export const Route = createFileRoute("/admin/clientes")({
  component: ClientesPage,
});

// ---- Types ----
type ModalMode = "create" | "edit" | "view" | null;

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  organization: string;
  plan: "basic" | "premium";
  status: "active" | "inactive";
  username: string;
  password: string;
  notes: string;
}

const EMPTY_FORM: ClientForm = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  plan: "basic",
  status: "active",
  username: "",
  password: "",
  notes: "",
};

// ---- Sub-components ----

function CopyBtn({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button onClick={copy} className={`copy-btn ${copied ? "copy-btn--done" : ""}`} title={label}>
      {copied ? (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
}

function ClientModal({
  mode,
  client,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  client: Client | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<ClientForm>>({});
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (client && (mode === "edit" || mode === "view")) {
      setForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        organization: client.organization,
        plan: client.plan,
        status: client.status,
        username: client.username,
        password: client.password,
        notes: client.notes || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [client, mode]);

  function validate(): boolean {
    const errs: Partial<ClientForm> = {};
    if (!form.name.trim()) errs.name = "Nome obrigatório";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "E-mail inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    if (mode === "create") {
      createClient({
        name: form.name,
        email: form.email,
        phone: form.phone,
        organization: form.organization,
        plan: form.plan,
        status: form.status,
        notes: form.notes,
        username: form.username || undefined,
        password: form.password || undefined,
      });
    } else if (mode === "edit" && client) {
      updateClient(client.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        organization: form.organization,
        plan: form.plan,
        status: form.status,
        notes: form.notes,
        username: form.username,
        password: form.password,
      });
    }

    setSaving(false);
    onSave();
    onClose();
  }

  const link = client ? generateAccessLink(client.token) : "";

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === "create" && "Novo Cliente"}
            {mode === "edit" && "Editar Cliente"}
            {mode === "view" && "Detalhes do Cliente"}
          </h2>
          <button className="modal-close" onClick={onClose} id="modal-close-btn">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Link de acesso (apenas editar/view) */}
          {client && (
            <div className="access-link-box">
              <p className="access-link-label">🔗 Link de Acesso do Cliente</p>
              <div className="access-link-row">
                <span className="access-link-url">{link}</span>
                <CopyBtn text={link} label="Copiar link" />
              </div>
              <p className="access-link-hint">
                Usuário: <strong>{client.username}</strong> &nbsp;|&nbsp; Senha: <strong>{client.password}</strong>
                <CopyBtn text={`Usuário: ${client.username}\nSenha: ${client.password}\nLink: ${link}`} label="Copiar credenciais" />
              </p>
            </div>
          )}

          {/* Fields */}
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Nome *</label>
              <input
                ref={firstInputRef}
                id="field-name"
                type="text"
                className={`form-input ${errors.name ? "form-input--error" : ""}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isView}
                placeholder="Nome completo"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">E-mail *</label>
              <input
                id="field-email"
                type="email"
                className={`form-input ${errors.email ? "form-input--error" : ""}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isView}
                placeholder="email@exemplo.com"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Telefone</label>
              <input
                id="field-phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={isView}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Organização</label>
              <input
                id="field-organization"
                type="text"
                className="form-input"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                disabled={isView}
                placeholder="Clube, Associação, etc."
              />
            </div>

            <div className="form-field">
              <label className="form-label">Plano</label>
              <select
                id="field-plan"
                className="form-input"
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value as "basic" | "premium" })}
                disabled={isView}
              >
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Status</label>
              <select
                id="field-status"
                className="form-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                disabled={isView}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {(mode === "edit" || mode === "view") && (
              <>
                <div className="form-field">
                  <label className="form-label">Usuário de Acesso</label>
                  <input
                    id="field-username"
                    type="text"
                    className="form-input"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    disabled={isView}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Senha de Acesso</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      id="field-password"
                      type="text"
                      className="form-input"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      disabled={isView}
                    />
                    {isEdit && client && (
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          const updated = regenerateClientPassword(client.id);
                          if (updated) setForm({ ...form, password: updated.password });
                        }}
                        title="Gerar nova senha"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="form-field form-field--full">
              <label className="form-label">Observações</label>
              <textarea
                id="field-notes"
                className="form-input form-textarea"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                disabled={isView}
                placeholder="Notas internas sobre o cliente..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isView && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose} id="modal-cancel-btn">
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
              id="modal-save-btn"
            >
              {saving ? <span className="login-spinner" /> : mode === "create" ? "Cadastrar Cliente" : "Salvar Alterações"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main Page ----

function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterPlan, setFilterPlan] = useState<"all" | "basic" | "premium">("all");
  const [modal, setModal] = useState<{ mode: ModalMode; client: Client | null }>({ mode: null, client: null });
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const load = () => setClients(getClients());
    load();
    window.addEventListener("gg-clients-change", load);
    return () => window.removeEventListener("gg-clients-change", load);
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.organization.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchPlan = filterPlan === "all" || c.plan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  function handleToggleStatus(c: Client) {
    const newStatus = c.status === "active" ? "inactive" : "active";
    updateClient(c.id, { status: newStatus });
    showToast(`Cliente ${newStatus === "active" ? "ativado" : "desativado"} com sucesso.`);
  }

  function handleDelete(c: Client) {
    deleteClient(c.id);
    setConfirmDelete(null);
    showToast("Cliente removido.", "error");
  }

  function handleCopyLink(c: Client) {
    navigator.clipboard.writeText(generateAccessLink(c.token));
    showToast("Link copiado!");
  }

  function handleRegenerateToken(c: Client) {
    regenerateClientToken(c.id);
    showToast("Novo link gerado!");
  }

  return (
    <div className="clients-page">
      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Clientes</h1>
          <p className="page-subtitle">{clients.length} clientes cadastrados</p>
        </div>
        <button
          id="btn-novo-cliente"
          className="btn-primary"
          onClick={() => setModal({ mode: "create", client: null })}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Novo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            id="search-clients"
            type="text"
            placeholder="Buscar por nome, e-mail ou organização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              className={`filter-chip ${filterStatus === s ? "filter-chip--active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "Todos" : s === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
        <div className="filter-chips">
          {(["all", "basic", "premium"] as const).map((p) => (
            <button
              key={p}
              className={`filter-chip ${filterPlan === p ? "filter-chip--active" : ""}`}
              onClick={() => setFilterPlan(p)}
            >
              {p === "all" ? "Todos planos" : p === "basic" ? "Básico" : "Premium"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p>{clients.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado para os filtros selecionados."}</p>
          {clients.length === 0 && (
            <button className="btn-primary btn-sm" onClick={() => setModal({ mode: "create", client: null })}>
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Organização</th>
                <th>Acesso</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="client-row">
                  <td>
                    <div className="client-cell">
                      <div className="client-avatar" style={{ background: c.plan === "premium" ? "linear-gradient(135deg,#ec4899,#be185d)" : "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="client-name">{c.name}</p>
                        <p className="client-email">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td-org">{c.organization || "—"}</td>
                  <td className="td-access">
                    <div className="access-mini">
                      <span className="access-mini-user">👤 {c.username}</span>
                      <button className="link-btn" onClick={() => handleCopyLink(c)} title="Copiar link">
                        🔗 Copiar link
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.plan === "premium" ? "badge-premium" : "badge-basic"}`}>
                      {c.plan === "premium" ? "⭐ Premium" : "Básico"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === "active" ? "badge-active" : "badge-inactive"}`}>
                      {c.status === "active" ? "● Ativo" : "○ Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn action-btn--view"
                        onClick={() => setModal({ mode: "view", client: c })}
                        title="Ver detalhes"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => setModal({ mode: "edit", client: c })}
                        title="Editar"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className={`action-btn ${c.status === "active" ? "action-btn--warn" : "action-btn--success"}`}
                        onClick={() => handleToggleStatus(c)}
                        title={c.status === "active" ? "Desativar" : "Ativar"}
                      >
                        {c.status === "active" ? (
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="action-btn action-btn--danger"
                        onClick={() => setConfirmDelete(c)}
                        title="Excluir"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal.mode && (
        <ClientModal
          mode={modal.mode}
          client={modal.client}
          onClose={() => setModal({ mode: null, client: null })}
          onSave={() => showToast(modal.mode === "create" ? "Cliente cadastrado com sucesso!" : "Cliente atualizado!")}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box">
            <div className="confirm-icon">🗑️</div>
            <h3>Excluir cliente?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="confirm-btns">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)} id="confirm-delete-btn">
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
