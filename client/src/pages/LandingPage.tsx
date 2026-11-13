import { useState, useEffect, useRef } from "react";

// Aplicação principal — a conta é criada lá (7 dias grátis, sem cartão)
// e é lá que ficam login, trial, assinatura e todos os dados.
const APP_URL = "https://app.plannerorganiza.com.br";
// App Android na Google Play (o referrer mostra no Play Console de onde veio a instalação)
const PLAY_URL = "https://play.google.com/store/apps/details?id=com.plannerorganiza.app&referrer=utm_source%3Dlanding";

function irParaPlay(origem: string) {
  rastrear("abrir_google_play", "AbrirGooglePlay", { origem }, true);
}

// Botão no formato do selo oficial "Disponível no Google Play"
function BotaoGooglePlay({ origem, claro = false }: { origem: string; claro?: boolean }) {
  return (
    <a className={`lp-play${claro ? " claro" : ""}`} href={PLAY_URL} target="_blank" rel="noreferrer"
       onClick={() => irParaPlay(origem)} aria-label="Baixar o app Planner Organiza no Google Play">
      <svg width="26" height="28" viewBox="0 0 26 28" aria-hidden="true">
        <path d="M1.2.6 14.4 14 1.2 27.4c-.4-.3-.7-.9-.7-1.6V2.2c0-.7.3-1.3.7-1.6z" fill="#00D7FE" />
        <path d="M18.8 9.6 14.4 14 1.2.6c.2-.1.4-.2.6-.2.4 0 .8.1 1.2.3l15.8 8.9z" fill="#00F076" />
        <path d="M18.8 18.4 3 27.3c-.4.2-.8.3-1.2.3-.2 0-.4-.1-.6-.2L14.4 14l4.4 4.4z" fill="#FF3A44" />
        <path d="m24.2 12.5-5.4-2.9L14.4 14l4.4 4.4 5.4-3c1.1-.6 1.1-2.3 0-2.9z" fill="#FFD400" />
      </svg>
      <span><small>Disponível no</small>Google Play</span>
    </a>
  );
}

// Celular com a gravação de tela do app: toca sozinho (mudo, em loop) só enquanto aparece na
// tela; com "reduzir movimento" ligado fica parado no primeiro quadro.
function VideoCelular({ nome, alt }: { nome: string; alt: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.play().catch(() => { /* navegador bloqueou: fica o pôster */ }); }
      else v.pause();
    }, { threshold: 0.4 });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="lp-cel-moldura">
      <video ref={ref} poster={`/videos/${nome}.jpg`}
             muted loop playsInline preload="none" width="600" height="1298" aria-label={alt}>
        <source src={`/videos/${nome}.webm`} type="video/webm" />
        <source src={`/videos/${nome}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

// App na App Store (iPhone). Mesmo formato do selo da Google Play.
const APP_STORE_URL = "https://apps.apple.com/br/app/planner-organiza/id6832855561";

function BotaoAppStore({ origem, claro = false }: { origem: string; claro?: boolean }) {
  return (
    <a className={`lp-play${claro ? " claro" : ""}`} href={APP_STORE_URL} target="_blank" rel="noreferrer"
       onClick={() => rastrear("abrir_app_store", "AbrirAppStore", { origem }, true)}
       aria-label="Baixar o app Planner Organiza na App Store">
      <svg width="24" height="28" viewBox="0 0 384 470" aria-hidden="true">
        <path fill="#fff" d="M318.7 249.9c-.6-55.3 45.2-81.9 47.2-83.2-25.7-37.6-65.8-42.8-80.1-43.4-34.1-3.5-66.5 20.1-83.8 20.1-17.3 0-44-19.6-72.3-19.1-37.2.5-71.5 21.6-90.7 54.9-38.7 67.1-9.9 166.5 27.8 221 18.4 26.6 40.4 56.6 69.2 55.5 27.8-1.1 38.3-18 71.9-18s43.1 18 72.5 17.4c29.9-.5 48.9-27.1 67.2-53.9 21.2-30.9 29.9-60.8 30.4-62.4-.7-.3-58.3-22.4-58.9-88.9zM263.3 87.4c15.3-18.6 25.7-44.4 22.8-70.1-22.1.9-48.9 14.7-64.7 33.3-14.2 16.4-26.7 42.7-23.3 67.8 24.7 1.9 49.9-12.5 65.2-31z" />
      </svg>
      <span><small>Baixar na</small>App Store</span>
    </a>
  );
}

function BotoesApp({ origem, claro = false }: { origem: string; claro?: boolean }) {
  return (
    <div className="lp-lojas">
      <BotaoGooglePlay origem={origem} claro={claro} />
      <BotaoAppStore origem={origem} claro={claro} />
    </div>
  );
}

// Como funciona: telas reais do app, uma por passo
const PASSOS = [
  { video: "precificacao", titulo: "Descubra quanto vale a sua hora,", destaque: "e cobre sem medo.",
    texto: "Diga quanto quer ganhar, seus custos e quantos dias trabalha. O app calcula a sua hora mínima e o preço de cada projeto, ambiente por ambiente.",
    itens: ["Hora mínima e hora com margem", "Preço por ambiente e por tamanho", "Deslocamento e materiais incluídos"],
    alt: "Tela de precificação do app: valor da hora e preço de um projeto" },
  { video: "propostas", titulo: "A proposta pronta em minutos,", destaque: "com a sua marca.",
    texto: "Monte a proposta no celular e envie o PDF com o seu logo e as suas cores. Aprovou? O sinal já entra no financeiro.",
    itens: ["PDF com logo e cores da sua marca", "Envio direto pelo WhatsApp", "Status de cada proposta num toque"],
    alt: "Lista de propostas no app, com status em aberto, aprovada, em execução e finalizada" },
  { video: "retornos", titulo: "Nunca mais esqueça", destaque: "de acompanhar uma cliente.",
    texto: "Terminou o serviço? O app agenda os retornos sozinho: agradecimento, acompanhamento e ajuste fino. No dia certo ele lembra, com a mensagem pronta no WhatsApp.",
    itens: ["Retornos criados depois de cada serviço", "Lembrete no dia certo, já na tela inicial", "Mensagem pronta no WhatsApp, ou adiar 3 dias"],
    alt: "Tela de pós-organização do app: retornos da cliente com botões de WhatsApp, concluir e adiar" },
  { video: "agenda", titulo: "Seu dia organizado,", destaque: "sem esquecer ninguém.",
    texto: "Serviços, visitas, retornos e vencimentos na mesma agenda. No aniversário da cliente, os parabéns já vêm prontos no WhatsApp.",
    itens: ["Agenda por semana ou por mês", "Retornos de pós-organização no dia certo", "Aniversários com mensagem pronta"],
    alt: "Agenda do app com serviços, visitas, aniversários e retornos da semana" },
  { video: "financeiro", titulo: "Saiba quanto sobrou,", destaque: "e o MEI em dia.",
    texto: "Receitas, despesas e contas a receber num lugar só, com o DAS de cada mês e o limite do ano sempre à vista.",
    itens: ["Lucro do mês e valores a receber", "DAS e limite do MEI acompanhados", "Relatórios do período"],
    alt: "Financeiro do app com receitas, despesas e lucro do mês" },
];
// "Começar grátis" abre direto a criação de conta no app; o e-mail digitado aqui vai junto
// (montado por linkCadastro, com o tema do anúncio e as UTMs da visita)

// Tema do anúncio (?tema=retorno...): a landing repete a promessa do anúncio no título.
// Os textos seguem os ganchos dos reels; sem tema (ou tema desconhecido), fica o título geral.
type Tema = { eyebrow: string; titulo: string; destaque: string; sub: string };
const TEMAS: Record<string, Tema> = {
  retorno: {
    eyebrow: "Pós-organização no automático",
    titulo: "Nunca mais esqueça",
    destaque: "de retornar uma cliente.",
    sub: "O app agenda os retornos depois de cada serviço e lembra no dia certo, com a mensagem pronta no WhatsApp.",
  },
  preco: {
    eyebrow: "Precificação para personal organizer",
    titulo: "Saiba exatamente",
    destaque: "quanto cobrar.",
    sub: "Coloque quanto quer ganhar, seus custos e suas horas: o app mostra a sua hora mínima e o preço de cada projeto.",
  },
  financeiro: {
    eyebrow: "Financeiro sem planilha",
    titulo: "Saiba quanto entrou,",
    destaque: "quanto gastou e quanto sobrou.",
    sub: "Receitas, despesas e contas a receber num lugar só. Aprovou a proposta? O sinal já entra no financeiro.",
  },
  mei: {
    eyebrow: "MEI e Simples Nacional",
    titulo: "DAS em dia e limite",
    destaque: "sob controle.",
    sub: "Acompanhe o DAS de cada mês, o limite do ano e o prazo da declaração. O app não é contador: ele organiza para você conversar com o seu.",
  },
  agenda: {
    eyebrow: "Agenda da personal organizer",
    titulo: "Sua agenda e o aniversário",
    destaque: "de cada cliente, sem esquecer.",
    sub: "Compromissos, serviços, retornos e vencimentos juntos, e os parabéns prontos no WhatsApp no dia do aniversário.",
  },
};

// Origem da visita (tema + UTMs): guardada na primeira página e repassada ao app no cadastro
const CAMPOS_ORIGEM = ["tema", "utm_source", "utm_medium", "utm_campaign", "utm_content"];
function origemDaVisita(): Record<string, string> {
  const atual: Record<string, string> = {};
  try {
    const q = new URLSearchParams(window.location.search);
    CAMPOS_ORIGEM.forEach((k) => { const v = q.get(k); if (v) atual[k] = v.slice(0, 60); });
    if (Object.keys(atual).length) { sessionStorage.setItem("po_origem", JSON.stringify(atual)); return atual; }
    return JSON.parse(sessionStorage.getItem("po_origem") || "{}");
  } catch (e) { return atual; }
}

function linkCadastro(email?: string) {
  const q = new URLSearchParams({ cadastro: "1", ...origemDaVisita() });
  if (email) q.set("email", email);
  return `${APP_URL}/?${q.toString()}`;
}

// GA e Pixel da Meta (client/index.html): todo clique de cadastro vira evento para os anúncios
function rastrear(ga: string, meta: string, params: Record<string, unknown> = {}, custom = false) {
  const w = window as any;
  const p = { ...origemDaVisita(), ...params };
  try { w.gtag && w.gtag("event", ga, p); } catch (e) { /* sem rastreamento */ }
  try { w.fbq && w.fbq(custom ? "trackCustom" : "track", meta, p); } catch (e) { /* sem rastreamento */ }
}

function irParaCadastro(origem: string) {
  rastrear("cta_cadastro", "CliqueCadastro", { origem }, true);
  window.location.href = linkCadastro();
}

export default function LandingPage() {
  const [heroEmail, setHeroEmail] = useState("");
  // vídeo do tour: os navegadores só deixam tocar sozinho sem som; o botão recomeça com a narração
  const tourRef = useRef<HTMLVideoElement | null>(null);
  const [tourSom, setTourSom] = useState(false);
  // no celular (a maior parte do tráfego vem do Instagram) o tour é o vídeo em pé
  const [tourEmPe] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches);
  const ativarSomTour = () => {
    const v = tourRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
    setTourSom(true);
    rastrear("tour_som", "TourComSom", {}, true);
  };
  const tema = TEMAS[(origemDaVisita().tema || "").toLowerCase()];
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [heroMsg, setHeroMsg] = useState("");

  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const revealRefs = useRef<(HTMLElement | null)[]>([]);

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

  const addRevealRef = (el: HTMLElement | null, index: number) => {
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
      setHeroMsg("✅ Ótimo! Levando você para criar sua conta...");
      rastrear("generate_lead", "Lead", { origem: "hero" });
      setTimeout(() => { window.location.href = linkCadastro(capturedEmail); }, 1200);
    } catch (err: any) {
      setHeroMsg("❌ " + (err?.message || "Ocorreu um erro. Tente novamente."));
    } finally {
      setHeroSubmitting(false);
    }
  };

  const faqItems = [
    {
      q: "Preciso ter experiência com tecnologia?",
      a: "Não. O Planner Organiza foi criado pensando em personal organizers, não em programadoras. A interface é intuitiva e você começa a usar em minutos — sem tutoriais longos.",
    },
    {
      q: "Tem app para celular?",
      a: "Sim, para Android e iPhone: é só baixar na Google Play ou na App Store e entrar com a mesma conta. Tudo o que você faz no celular aparece no computador, e o contrário também.",
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
      a: "Sim! Você pode incluir seu logo, suas cores e suas informações em todas as propostas. Seus clientes vão ver a sua marca, não a nossa.",
    },
    {
      q: "O Planner Organiza substitui o contador?",
      a: "Não. O app organiza seu financeiro e ajuda a acompanhar o DAS e o limite do MEI, mas não é contador e não substitui um. Os números de impostos são estimativas para você se organizar. Em caso de dúvida, procure um contador.",
    },
    {
      q: "Tem suporte em português?",
      a: "Sim, 100% em português. O suporte é feito por humanos (não bots) via WhatsApp, em qualquer plano.",
    },
  ];

  let revealIdx = 0;

  return (
    <div className="lp-page">

      {/* ── HEADER ── */}
      <header className={`lp-header${headerScrolled ? " scrolled" : ""}`}>
        <a href="#" className="lp-logo" onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}>
          <img src="/icon-192.png" alt="" className="lp-logo-icone" width="34" height="34" />
          Planner <span>Organiza</span>
        </a>
        <nav className="lp-nav">
          <a href="#funcionalidades" onClick={(e) => { e.preventDefault(); scrollTo("funcionalidades"); }}>Funcionalidades</a>
          <a href="#planos" onClick={(e) => { e.preventDefault(); scrollTo("planos"); }}>Planos</a>
          <a href="#compromissos" onClick={(e) => { e.preventDefault(); scrollTo("compromissos"); }}>Compromissos</a>
          <a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollTo("como-funciona"); }}>Como funciona</a>
          <a href="#duvidas" onClick={(e) => { e.preventDefault(); scrollTo("duvidas"); }}>Dúvidas</a>
          <a href="#baixar" onClick={(e) => { e.preventDefault(); scrollTo("baixar"); }}>Baixar o app</a>
        </nav>
        <a href={APP_URL} className="lp-header-cta" onClick={() => rastrear("entrar", "CliqueEntrar", { origem: "cabecalho" }, true)}>Entrar</a>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero" id="inicio">
        <div className="lp-hero-bg" />

        <div className="lp-hero-left">
          <div className="lp-eyebrow">{tema ? tema.eyebrow : "Para Personal Organizers"}</div>
          {tema ? (
            <h1>{tema.titulo}<br /><em>{tema.destaque}</em></h1>
          ) : (
            <h1>
              Você organiza a vida<br />dos outros.<br />
              <em>Quem organiza<br />o seu negócio?</em>
            </h1>
          )}
          <p className="lp-hero-sub">
            {tema ? tema.sub : (
              <>Propostas elegantes em minutos, clientes organizados, finanças sob controle.
              Tudo que você precisava para se sentir tão profissional quanto você realmente é.</>
            )}
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
          <div className="lp-hero-app-baixar">
            <span>Também no celular:</span>
            <BotoesApp origem="hero" />
          </div>

          <div className="lp-hero-stats">
            <div className="lp-stat-item">
              <span className="lp-stat-num">7 dias</span>
              <span className="lp-stat-label">de teste grátis</span>
            </div>
            <div className="lp-stat-item">
              <span className="lp-stat-num">5 min</span>
              <span className="lp-stat-label">para sua 1ª proposta</span>
            </div>
            <div className="lp-stat-item">
              <span className="lp-stat-num">R$ 24,75</span>
              <span className="lp-stat-label">por mês no plano anual</span>
            </div>
          </div>
        </div>

        {/* Uma ação só no topo (Começar grátis): quem já tem conta usa o "Entrar" do cabeçalho */}
        <div className="lp-hero-right">
          <img className="lp-hero-app" src="/hero-app.png" width="362" height="622"
               alt="Tela inicial do Planner Organiza: lucro do mês, valores a receber e a pagar, e o que fazer hoje" />
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
            O Planner Organiza foi criado para resolver exatamente isso.
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

      {/* ── TOUR EM VÍDEO ── */}
      <section className="lp-section lp-tour" id="tour">
        <div className="lp-features-header lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Veja por dentro</div>
          <h2>O app em <em>1 minuto e meio</em></h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>
            Telas reais, com dados de exemplo: agenda, propostas, financeiro, MEI e relatórios.
          </p>
        </div>
        <div className={`lp-tour-video lp-reveal${tourEmPe ? " em-pe" : ""}`} ref={(el) => addRevealRef(el, revealIdx++)}>
          <video ref={tourRef} src={tourEmPe ? "/tour-planner-organiza-vertical.mp4" : "/tour-planner-organizer.mp4"}
                 poster={tourEmPe ? "/tour-planner-organiza-vertical.jpg" : "/tour-planner-organizer.jpg"}
                 autoPlay muted loop playsInline controls preload="metadata"
                 onVolumeChange={(e) => { if (!e.currentTarget.muted) setTourSom(true); }}
                 aria-label="Tour rápido pelas telas do Planner Organiza, com narração" />
          {!tourSom && (
            <button className="lp-tour-som" onClick={ativarSomTour}>
              <span aria-hidden="true">🔊</span> Ativar som
            </button>
          )}
        </div>
      </section>

      {/* ── COMO FUNCIONA: passos com telas reais ── */}
      <section className="lp-section lp-passos" id="como-funciona">
        <div className="lp-passos-header lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Como funciona</div>
          <h2>Do preço ao retorno da cliente,<br /><em>em cinco passos.</em></h2>
          <p className="lp-section-sub">
            Telas reais do app, com dados de exemplo. Tudo o que você faz no celular aparece também no computador.
          </p>
        </div>
        <ol className="lp-passos-lista">
          {PASSOS.map((p, i) => (
            <li className={`lp-passo lp-reveal${i % 2 ? " inverso" : ""}`} key={p.video} ref={(el) => addRevealRef(el, revealIdx++)}>
              <div className="lp-passo-texto">
                <span className="lp-passo-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.titulo} <em>{p.destaque}</em></h3>
                <p>{p.texto}</p>
                <ul>{p.itens.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="lp-passo-cel">
                <VideoCelular nome={p.video} alt={p.alt} />
              </div>
            </li>
          ))}
        </ol>
      </section>

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
            { icon: "📋", h: "Propostas Elegantes", p: "Crie propostas com sua identidade visual, os ambientes e itens do projeto e o valor total. Gere o PDF em minutos e impressione antes mesmo de começar.", tag: "Sua marca em cada PDF" },
            { icon: "👩‍💼", h: "Gestão de Clientes", p: "Histórico completo de cada cliente, projetos anteriores, preferências e alertas de recontato. Nunca esqueça de ninguém importante.", tag: "Relacionamento duradouro" },
            { icon: "💰", h: "Financeiro e MEI", p: "Receitas, despesas, contas em aberto e previsão do mês. Na aba MEI, o DAS mês a mês e o limite do ano. O app não é contador: ele organiza para você conversar com o seu.", tag: "Sem mais ansiedade" },
            { icon: "📅", h: "Agenda que junta tudo", p: "Diárias, visitas e orçamentos, com o valor indo direto para o a receber. E na mesma agenda: serviços, retornos, aniversários e vencimentos.", tag: "Nada esquecido" },
            { icon: "🛍️", h: "Vendas e Estoque", p: "Venda caixas, cabides e organizadores à vista ou parcelado. O estoque baixa sozinho e você vê o custo e o lucro de cada venda.", tag: "↑ Lucro em cada venda" },
            { icon: "📤", h: "Relatórios e Exportação", p: "Resultado do mês, clientes, propostas e lucro de cada trabalho, comparados com o período anterior. Baixe em Excel, pronto para o contador.", tag: "Profissionalismo total" },
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
            Com o Planner Organiza, você envia uma proposta impecável — com logo, ambientes detalhados
            e valor — em menos de 5 minutos.
          </p>
          <ul className="lp-proposal-points">
            <li>Personalizada com seu nome e identidade visual</li>
            <li>Ambientes e itens do projeto descritos um a um</li>
            <li>Sinal, forma de pagamento e condições</li>
            <li>Em PDF, pronta para enviar por WhatsApp ou e-mail</li>
            <li>Aprovou? Sinal e saldo entram sozinhos no financeiro</li>
          </ul>
          <button className="lp-proposal-cta" onClick={() => irParaCadastro("preview_proposta")}>
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
            Assim como você transforma closets e cozinhas, o Planner Organiza transforma a gestão do seu negócio.
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
            <div className="lp-ba-item"><span className="icon">🗂️</span><p>Tudo em um painel: clientes, propostas, vendas e finanças</p></div>
            <div className="lp-ba-item"><span className="icon">⚡</span><p>Proposta elegante enviada em <strong>menos de 5 minutos</strong></p></div>
            <div className="lp-ba-item"><span className="icon">📈</span><p>Clareza total sobre receitas, gastos e previsão do próximo mês</p></div>
            <div className="lp-ba-item"><span className="icon">🔔</span><p>Alertas de recontato automáticos — nunca mais esqueça ninguém</p></div>
            <div className="lp-ba-item"><span className="icon">💪</span><p>Confiança de uma profissional que atende clientes de <strong>alto padrão</strong></p></div>
          </div>
        </div>
      </section>

      {/* ── COMPROMISSOS (no lugar dos depoimentos, até chegarem os relatos de clientes reais) ── */}
      <section className="lp-section lp-testimonials" id="compromissos">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }} className="lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Nossos compromissos</div>
          <h2>Experimente <em>sem risco</em></h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>O que você pode esperar do Planner Organiza desde o primeiro dia.</p>
        </div>
        <div className="lp-t-grid">
          {[
            { icone: "🗓️", titulo: "7 dias grátis, sem cartão", texto: "Use tudo antes de decidir. Se não for para você, é só não assinar: nada é cobrado." },
            { icone: "💬", titulo: "Suporte de gente de verdade", texto: "Ficou com dúvida? Fale no WhatsApp com quem conhece o app, não com um robô." },
            { icone: "🔒", titulo: "Seus dados protegidos", texto: "Seguimos a LGPD. Os dados das suas clientes ficam guardados com segurança e não são compartilhados." },
            { icone: "↩️", titulo: "Cancele quando quiser", texto: "Sem fidelidade e sem multa. Você cancela pela sua conta, sem precisar pedir para ninguém." },
          ].map((c) => (
            <div className="lp-t-card lp-compromisso lp-reveal" key={c.titulo} ref={(el) => addRevealRef(el, revealIdx++)}>
              <span className="lp-compromisso-icone" aria-hidden="true">{c.icone}</span>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </div>
          ))}
        </div>
        <div className="lp-convite-relato lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <p>Já usa o Planner Organiza? Conte como está sendo: a sua história pode aparecer aqui.</p>
          <a href="https://wa.me/5531992041112?text=Ol%C3%A1!%20Quero%20contar%20como%20est%C3%A1%20sendo%20usar%20o%20Planner%20Organiza"
             className="lp-btn-primary" target="_blank" rel="noreferrer"
             onClick={() => rastrear("contar_experiencia", "ContarExperiencia", { origem: "compromissos" }, true)}>
            Contar minha experiência
          </a>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section lp-pricing" id="planos">
        <div style={{ marginBottom: "3.5rem" }} className="lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
          <div className="lp-section-eyebrow">Planos</div>
          <h2>Custa menos que <em>30 minutos</em><br />do seu trabalho por mês</h2>
          <p className="lp-section-sub" style={{ margin: "0 auto" }}>
            Uma proposta a mais fechada no ano já paga o plano anual. Acesso completo nos dois planos e
            7 dias grátis, sem cartão de crédito.
          </p>
        </div>
        <div className="lp-pricing-grid">
          {/* Mensal */}
          <div className="lp-pricing-card lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <p className="lp-pricing-plan">Flexível</p>
            <h3>Mensal</h3>
            <p className="lp-pricing-desc">Sem compromisso de longo prazo. Assine, use e cancele quando quiser.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>39,90</p>
              <p className="lp-price-period">por mês · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Clientes e propostas ilimitados</li>
              <li>Propostas profissionais em PDF</li>
              <li>Financeiro completo</li>
              <li>Pós-organização e recontato</li>
              <li>Relatórios e dashboards</li>
              <li>App Android e iPhone + acesso web</li>
            </ul>
            <button className="lp-btn-plan outline" onClick={() => irParaCadastro("plano_mensal")}>
              Começar grátis
            </button>
          </div>

          {/* Anual */}
          <div className="lp-pricing-card featured lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <p className="lp-pricing-plan">Melhor custo-benefício</p>
            <h3>Anual</h3>
            <span className="lp-badge-popular">★ 38% mais barato que o mensal</span>
            <p className="lp-pricing-desc" style={{ marginTop: "0.75rem" }}>Equivale a R$ 24,75/mês. Um ano inteiro de negócio organizado.</p>
            <div className="lp-price-row">
              <p className="lp-price-val"><sup>R$</sup>297</p>
              <p className="lp-price-period">por ano · 7 dias grátis</p>
            </div>
            <ul className="lp-features-list">
              <li>Tudo do plano Mensal</li>
              <li>Clientes e propostas ilimitados</li>
              <li>Propostas profissionais em PDF</li>
              <li>Financeiro completo</li>
              <li>Pós-organização e recontato</li>
              <li>Relatórios e dashboards</li>
              <li>App Android e iPhone + acesso web</li>
            </ul>
            <button className="lp-btn-plan solid" onClick={() => irParaCadastro("plano_anual")}>
              Começar grátis por 7 dias
            </button>
          </div>
        </div>
      </section>

      {/* ── BAIXE O APP ── */}
      <section className="lp-baixar" id="baixar">
        <div className="lp-baixar-inner">
          <div className="lp-baixar-texto lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <div className="lp-section-eyebrow">Android e iPhone</div>
            <h2>O seu negócio,<br /><em>no bolso.</em></h2>
            <p>
              Atenda a cliente, mande a proposta e confira o financeiro de onde estiver.
              A mesma conta funciona no celular e no computador.
            </p>
            <BotoesApp origem="secao_baixar" claro />
            <p className="lp-baixar-nota">
              Baixe grátis na Google Play ou na App Store e entre com a mesma conta do computador.
            </p>
          </div>
          <img className="lp-baixar-img" src="/app-celulares.webp" width="670" height="564" loading="lazy"
               alt="Três telas do app Planner Organiza: agenda, início com o lucro do mês e precificação" />
        </div>
      </section>

      {/* ── DÚVIDAS ── */}
      <section className="lp-section lp-faq" id="duvidas">
        <div className="lp-faq-inner">
          <div className="lp-faq-header lp-reveal" ref={(el) => addRevealRef(el, revealIdx++)}>
            <h2>Ficou alguma <em>dúvida?</em></h2>
            <p className="lp-section-sub">
              Separamos as respostas para as perguntas mais comuns. Se a sua não estiver aqui, é só mandar uma mensagem.
            </p>
          </div>
          <div className="lp-duvida-card">
            <h3>Ainda tem alguma dúvida?</h3>
            <p>Fale com a gente no WhatsApp. Quem responde é gente de verdade, geralmente em poucas horas.</p>
            <a href="https://wa.me/5531992041112?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20Planner%20Organiza"
               className="lp-btn-primary" target="_blank" rel="noreferrer"
               onClick={() => rastrear("whatsapp", "Contact", { origem: "duvidas" })}>
              Enviar uma mensagem
            </a>
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
          Organize o seu negócio com o mesmo cuidado que você dedica aos espaços das suas clientes.
          Comece grátis hoje — sem cartão, sem compromisso.
        </p>
        <div className="lp-footer-cta-actions">
          <button className="lp-btn-white" onClick={() => irParaCadastro("rodape")}>
            Começar 7 dias grátis
          </button>
          <BotoesApp origem="rodape" claro />
          <a href="https://wa.me/5531992041112" className="lp-btn-outline-white" target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <span>© {new Date().getFullYear()} Planner Organiza. Feito com 💛 para personal organizers.</span>
        <div className="lp-footer-links">
          <a href="https://app.plannerorganiza.com.br/?show_termos=true" target="_blank" rel="noreferrer">Termos de Uso</a>
          <a href="https://app.plannerorganiza.com.br/?show_politica=true" target="_blank" rel="noreferrer">Política de Privacidade</a>
          <a href={PLAY_URL} target="_blank" rel="noreferrer" onClick={() => irParaPlay("rodape_links")}>App Android</a>
          <a href={APP_STORE_URL} target="_blank" rel="noreferrer" onClick={() => rastrear("abrir_app_store", "AbrirAppStore", { origem: "rodape_links" }, true)}>App iPhone</a>
          <a href="/suporte">Suporte</a>
          <a href="https://wa.me/5531992041112" target="_blank" rel="noreferrer">Contato</a>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ── */}
      <a
        href="https://wa.me/5531992041112?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Planner%20Organiza"
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
