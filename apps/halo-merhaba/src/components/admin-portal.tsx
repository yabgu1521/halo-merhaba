"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { statuses, type LeadStatus } from "@/lib/intake";
import { services, type LeadKind } from "@/content/services";
import { Icon } from "./icons";
import { siteCopy } from "@/content/site-copy";
type Lead = {
  id: string;
  kind: LeadKind;
  name: string;
  email: string;
  whatsapp: string;
  status: LeadStatus;
  created_at: string;
  summary?: string;
  answers?: Record<string, string>;
  locale?: string;
};
type Note = { id: string; body: string; created_at: string };
const statusLabels: Record<LeadStatus, string> = {
  new: "Baru",
  contacted: "Dihubungi",
  waiting: "Menunggu",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  closed: "Ditutup",
};
const serviceLabel = (kind: string) =>
  kind === "product_interest"
    ? "Minat produk"
    : services.find((s) => s.kind === kind)?.name.id || kind;
export function AdminPortal({ configured }: { configured: boolean }) {
  const [authorized, setAuthorized] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [leads, setLeads] = useState<Lead[]>([]),
    [counts, setCounts] = useState<
      { kind: string; status: string; total: number }[]
    >([]),
    [kind, setKind] = useState(""),
    [selected, setSelected] = useState<Lead | null>(null),
    [notes, setNotes] = useState<Note[]>([]),
    [status, setStatus] = useState<LeadStatus>("new"),
    [note, setNote] = useState("");
  const load = useCallback(async () => {
    if (!configured) return;
    try {
      const r = await fetch(
        `/api/admin/leads${kind ? `?kind=${encodeURIComponent(kind)}` : ""}`,
        { cache: "no-store" },
      );
      if (r.status === 401) {
        setAuthorized(false);
        return;
      }
      const data = await r.json();
      if (!r.ok || !Array.isArray(data.leads)) {
        setError(
          "Data belum dapat dimuat. Periksa konfigurasi dan migrasi Halo Merhaba.",
        );
        return;
      }
      setAuthorized(true);
      setLeads(data.leads);
      setCounts(data.counts);
      setError("");
    } catch {
      setError("Tidak dapat memuat data.");
    }
  }, [configured, kind]);
  useEffect(() => {
    void load();
  }, [load]);
  async function open(lead: Lead) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, {
          cache: "no-store",
        }),
        data = await r.json();
      if (!r.ok || !data.lead) throw new Error();
      setSelected(data.lead);
      setNotes(data.notes);
      setStatus(data.lead.status);
      setNote("");
    } catch {
      setError("Detail belum dapat dimuat.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="hm-admin">
      <header className="hm-admin-header">
        <Link href="/id" className="hm-logo">
          halo<span>merhaba</span>
          <small>INTERNAL</small>
        </Link>
        <Link href="/id">
          Lihat situs <Icon name="arrow" size={16} />
        </Link>
      </header>
      {!authorized ? (
        <section className="hm-admin-login">
          <span className="hm-admin-lock">
            <Icon name="lock" size={29} />
          </span>
          <p className="hm-eyebrow">AKSES TERBATAS</p>
          <h1>Ruang kerja Halo Merhaba.</h1>
          <p>
            Hanya admin yang ditetapkan dapat melihat permintaan dan catatan
            internal. Tidak ada pendaftaran admin publik.
          </p>
          {!configured && (
            <p className="hm-dev-state">
              Mode pengembangan: autentikasi Halo Merhaba belum dikonfigurasi.
              Data internal tidak ditampilkan.
            </p>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const fd = new FormData(e.currentTarget);
              try {
                const r = await fetch("/api/admin/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: fd.get("email"),
                      password: fd.get("password"),
                    }),
                  }),
                  data = await r.json();
                if (!r.ok || data.ok !== true) {
                  setError(
                    "Login tidak berhasil. Periksa akun dan akses admin.",
                  );
                  return;
                }
                await load();
              } catch {
                setError("Login belum tersedia.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="hm-field">
              <span>Email admin</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </label>
            <label className="hm-field">
              <span>Kata sandi</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </label>
            <button className="hm-button" disabled={!configured || busy}>
              {busy ? "Memeriksa…" : "Masuk"}
              <Icon name="arrow" size={17} />
            </button>
          </form>
          {error && (
            <p className="hm-form-error" role="alert">
              {error}
            </p>
          )}
        </section>
      ) : (
        <>
          <div className="hm-admin-heading">
            <div>
              <p className="hm-eyebrow">RUANG KERJA INTERNAL</p>
              <h1>Permintaan masuk.</h1>
              <p>
                Data pelanggan hanya untuk tindak lanjut sesuai persetujuan.
              </p>
            </div>
            <button
              className="hm-button secondary"
              onClick={async () => {
                const r = await fetch("/api/admin/logout", { method: "POST" });
                if (r.ok) {
                  setAuthorized(false);
                  setLeads([]);
                  setSelected(null);
                  setNotes([]);
                }
              }}
            >
              Keluar
            </button>
          </div>
          <div className="hm-admin-stats">
            <article>
              <small>Permintaan baru</small>
              <strong>
                {counts
                  .filter((c) => c.status === "new")
                  .reduce((sum, c) => sum + Number(c.total), 0)}
              </strong>
            </article>
            {[...services.map((s) => s.kind), "product_interest"].map(
              (type) => (
                <article key={type}>
                  <small>{serviceLabel(type)}</small>
                  <strong>
                    {counts
                      .filter((c) => c.kind === type)
                      .reduce((sum, c) => sum + Number(c.total), 0)}
                  </strong>
                </article>
              ),
            )}
          </div>
          <div className="hm-admin-workspace">
            <section className="hm-admin-list">
              <div className="hm-admin-filter">
                <label className="hm-field">
                  <span>Layanan</span>
                  <select
                    value={kind}
                    onChange={(e) => {
                      setKind(e.target.value);
                      setSelected(null);
                    }}
                  >
                    <option value="">Semua</option>
                    {[...services.map((s) => s.kind), "product_interest"].map(
                      (type) => (
                        <option key={type} value={type}>
                          {serviceLabel(type)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <button className="hm-text-link" onClick={() => void load()}>
                  Muat ulang
                </button>
              </div>
              <p className="hm-muted">
                Maksimal 100 permintaan terbaru per filter. Ringkasan menghitung
                seluruh data.
              </p>
              {leads.length ? (
                leads.map((lead) => (
                  <button
                    className={`hm-lead-row ${lead.id === selected?.id ? "selected" : ""}`}
                    key={lead.id}
                    onClick={() => void open(lead)}
                  >
                    <div>
                      <strong>{lead.name || lead.email}</strong>
                      <span>{serviceLabel(lead.kind)}</span>
                      <small>
                        {new Date(lead.created_at).toLocaleString("id-ID")}
                      </small>
                    </div>
                    <span className={`hm-status ${lead.status}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </button>
                ))
              ) : (
                <div className="hm-admin-empty">
                  Belum ada permintaan pada filter ini.
                </div>
              )}
            </section>
            <section className="hm-admin-detail">
              {selected ? (
                <>
                  <p className="hm-eyebrow">{serviceLabel(selected.kind)}</p>
                  <h2>{selected.name || selected.email}</h2>
                  <p className="hm-muted">
                    {new Date(selected.created_at).toLocaleString("id-ID")} ·{" "}
                    {selected.locale}
                  </p>
                  <dl>
                    <div>
                      <dt>Email</dt>
                      <dd>{selected.email || "—"}</dd>
                    </div>
                    <div>
                      <dt>WhatsApp</dt>
                      <dd>{selected.whatsapp || "—"}</dd>
                    </div>
                    {Object.entries(selected.answers || {}).map(
                      ([key, value]) => (
                        <div key={key}>
                          <dt>
                            {typeof siteCopy.id[
                              key as keyof typeof siteCopy.id
                            ] === "string"
                              ? (siteCopy.id[
                                  key as keyof typeof siteCopy.id
                                ] as string)
                              : key}
                          </dt>
                          <dd>{value || "—"}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                  <h3>Penjelasan pelanggan</h3>
                  <p className="hm-admin-summary">{selected.summary || "—"}</p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBusy(true);
                      setError("");
                      setNotice("");
                      try {
                        const r = await fetch(
                            `/api/admin/leads/${selected.id}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                status,
                                ...(note.trim() ? { note: note.trim() } : {}),
                              }),
                            },
                          ),
                          data = await r.json();
                        if (!r.ok || data.ok !== true) throw new Error();
                        setNotice("Status dan catatan tersimpan.");
                        await open(selected);
                        await load();
                        setNotice("Status dan catatan tersimpan.");
                      } catch {
                        setError("Perubahan belum tersimpan.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <label className="hm-field">
                      <span>Status</span>
                      <select
                        aria-label="Status"
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as LeadStatus)
                        }
                      >
                        {statuses.map((value) => (
                          <option key={value} value={value}>
                            {statusLabels[value]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="hm-field">
                      <span>Catatan internal</span>
                      <textarea
                        rows={4}
                        maxLength={3000}
                        aria-label="Catatan internal"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Tidak dikirim ke pelanggan"
                      />
                    </label>
                    <button className="hm-button" disabled={busy}>
                      {busy ? "Menyimpan…" : "Simpan perubahan"}
                    </button>
                  </form>
                  <h3>Riwayat catatan</h3>
                  {notes.length ? (
                    notes.map((n) => (
                      <article className="hm-admin-note" key={n.id}>
                        <small>
                          {new Date(n.created_at).toLocaleString("id-ID")}
                        </small>
                        <p>{n.body}</p>
                      </article>
                    ))
                  ) : (
                    <p className="hm-muted">Belum ada catatan.</p>
                  )}
                </>
              ) : (
                <div className="hm-admin-empty">
                  <Icon name="shield" size={32} />
                  <h2>Pilih permintaan.</h2>
                  <p>
                    Kontak, jawaban, status, dan catatan internal akan
                    ditampilkan di sini.
                  </p>
                </div>
              )}
            </section>
          </div>
          {error && (
            <p className="hm-form-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="hm-admin-notice" role="status">
              {notice}
            </p>
          )}
        </>
      )}
    </main>
  );
}
