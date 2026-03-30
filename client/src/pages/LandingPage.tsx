import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { loginWithEmailPassword, sendPasswordReset } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  const [heroEmail, setHeroEmail] = useState("");
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [heroMsg, setHeroMsg] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLDivElement | null, index: number) => {
    revealRefs.current[index] = el;
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleHeroSubmit = async () => {
    if (!heroEmail || !heroEmail.includes("@")) {
      setHeroMsg("Por favor, insira um email válido.");
      return;
    }
    setHeroSubmitting(true);
    setHeroMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: heroEmail, name: heroEmail.split("@")[0] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Erro ${res.status}`);
      }
      const capturedEmail = heroEmail;
      localStorage.setItem("leadEmail", capturedEmail);
      setHeroEmail("");
      setHeroMsg("✅ Ótimo! Redirecionando...");
      setTimeout(() => setLocation("/registro?email=" + encodeURIComponent(capturedEmail)), 1200);
    } catch (err: any) {
      setHeroMsg("❌ " + (err?.message || "Ocorreu um erro. Tente novamente."));
    } finally {
      setHeroSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    setLoginSuccess("");
    try {
      await loginWithEmailPassword(loginEmail, loginPassword);
      setLoginSuccess("Login realizado com sucesso! Redirecionando...");
      setTimeout(() => {
        if (import.meta.env.PROD) {
          window.location.href = "https://plannerorganiza.com.br/";
        } else {
          setLocation("/dashboard");
        }
      }, 1000);
    } catch (error: any) {
      setLoginError(error.message || "Credenciais inválidas. Verifique seu email e senha.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError("Digite seu e-mail acima antes de recuperar a senha.");
      return;
    }
    setResetLoading(true);
    setLoginError("");
    try {
      await sendPasswordReset(loginEmail);
      setLoginSuccess(`Link de recuperação enviado para ${loginEmail}.`);
    } catch (error: any) {
      setLoginError(error.message || "Erro ao enviar email de recuperação.");
    } finally {
      setResetLoading(false);
    }
  };

  const faqItems = [
    {
      q: "Preciso ter experiência com tecnologia?",
      a: "Não. O Planner Organizer foi criado pensando em personal organizers, não em programadoras. A interface é intuitiva e você começa a usar em minutos — sem tutoriais longos.",
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Sem fidelidade, sem multa, sem burocracia. Você pode cancelar a qualquer momento direto pelo painel da sua conta.",
    },
    {
      q: "Meus dados ficam seguros?",
      a: "Completamente. O sistema segue a LGPD e seus dados — e os dos seus clientes — são armazenados com segurança e nunca compartilhados com terceiros.",
    },
    {
      q: "Como funciona o período de teste?",
      a: "Você tem 7 dias para usar o sistema completo gratuitamente, sem precisar cadastrar cartão de crédito. Se gostar, escolhe o plano ideal e continua. Se não gostar, simplesmente não assina.",
    },
    {
      q: "Posso personalizar as propostas com meu logo?",
      a: "Sim! A partir do plano Pro você pode incluir seu logo, cores e informações personalizadas em todas as propostas. Seus clientes vão ver a sua marca, não a nossa.",
    },
    {
      q: "Tem suporte em português?",
      a: "Sim, 100% em português. O suporte é feito por humanos (não bots) via WhatsApp no plano Pro e Studio, e via e-mail no plano Essencial.",
    },
  ];

  let revealIdx = 0;

  return (
    <div className="lp-page">

      {/* ── HEADER ── */}
      <header className={`lp-header${headerScrolled ? " scrolled" : ""}`}>
        <a href="#" className="lp-logo" onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}>
          Planner <span>Organizer</span>
        </a>
        <nav className="lp-nav">
          <a href="#funcionalidades" onClick={(e) => { e.preventDefault(); scrollTo("funcionalidades"); }}>Funcionalidades</a>
          <a href="#planos" onClick={(e) => { e.preventDefault(); scrollTo("planos"); }}>Planos</a>
          <a href="#depoimentos" onClick={(e) => { e.preventDefault(); scrollTo("depoimentos"); }}>Depoimentos</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo("faq"); }}>FAQ</a>
        </nav>
        <a href="#login" className="lp-header-cta" onClick={(e) => { e.preventDefault(); scrollTo("login"); }}>Entrar</a>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero" id="inicio">
        <div className="lp-hero-bg" />

        <div className="lp-hero-left">
          <div className="lp-eyebrow">Para Personal Organizers</div>
          <h1>
            Você organiza a vida<br />dos outros.<br />
            <em>Quem organiza<br />o seu negócio?</em>
          </h1>
          <p className="lp-hero-sub">
            Propostas elegantes em minutos, clientes organizados, finanças sob controle.
            Tudo que você precisava para se sentir tão profissional quanto você realmente é.
          </p>

          <div className="lp-hero-capture">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              value={heroEmail}
              onChange={(e) => setHeroEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleHeroSubmit()}
            />
            <button className="lp-btn-primary" onClick={handleHeroSubmit} disabled={heroSubmitting}>
              {heroSubmitting ? "Enviando..." : "Começar grátis"}
            </button>
          </div>
          {heroMsg && (
            <p style={{ fontSize: "0.8rem", marginBottom: "0.75rem", color: heroMsg.startsWith("✅") ? "#28a745" : "#dc3545" }}>
              {heroMsg}
            </p>
          )}
          <p className="lp-hero-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            7 dias grátis — sem cartão de crédito
          </p>

          <div className="lp-hero-stats">
            <div className="lp-stat-item">
              <span className="lp-stat-num">+2.4k</span>
              <span className="lp-stat-label">organizers ativas</span>
            </div>
            <div className="lp-stat-item">
              <span className="lp-stat-num">5 min</span>
              <span className="lp-stat-label">para sua 1ª proposta</span>
            </div>
            <div className="lp-stat-item">
              <span className="lp-stat-num">98%</span>
              <span className="lp-stat-label">recomendam</span>
            </div>
          </div>
        </div>

        <div className="lp-hero-right" id="login">
          <div className="lp-login-card">
            <div className="lp-login-card-header">
              <p>Bem-vinda de volta ✨</p>
              <span>Acesse sua conta</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="lp-form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="lp-form-group">
                <label>Senha</label>
                <div className="lp-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="lp-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && <div className="lp-login-error">{loginError}</div>}
              {loginSuccess && <div className="lp-login-success">{loginSuccess}</div>}

              <button type="submit" className="lp-btn-login" disabled={loginLoading}>
                {loginLoading && (
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                )}
                {loginLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="lp-login-divider">ou</div>

            <button className="lp-btn-trial" onClick={() => setLocation("/planos")}>
              Criar conta grátis — 7 dias
            </button>

            <p className="lp-login-footer">
              Esqueceu a senha?{" "}
              <button onClick={handlePasswordReset} disabled={resetLoading}>
                {resetLoading ? "Enviando..." : "Recuperar acesso"}
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="lp-trust-bar">
        <div className="lp-trust-item">🔒 <strong>Dados seguros</strong> &nbsp;LGPD compliant</div>
        <div className="lp-trust-item">⚡ <strong>Suporte humano</strong> &nbsp;via WhatsApp</div>
        <div className="lp-trust-item">🏆 <strong>Proposta em</strong> &nbsp;menos de 5 minutos</div>
        <div className="lp-trust-item">💳 <strong>Cancele quando quiser</strong> &nbsp;sem burocracia</div>
      </div>

      {/* ── DORES ── */}
      <div className="lp-pains" id="dores">
        <div className="lp-pains-left lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Você não está sozinha</div>
          <h2>A ironia de organizar<br /><em>a vida dos outros</em></h2>
          <p className="lp-section-sub">
            Você é especialista em transformar espaços. Mas nos bastidores, planilhas espalhadas,
            propostas no WhatsApp e finanças descontroladas te fazem sentir que não é profissional
            o suficiente — mesmo você sendo incrível no que faz.
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--lp-text-light)", marginTop: "1.5rem" }}>
            O Planner Organizer foi criado para resolver exatamente isso.
          </p>
        </div>

        <div className="lp-pains-right">
          {[
            { icon: "💸", h: '"Não sei quanto cobrar sem perder o cliente"', p: "Precificação guiada com calculadora de diária, hora e complexidade do projeto." },
            { icon: "📄", h: '"Minha proposta não parece profissional"', p: "Propostas elegantes com logo, etapas e valor — prontas em menos de 5 minutos." },
            { icon: "📅", h: '"Minha agenda de clientes é uma bagunça"', p: "Todos os clientes, histórico e próximos contatos em um só lugar, sempre atualizado." },
            { icon: "😰", h: '"Tenho medo de não receber"', p: "Saiba exatamente quem pagou, quem está em aberto e quanto você vai ganhar este mês." },
            { icon: "🌱", h: '"Quando crescer, vou me perder"', p: "O sistema avisa quando é hora de retomar o contato com cada cliente — nunca perca uma oportunidade." },
          ].map((item, i) => (
            <div className="lp-pain-item lp-reveal" key={i} ref={(el) => addRevealRef(el, revealIdx++)}>
              <div className="lp-pain-icon">{item.icon}</div>
              <div className="lp-pain-text">
                <h4>{item.h}</h4>
                <p>{item.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="lp-section lp-features" id="funcionalidades">
        <div className="lp-features-header lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">O que você ganha</div>
          <h2>Tudo para você <em>brilhar</em><br />com seus clientes</h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>
            Pare de cobrar pela hora. Comece a cobrar pelo resultado. E entregue uma experiência que impressiona desde o primeiro contato.
          </p>
        </div>
        <div className="lp-features-grid">
          {[
            { icon: "📋", h: "Propostas Elegantes", p: "Crie propostas com sua identidade visual, descrição por etapa e valor total. Envie em minutos e impressione antes mesmo de começar.", tag: "↗ +60% taxa de fechamento" },
            { icon: "👩‍💼", h: "Gestão de Clientes", p: "Histórico completo de cada cliente, projetos anteriores, preferências e alertas de recontato. Nunca esqueça de ninguém importante.", tag: "Relacionamento duradouro" },
            { icon: "💰", h: "Controle Financeiro", p: "Receitas, despesas, recebimentos em aberto e previsão mensal. Tenha clareza sobre seu dinheiro e tome decisões com confiança.", tag: "Sem mais ansiedade" },
            { icon: "📊", h: "Dashboard Visual", p: "Gráficos claros do seu desempenho. Quantos projetos, quanto faturou, qual serviço dá mais resultado. Uma visão de negócio real.", tag: "Decisões inteligentes" },
            { icon: "🏷️", h: "Precificação Guiada", p: "Calcule o valor certo para cada projeto com base nos seus custos, tempo e complexidade. Nunca mais cobre menos do que merece.", tag: "↑ Aumente seu faturamento" },
            { icon: "📤", h: "Relatórios e Exportação", p: "Exporte clientes, financeiro e propostas em CSV. Tenha tudo organizado para seu contador ou para suas análises mensais.", tag: "Profissionalismo total" },
          ].map((f, i) => (
            <div className="lp-feature-card lp-reveal" key={i} ref={(el) => addRevealRef(el, revealIdx++)}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
              <span className="lp-feature-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROPOSAL PREVIEW ── */}
      <div className="lp-proposal-preview">
        <div className="lp-proposal-left lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Preview real</div>
          <h2>Uma proposta que<br /><em>fecha sozinha</em></h2>
          <p className="lp-section-sub">
            Seus clientes de alto padrão esperam profissionalismo desde o primeiro contato.
            Com o Planner Organizer, você envia uma proposta impecável — com logo, etapas detalhadas
            e valor — em menos de 5 minutos.
          </p>
          <ul className="lp-proposal-points">
            <li>Personalizada com seu nome e identidade visual</li>
            <li>Dividida por etapas do projeto</li>
            <li>Validade, forma de pagamento e condições</li>
            <li>Enviada por link, PDF ou WhatsApp</li>
            <li>Rastreável — saiba quando foi visualizada</li>
          </ul>
          <button className="lp-proposal-cta" onClick={() => setLocation("/planos")}>
            Criar minha primeira proposta
          </button>
        </div>

        <div className="lp-proposal-right lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-proposal-mock">
            <div className="lp-mock-header">
              <span className="lp-mock-logo">Ana Lima Organizer</span>
              <span className="lp-mock-badge">Proposta</span>
            </div>
            <div className="lp-mock-body">
              <p className="lp-mock-title">Organização Residencial</p>
              <p className="lp-mock-subtitle">Cliente: Fernanda Costa · São Paulo, SP</p>
              <div className="lp-mock-section">
                <p className="lp-mock-section-label">Escopo do Projeto</p>
                <div className="lp-mock-line" style={{ width: "80%" }} />
                <div className="lp-mock-line" style={{ width: "60%" }} />
                <div className="lp-mock-line" style={{ width: "70%" }} />
              </div>
              <div className="lp-mock-section">
                <p className="lp-mock-section-label">Etapas</p>
                <div className="lp-mock-line" style={{ width: "40%" }} />
                <div className="lp-mock-line" style={{ width: "60%" }} />
                <div className="lp-mock-line" style={{ width: "50%" }} />
              </div>
              <div className="lp-mock-total">
                <span>Investimento total</span>
                <strong>R$ 2.400</strong>
              </div>
            </div>
            <div className="lp-mock-footer">
              Válido por 7 dias · Pagamento: 50% entrada + 50% conclusão
            </div>
          </div>
        </div>
      </div>

      {/* ── BEFORE AFTER ── */}
      <section className="lp-section lp-beforeafter">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }} className="lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Transformação</div>
          <h2>O antes e depois<br /><em>do seu negócio</em></h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>
            Assim como você transforma closets e cozinhas, o Planner Organizer transforma a gestão do seu negócio.
          </p>
        </div>

        <div className="lp-ba-grid lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-ba-card before">
            <div className="lp-ba-label before-label">😔 Antes</div>
            <div className="lp-ba-item"><span className="icon">📊</span><p>Planilhas espalhadas no Google Drive, Desktop e WhatsApp</p></div>
            <div className="lp-ba-item"><span className="icon">⏱️</span><p>Proposta levava <strong>horas</strong> pra montar e ainda ficava feia</p></div>
            <div className="lp-ba-item"><span className="icon">😬</span><p>Sem saber exatamente quanto entrou e quanto saiu no mês</p></div>
            <div className="lp-ba-item"><span className="icon">🤦</span><p>Cliente importante que precisava de retorno... esquecido</p></div>
            <div className="lp-ba-item"><span className="icon">🎭</span><p>Sensação constante de que <strong>"não sou profissional de verdade"</strong></p></div>
          </div>

          <div className="lp-ba-arrow">→</div>

          <div className="lp-ba-card after">
            <div className="lp-ba-label after-label">✨ Depois</div>
            <div className="lp-ba-item"><span className="icon">🗂️</span><p>Tudo em um painel: clientes, propostas, finanças e agenda</p></div>
            <div className="lp-ba-item"><span className="icon">⚡</span><p>Proposta elegante enviada em <strong>menos de 5 minutos</strong></p></div>
            <div className="lp-ba-item"><span className="icon">📈</span><p>Clareza total sobre receitas, gastos e previsão do próximo mês</p></div>
            <div className="lp-ba-item"><span className="icon">🔔</span><p>Alertas de recontato automáticos — nunca mais esqueça ninguém</p></div>
            <div className="lp-ba-item"><span className="icon">💪</span><p>Confiança de uma profissional que atende clientes de <strong>alto padrão</strong></p></div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section lp-testimonials" id="depoimentos">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }} className="lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Depoimentos</div>
          <h2>Organizers que já <em>transformaram</em><br />seu negócio</h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>Mulheres reais, resultados reais — de São Paulo a Recife.</p>
        </div>
        <div className="lp-t-grid">
          {[
            {
              text: "Antes eu mandava proposta no WhatsApp sem nem formatação. Hoje mando um link lindo com meu logo e a cliente fica impressionada. Fechei 3 novos projetos no primeiro mês.",
              name: "Camila Leal", role: "Personal Organizer · São Paulo, SP",
              initials: "CL", color: "linear-gradient(135deg, #2E4A7A, #B8973C)",
              result: "↑ 3 novos fechamentos no 1º mês"
            },
            {
              text: "Eu tinha síndrome da impostora enorme. Sentia que não era profissional de verdade. Hoje tenho dashboard, histórico, proposta bonita... isso me deu uma confiança que não tem preço.",
              name: "Renata Nogueira", role: "Personal Organizer · Belo Horizonte, MG",
              initials: "RN", color: "linear-gradient(135deg, #6B7FA8, #2E4A7A)",
              result: "Superou a síndrome da impostora"
            },
            {
              text: "O controle financeiro mudou tudo pra mim. Eu não sabia nem o que tinha entrado no mês. Agora sei exatamente quanto faturei, quem está em aberto e como está minha previsão de receita.",
              name: "Juliana Matos", role: "Personal Organizer · Recife, PE",
              initials: "JM", color: "linear-gradient(135deg, #B8973C, #2E4A7A)",
              result: "Clareza financeira total"
            },
          ].map((t, i) => (
            <div className="lp-t-card lp-reveal" key={i} ref={(el) => addRevealRef(el, revealIdx++)}>
              <span className="quote-mark">"</span>
              <p className="lp-t-text">{t.text}</p>
              <div className="lp-t-author">
                <div className="lp-t-avatar" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <p className="lp-t-name">{t.name}</p>
                  <p className="lp-t-role">{t.role}</p>
                  <span className="lp-t-result">{t.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section lp-pricing" id="planos">
        <div style={{ marginBottom: "3.5rem" }} className="lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Planos</div>
          <h2>Invista no seu <em>negócio</em><br />a partir de R$ 9,70/mês</h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>
            Para qualquer fase da sua carreira — de quem está começando a quem já tem equipe.
          </p>
        </div>
        <div className="lp-pricing-grid">
          {/* Mensal */}
          <div className="lp-pricing-card lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <p className="lp-pricing-plan">Iniciante</p>
            <h3>Essencial</h3>
            <p className="lp-pricing-desc">Para quem está começando e quer parecer profissional desde o primeiro dia.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>9,70</p>
              <p className="lp-price-period">por mês · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Acesso a todos os recursos</li>
              <li>Propostas profissionais</li>
              <li>Controle de recebimentos</li>
              <li>Exportação CSV</li>
              <li>Suporte via e-mail</li>
            </ul>
            <button className="lp-btn-plan outline" onClick={() => {
              localStorage.setItem("leadEmail", heroEmail || "");
              setLocation("/registro?plano=mensal");
            }}>
              Começar grátis
            </button>
          </div>

          {/* Anual */}
          <div className="lp-pricing-card featured lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <p className="lp-pricing-plan">Mais popular</p>
            <h3>Pro</h3>
            <span className="lp-badge-popular">★ Recomendado</span>
            <p className="lp-pricing-desc" style={{ marginTop: "0.75rem" }}>Para quem quer gestão completa e mais tempo para o que importa.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>97</p>
              <p className="lp-price-period">por ano · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Clientes ilimitados</li>
              <li>Propostas com logo e template premium</li>
              <li>Dashboard e gráficos avançados</li>
              <li>Alertas de recontato de clientes</li>
              <li>Precificação guiada</li>
              <li>Relatórios completos</li>
              <li>Suporte via WhatsApp</li>
            </ul>
            <button className="lp-btn-plan solid" onClick={() => {
              localStorage.setItem("leadEmail", heroEmail || "");
              setLocation("/registro?plano=anual");
            }}>
              Começar grátis por 7 dias
            </button>
          </div>

          {/* Vitalício */}
          <div className="lp-pricing-card lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <p className="lp-pricing-plan">Studio</p>
            <h3>Vitalício</h3>
            <p className="lp-pricing-desc">Acesso permanente sem mensalidades. Pague uma vez, use para sempre.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>247</p>
              <p className="lp-price-period">pagamento único · sem renovação</p>
            </div>
            <ul className="lp-features-list">
              <li>Tudo do plano Pro</li>
              <li>Pagamento único</li>
              <li>Acesso vitalício</li>
              <li>Todas as atualizações futuras</li>
              <li>Suporte prioritário</li>
            </ul>
            <button className="lp-btn-plan outline" onClick={() => {
              localStorage.setItem("leadEmail", heroEmail || "");
              setLocation("/registro?plano=vitalicio");
            }}>
              Adquirir acesso vitalício
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section lp-faq" id="faq">
        <div className="lp-faq-inner">
          <div className="lp-faq-header lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <div className="lp-section-eyebrow">Dúvidas</div>
            <h2>Perguntas <em>frequentes</em></h2>
          </div>
          {faqItems.map((item, i) => (
            <div className="lp-faq-item" key={i}>
              <button
                className="lp-faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className={`arrow${openFaq === i ? " open" : ""}`}>+</span>
              </button>
              <div className={`lp-faq-a${openFaq === i ? " open" : ""}`}>
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <div className="lp-footer-cta">
        <h2>Pronta para se sentir<br />profissional de verdade?</h2>
        <p>
          Junte-se a mais de 2.400 personal organizers que já transformaram seus negócios.
          Comece grátis hoje — sem cartão, sem compromisso.
        </p>
        <div className="lp-footer-cta-actions">
          <button className="lp-btn-white" onClick={() => setLocation("/planos")}>
            Começar 7 dias grátis
          </button>
          <a href="https://wa.me/5531999999999" className="lp-btn-outline-white" target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <span>© 2025 Planner Organizer. Feito com 💛 para personal organizers.</span>
        <div className="lp-footer-links">
          <a href="#">Termos de Uso</a>
          <a href="#">Política de Privacidade</a>
          <a href="#">Suporte</a>
          <a href="#">Contato</a>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ── */}
      <a
        href="https://wa.me/5531999999999?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Planner%20Organizer"
        className="lp-wa-float"
        target="_blank"
        rel="noreferrer"
        title="Fale conosco no WhatsApp"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Spin animation for login button loader */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
