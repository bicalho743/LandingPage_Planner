import { useEffect } from "react";

// O cadastro acontece na aplicação principal (7 dias grátis, sem cartão).
// Esta rota existe só para compatibilidade com links antigos
// (/registro?plano=...&email=...) — redireciona imediatamente para o app.
const APP_URL = "https://plannerorganiza.com.br";

export default function Registro() {
  useEffect(() => {
    // Preserva o e-mail como lead antes de redirecionar (best-effort).
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || localStorage.getItem("leadEmail");
    if (email) {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: email.split("@")[0], email }),
      }).catch(() => {});
    }
    const t = setTimeout(() => { window.location.href = APP_URL; }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="lp-page" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center",
    }}>
      <h2 style={{ marginBottom: "0.75rem" }}>Levando você para criar sua <em>conta</em>...</h2>
      <p style={{ color: "var(--lp-text-mid)", maxWidth: 420 }}>
        O cadastro acontece direto no sistema — 7 dias grátis, sem cartão de crédito.
      </p>
      <a
        href={APP_URL}
        style={{
          marginTop: "1.5rem", background: "var(--gold)", color: "var(--lp-dark)",
          padding: "0.85rem 2rem", borderRadius: 12, textDecoration: "none", fontWeight: 700,
        }}
      >
        Ir agora →
      </a>
    </div>
  );
}
