import { useEffect, useState } from "react";

// Página pública do programa de afiliadas (plannerorganiza.com.br/indique), para divulgar o programa.
// A inscrição acontece no site do Planner (Conta › Indique e ganhe), com a conta da afiliada: os botões levam
// ao cadastro ou ao login e depois abrem a inscrição (parâmetro afiliada=1, tratado no app.py do PlannerOrganizer).
// As regras completas ficam em /indique/termos (IndiqueTermos.tsx).
const APP_URL = "https://app.plannerorganiza.com.br";
const ENTRAR = `${APP_URL}/?afiliada=1`;
const CRIAR = `${APP_URL}/?cadastro=1&afiliada=1&utm_source=indique&utm_medium=landing`;
const TERMOS = "/indique/termos";

const PLANOS = [
  { nome: "Mensal", preco: 59.9, vezes: 12 },
  { nome: "Trimestral", preco: 149.9, vezes: 4 },
  { nome: "Anual", preco: 479.9, vezes: 1 },
];
// mesmo cálculo de utils/afiliados.py: 30% do valor líquido (cartão no site: 3,99% + R$ 0,39)
const liquido = (v: number) => Math.max(0, v * (1 - 0.0399) - 0.39);
const comissaoAno = (p: { preco: number; vezes: number }) => liquido(p.preco) * 0.3 * p.vezes;
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CANAIS = [
  {
    icone: "💻",
    titulo: "No site (computador ou navegador do celular)",
    passos: [
      "Ela abre o seu link: plannerorganiza.com.br/?ref=SEUCODIGO.",
      "Clica em \"Comece grátis\" (ou em \"Entrar\" e depois \"Criar conta grátis\").",
      "A conta já nasce ligada a você, sem digitar nada.",
    ],
    nota: "Se o link não ligar, ela ainda pode digitar o seu código em Indique e ganhe, em até 7 dias depois de criar a conta.",
  },
  {
    icone: "🤖",
    titulo: "No Android (Google Play)",
    passos: [
      "Ela baixa o Planner Organiza na Google Play.",
      "Na tela de entrar, toca em \"Tenho um convite\" e digita o seu código.",
      "Cria a conta. Pronto: ficou ligada a você.",
    ],
    nota: "O link sozinho não chega até o app. Por isso, no celular, o código é o que vale: peça sempre para ela digitar.",
  },
  {
    icone: "🍎",
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
  { q: "Quanto eu ganho exatamente?", a: "30% do valor líquido de cada pagamento da indicada, durante 12 meses contados do primeiro pagamento dela. Valor líquido é o que sobra depois da taxa do cartão (site) ou da taxa da loja (App Store e Google Play)." },
  { q: "A indicada ganha algum desconto?", a: "Não. Ela testa grátis por 7 dias, como todo mundo, e paga o preço normal se assinar. Não prometa desconto nem dias extras." },
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
  const [indicadas, setIndicadas] = useState(5);
  useEffect(() => { document.title = "Indique e ganhe 30% · Planner Organiza"; }, []);
  const simulado = indicadas * comissaoAno(PLANOS[2]);

  return (
    <div className="lp-page lp-suporte lp-indique">
      <CabecalhoIndique />

      <main className="sup-main ind-main">
        <div className="lp-section-eyebrow">Programa de afiliadas</div>
        <h1>Indique o Planner e <em>ganhe 30%</em> por 12 meses</h1>
        <p className="sup-intro">
          Você conhece outras personal organizers. Indique o Planner Organiza e receba <strong>30% de cada pagamento</strong>
          {" "}delas durante um ano, no site, no iPhone ou no Android, <strong>por Pix, todo mês</strong>.
        </p>
        <div className="ind-ctas">
          <a className="lp-btn-primary" href={CRIAR} onClick={() => rastrear("afiliada_criar", "AfiliadaCriar")}>Quero ser afiliada</a>
          <a className="ind-sec" href={ENTRAR} onClick={() => rastrear("afiliada_entrar", "AfiliadaEntrar")}>Já tenho conta: entrar e me inscrever</a>
        </div>

        <div className="ind-resumo">
          <div><b>30%</b><span>de cada pagamento</span></div>
          <div><b>12 meses</b><span>por indicada</span></div>
          <div><b>Pix</b><span>todo mês, a partir de R$ 50</span></div>
        </div>

        <h2 className="ind-h2">Como funciona</h2>
        <ol className="ind-passos">
          <li><b>Inscreva-se</b><span>Crie a sua conta grátis (ou entre) e vá em <em>Indique e ganhe</em>. Informe nome, CPF e chave Pix e escolha o seu código.</span></li>
          <li><b>Aguarde a aprovação</b><span>A equipe do Planner confere a inscrição. Aprovada, o seu link e o seu código aparecem no painel, como <code>plannerorganiza.com.br/?ref=TAMARA</code>.</span></li>
          <li><b>Divulgue</b><span>Mande o link no direct, no WhatsApp, nos stories, no grupo de organizers. No celular, peça para ela digitar o seu código no app.</span></li>
          <li><b>Ela testa e assina</b><span>A indicada testa grátis por 7 dias, como todo mundo. Se assinar, cada pagamento dela gera comissão para você.</span></li>
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

        <h2 className="ind-h2">Quanto dá para ganhar</h2>
        <div className="ind-tabela">
          {PLANOS.map(p => (
            <div key={p.nome} className="ind-card">
              <small>Indicada no plano {p.nome} ({brl(p.preco)})</small>
              <b>{brl(comissaoAno(p))}</b>
              <span>para você em 12 meses</span>
            </div>
          ))}
        </div>
        <div className="ind-sim">
          <label htmlFor="ind-qtd">Se <b>{indicadas}</b> organizer{indicadas !== 1 ? "s" : ""} assinarem o plano anual pelo seu link:</label>
          <input id="ind-qtd" type="range" min={1} max={30} value={indicadas} onChange={e => setIndicadas(Number(e.target.value))} />
          <p>Você recebe cerca de <b>{brl(simulado)}</b> no ano.</p>
          <small>Valores aproximados, para assinaturas pelo site (taxa do cartão de 3,99% + R$ 0,39). Pela App Store e pela Google Play a taxa da loja é maior, e a comissão fica um pouco menor.</small>
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
