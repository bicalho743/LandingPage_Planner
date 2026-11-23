import { useLocation } from "wouter";

// Aplicação principal — a conta é criada lá (7 dias grátis, sem cartão).
const APP_URL = "https://plannerorganiza.com.br";

export default function Planos() {
  const [_, setLocation] = useLocation();

  const irParaApp = () => {
    // Captura de lead best-effort (se a home já coletou o e-mail) antes de
    // mandar para a aplicação, onde a conta é criada com o trial.
    const leadEmail = localStorage.getItem("leadEmail");
    if (leadEmail) {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Cliente interessado", email: leadEmail }),
      }).catch(() => {});
    }
    window.location.href = APP_URL;
  };

  return (
    <div className="lp-page" style={{ minHeight: "100vh", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button
          onClick={() => setLocation("/")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--lp-text-mid)", fontSize: "0.9rem", marginBottom: "2rem",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ← Voltar para a página inicial
        </button>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="lp-section-eyebrow">Planos</div>
          <h2>
            Escolha como quer <em>investir</em>
            <br />no seu negócio
          </h2>
          <p className="lp-section-sub" style={{ margin: "0.75rem auto 0" }}>
            Acesso completo a tudo, em todos os planos. Teste 7 dias grátis —
            sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        <div className="lp-pricing-grid tres">
          <div className="lp-pricing-card">
            <p className="lp-pricing-plan">Flexível</p>
            <h3>Mensal</h3>
            <p className="lp-pricing-desc">Sem fidelidade. Assine, use e cancele quando quiser.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>59,90</p>
              <p className="lp-price-period">por mês · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Clientes e propostas ilimitados</li>
              <li>Propostas profissionais em PDF</li>
              <li>Financeiro completo</li>
              <li>Pós-organização e recontato</li>
              <li>Relatórios e dashboards</li>
              <li>Cléo, assistente de voz (Prévia)</li>
              <li>App Android e iPhone + acesso web</li>
            </ul>
            <button className="lp-btn-plan outline" onClick={irParaApp}>
              Começar grátis
            </button>
          </div>
          <div className="lp-pricing-card">
            <p className="lp-pricing-plan">Equilíbrio</p>
            <h3>Trimestral</h3>
            <span className="lp-badge-desconto">−17%</span>
            <p className="lp-pricing-desc" style={{ marginTop: "0.75rem" }}>R$ 149,90 a cada 3 meses. R$ 30 a menos por trimestre.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>49,97</p>
              <p className="lp-price-period">por mês · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Tudo do plano Mensal</li>
              <li>Clientes e propostas ilimitados</li>
              <li>Propostas profissionais em PDF</li>
              <li>Financeiro completo</li>
              <li>Pós-organização e recontato</li>
              <li>Relatórios e dashboards</li>
              <li>Cléo, assistente de voz (Prévia)</li>
              <li>App Android e iPhone + acesso web</li>
            </ul>
            <button className="lp-btn-plan outline" onClick={irParaApp}>
              Começar grátis
            </button>
          </div>
          <div className="lp-pricing-card featured">
            <p className="lp-pricing-plan">✦ Melhor preço</p>
            <h3>Anual</h3>
            <span className="lp-badge-popular">−33% · R$ 239 de economia no ano</span>
            <p className="lp-pricing-desc" style={{ marginTop: "0.75rem" }}>R$ 479,90 por ano. Menos de R$ 1,35 por dia.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>39,99</p>
              <p className="lp-price-period">por mês · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Tudo do plano Mensal</li>
              <li>Clientes e propostas ilimitados</li>
              <li>Propostas profissionais em PDF</li>
              <li>Financeiro completo</li>
              <li>Pós-organização e recontato</li>
              <li>Relatórios e dashboards</li>
              <li>Cléo, assistente de voz (Prévia)</li>
              <li>App Android e iPhone + acesso web</li>
            </ul>
            <button className="lp-btn-plan solid" onClick={irParaApp}>
              Começar grátis por 7 dias
            </button>
          </div>
        </div>

        <p style={{
          textAlign: "center", marginTop: "2.5rem",
          color: "var(--lp-text-light)", fontSize: "0.85rem",
        }}>
          🔒 Pagamento seguro via Stripe · A conta é criada no sistema com 7 dias
          grátis, sem cartão — você só escolhe o plano se gostar.
        </p>
      </div>
    </div>
  );
}
