import { useEffect, useState } from "react";

// Página pública do programa de afiliadas (plannerorganiza.com.br/indique), para divulgar o programa.
// A inscrição acontece no site do Planner (Conta › Indique e ganhe), com a conta da afiliada: os botões levam
// ao cadastro ou ao login e depois abrem a inscrição (parâmetro afiliada=1, tratado no app.py do PlannerOrganizer).
// As regras completas ficam em /indique/termos (IndiqueTermos.tsx).
const APP_URL = "https://app.plannerorganiza.com.br";
const ENTRAR = `${APP_URL}/?afiliada=1`;
const CRIAR = `${APP_URL}/?cadastro=1&afiliada=1&utm_source=indique&utm_medium=landing`;
const TERMOS = "/indique/termos";

const COR_TEXTO = "#0D1B2A";
const IconeSite = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path fill={COR_TEXTO} d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
  </svg>
);
const IconeAndroid = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Android">
    <path fill="#3DDC84" d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5" />
  </svg>
);
const IconeApple = () => (
  <svg width="24" height="28" viewBox="0 0 384 470" aria-label="Apple">
    <path fill={COR_TEXTO} d="M318.7 249.9c-.6-55.3 45.2-81.9 47.2-83.2-25.7-37.6-65.8-42.8-80.1-43.4-34.1-3.5-66.5 20.1-83.8 20.1-17.3 0-44-19.6-72.3-19.1-37.2.5-71.5 21.6-90.7 54.9-38.7 67.1-9.9 166.5 27.8 221 18.4 26.6 40.4 56.6 69.2 55.5 27.8-1.1 38.3-18 71.9-18s43.1 18 72.5 17.4c29.9-.5 48.9-27.1 67.2-53.9 21.2-30.9 29.9-60.8 30.4-62.4-.7-.3-58.3-22.4-58.9-88.9zM263.3 87.4c15.3-18.6 25.7-44.4 22.8-70.1-22.1.9-48.9 14.7-64.7 33.3-14.2 16.4-26.7 42.7-23.3 67.8 24.7 1.9 49.9-12.5 65.2-31z" />
  </svg>
);

const CANAIS = [
  {
    icone: <IconeSite />,
    titulo: "No site (computador ou navegador do celular)",
    passos: [
      "Ela abre o seu link: plannerorganiza.com.br/?ref=SEUCODIGO.",
      "Clica em \"Comece grátis\" (ou em \"Entrar\" e depois \"Criar conta grátis\").",
      "A conta já nasce ligada a você, sem digitar nada.",
    ],
    nota: "Se o link não ligar, ela ainda pode digitar o seu código em Indique e ganhe, em até 7 dias depois de criar a conta.",
  },
  {
    icone: <IconeAndroid />,
    titulo: "No Android (Google Play)",
    passos: [
      "Ela baixa o Planner Organiza na Google Play.",
      "Na tela de entrar, toca em \"Tenho um convite\" e digita o seu código.",
      "Cria a conta. Pronto: ficou ligada a você.",
    ],
    nota: "O link sozinho não chega até o app. Por isso, no celular, o código é o que vale: peça sempre para ela digitar.",
  },
  {
    icone: <IconeApple />,
    titulo: "No iPhone (App Store)",
    passos: [
      "Ela baixa o Planner Organiza na App Store.",
      "Na tela de entrar, toca em \"Tenho um convite\" e digita o seu código.",
      "Cria a conta. Pronto: ficou ligada a você.",
    ],
    nota: "A assinatura feita pelo iPhone também gera comissão para você, calculada sobre o que a Apple repassa.",
  },
];

const PERGUNTAS = [
  { q: "Preciso ser cliente do Planner?", a: "Você precisa de uma conta, que é onde ficam o seu link, o painel e as comissões. Criar a conta é grátis; você não precisa assinar para indicar." },
  { q: "Quanto eu ganho exatamente?", a: "25% do valor líquido de cada pagamento da indicada, durante 12 meses contados do primeiro pagamento dela. Valor líquido é o que sobra depois da taxa do cartão (site) ou da taxa da loja (App Store e Google Play)." },
  { q: "A indicada ganha algum desconto?", a: "Sim: 10% de desconto no plano anual (R$ 431,90 por ano em vez de R$ 479,90), enquanto mantiver a assinatura. É o melhor argumento para ela usar o seu link ou digitar o seu código. O teste grátis continua de 7 dias, como para todo mundo. No site o desconto já vale; nos apps do iPhone e do Android, chega na próxima versão." },
  { q: "Quando eu recebo?", a: "Cada comissão fica liberada 30 dias depois do pagamento da indicada (o prazo de reembolso). Todo mês, no início do mês, pagamos por Pix quem tem R$ 50 ou mais liberados. O que for menor fica acumulando para o mês seguinte." },
  { q: "E se a indicada pedir reembolso?", a: "A comissão daquele pagamento é cancelada, se ainda não tiver sido paga. As outras continuam valendo." },
  { q: "E se ela esquecer de digitar o código no app?", a: "No site, ela pode informar o código em Indique e ganhe em até 7 dias depois de criar a conta. Depois disso, ou se ela já estiver ligada a outra afiliada, não dá para trocar." },
  { q: "Preciso ter CNPJ?", a: "Não. Pedimos CPF e chave Pix no seu nome. Veja nos termos como fica a questão de impostos." },
  { q: "Posso indicar a mim mesma?", a: "Não. Também não vale criar contas falsas, anunciar no Google com o nome Planner Organiza ou se passar pela marca. Veja todas as regras nos termos." },
];

function rastrear(ga: string, meta: string, params: Record<string, unknown> = {}) {
  const w = window as any;
  try { w.gtag && w.gtag("event", ga, params); } catch (e) { /* sem rastreamento */ }
  try { w.fbq && w.fbq("trackCustom", meta, params); } catch (e) { /* sem rastreamento */ }
}

export function CabecalhoIndique() {
  return (
    <header className="lp-header scrolled">
      <a href="/" className="lp-logo">
        <img src="/icon-192.png" alt="" className="lp-logo-icone" width="34" height="34" />
        Planner <span>Organiza</span>
      </a>
      <a href={ENTRAR} className="lp-header-cta">Entrar</a>
    </header>
  );
}

export function RodapeIndique() {
  return (
    <footer className="lp-footer">
      <span>© {new Date().getFullYear()} Planner Organiza · Tâmara Cavalcante · CNPJ 40.278.995/0001-71</span>
      <div className="lp-footer-links">
        <a href="/">Início</a>
        <a href="/indique">Indique e ganhe</a>
        <a href={TERMOS}>Termos do programa</a>
        <a href="/termos">Termos de Uso</a>
        <a href="/privacidade">Política de Privacidade</a>
        <a href="/suporte">Suporte</a>
      </div>
    </footer>
  );
}

export default function Indique() {
  const [aberta, setAberta] = useState<number | null>(0);
  useEffect(() => { document.title = "Indique e ganhe 25% · Planner Organiza"; }, []);

  return (
    <div className="lp-page lp-suporte lp-indique">
      <CabecalhoIndique />

      <main className="sup-main ind-main">
        <div className="lp-section-eyebrow">Programa de afiliadas</div>
        <h1>Indique o Planner e <em>ganhe 25%</em> por 12 meses</h1>
        <p className="sup-intro">
          Você conhece outras personal organizers. Indique o Planner Organiza e receba <strong>25% de cada pagamento</strong>
          {" "}delas durante um ano, no site, no iPhone ou no Android, <strong>por Pix, todo mês</strong>. E quem usa o seu
          {" "}link ou código ganha <strong>10% de desconto no plano anual</strong>.
        </p>
        <div className="ind-ctas">
          <a className="lp-btn-primary" href={CRIAR} onClick={() => rastrear("afiliada_criar", "AfiliadaCriar")}>Quero ser afiliada</a>
          <a className="ind-sec" href={ENTRAR} onClick={() => rastrear("afiliada_entrar", "AfiliadaEntrar")}>Já tenho conta: entrar e me inscrever</a>
        </div>

        <div className="ind-resumo">
          <div><b>25%</b><span>de cada pagamento</span></div>
          <div><b>10% off</b><span>no anual para quem você indica</span></div>
          <div><b>Pix</b><span>todo mês, a partir de R$ 50</span></div>
        </div>

        <h2 className="ind-h2">Como funciona</h2>
        <ol className="ind-passos">
          <li><b>Inscreva-se</b><span>Crie a sua conta grátis (ou entre) e vá em <em>Indique e ganhe</em>. Informe nome, CPF e chave Pix e escolha o seu código.</span></li>
          <li><b>Aguarde a aprovação</b><span>A equipe do Planner confere a inscrição. Aprovada, o seu link e o seu código aparecem no painel, como <code>plannerorganiza.com.br/?ref=TAMARA</code>.</span></li>
          <li><b>Divulgue</b><span>Mande o link no direct, no WhatsApp, nos stories, no grupo de organizers. No celular, peça para ela digitar o seu código no app.</span></li>
          <li><b>Ela testa e assina com desconto</b><span>A indicada testa grátis por 7 dias e, se escolher o plano anual, paga 10% a menos. Cada pagamento dela, por 12 meses, gera comissão para você.</span></li>
          <li><b>Você recebe por Pix</b><span>A comissão é liberada 30 dias após o pagamento e paga no início de cada mês, a partir de R$ 50.</span></li>
        </ol>

        <h2 className="ind-h2">Como a indicada fica ligada a você</h2>
        <p className="sup-intro">Depende de onde ela cria a conta. Guarde esta regra: <strong>no site vale o link, no celular vale o código</strong>.</p>
        <div className="ind-canais">
          {CANAIS.map(c => (
            <div key={c.titulo} className="ind-canal">
              <div className="ind-canal-topo"><span>{c.icone}</span><b>{c.titulo}</b></div>
              <ol>{c.passos.map(p => <li key={p}>{p}</li>)}</ol>
              <small>{c.nota}</small>
            </div>
          ))}
        </div>

        <h2 className="ind-h2">Perguntas frequentes</h2>
        <div className="ind-faq">
          {PERGUNTAS.map((p, i) => (
            <div key={i} className={`ind-item${aberta === i ? " aberta" : ""}`}>
              <button onClick={() => setAberta(aberta === i ? null : i)}>{p.q}<span>{aberta === i ? "−" : "+"}</span></button>
              {aberta === i && <p>{p.a}</p>}
            </div>
          ))}
        </div>
        <p className="ind-termos-link">
          Leia as regras completas: <a href={TERMOS}>Termos do programa de afiliadas</a>.
        </p>

        <div className="ind-final">
          <h2>Pronta para indicar?</h2>
          <a className="lp-btn-primary" href={CRIAR} onClick={() => rastrear("afiliada_criar", "AfiliadaCriar", { origem: "final" })}>Quero ser afiliada</a>
          <p className="ind-nota">
            A inscrição é aprovada pela equipe do Planner. Ao se inscrever, você aceita os{" "}
            <a href={TERMOS}>Termos do programa de afiliadas</a>.
          </p>
        </div>
      </main>

      <RodapeIndique />
    </div>
  );
}
