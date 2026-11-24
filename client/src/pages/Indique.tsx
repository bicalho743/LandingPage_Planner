import { useEffect, useState } from "react";

// Página pública do programa de afiliadas (plannerorganiza.com.br/indique). A inscrição acontece no site do
// Planner (Conta › Indique e ganhe), com a conta da afiliada: os botões levam ao login ou ao cadastro e, depois,
// abrem a inscrição (parâmetro afiliada=1, tratado no app.py do PlannerOrganizer).
const APP_URL = "https://app.plannerorganiza.com.br";
const ENTRAR = `${APP_URL}/?afiliada=1`;
const CRIAR = `${APP_URL}/?cadastro=1&afiliada=1&utm_source=indique&utm_medium=landing`;

const PLANOS = [
  { nome: "Mensal", preco: 59.9, vezes: 12 },
  { nome: "Trimestral", preco: 149.9, vezes: 4 },
  { nome: "Anual", preco: 479.9, vezes: 1 },
];
// mesmo cálculo de utils/afiliados.py: 30% do valor líquido (cartão no site: 3,99% + R$ 0,39)
const liquido = (v: number) => Math.max(0, v * (1 - 0.0399) - 0.39);
const comissaoAno = (p: { preco: number; vezes: number }) => liquido(p.preco) * 0.3 * p.vezes;
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PERGUNTAS = [
  { q: "Preciso ser cliente do Planner?", a: "Você precisa de uma conta, que é onde ficam o seu link, o painel e as comissões. Criar a conta é grátis; você não precisa assinar para indicar." },
  { q: "Como a pessoa indicada fica ligada a mim?", a: "Ela cria a conta pelo seu link ou digita o seu código em \"Tenho um convite\" no app. A partir daí, cada pagamento dela nos próximos 12 meses gera comissão para você, seja pelo site, pelo iPhone ou pelo Android." },
  { q: "Quando eu recebo?", a: "A comissão fica liberada 30 dias depois do pagamento da indicada (o prazo de reembolso). Todo mês pagamos por Pix quem tem R$ 50 ou mais liberados." },
  { q: "E se a indicada pedir reembolso?", a: "A comissão daquele pagamento é cancelada. As outras continuam valendo." },
  { q: "Preciso ter CNPJ?", a: "Não. Pedimos CPF e chave Pix. Se você for MEI, pode emitir nota; se for pessoa física, a comissão pode ter a retenção de impostos prevista em lei." },
  { q: "Posso indicar a mim mesma?", a: "Não. Também não vale criar contas para ganhar comissão nem anunciar no Google usando o nome Planner Organiza." },
];

function rastrear(ga: string, meta: string, params: Record<string, unknown> = {}) {
  const w = window as any;
  try { w.gtag && w.gtag("event", ga, params); } catch (e) { /* sem rastreamento */ }
  try { w.fbq && w.fbq("trackCustom", meta, params); } catch (e) { /* sem rastreamento */ }
}

export default function Indique() {
  const [aberta, setAberta] = useState<number | null>(0);
  const [indicadas, setIndicadas] = useState(5);
  useEffect(() => { document.title = "Indique e ganhe · Planner Organiza"; }, []);
  const simulado = indicadas * comissaoAno(PLANOS[2]);

  return (
    <div className="lp-page lp-suporte lp-indique">
      <header className="lp-header scrolled">
        <a href="/" className="lp-logo">
          <img src="/icon-192.png" alt="" className="lp-logo-icone" width="34" height="34" />
          Planner <span>Organiza</span>
        </a>
        <a href={ENTRAR} className="lp-header-cta">Entrar</a>
      </header>

      <main className="sup-main ind-main">
        <div className="lp-section-eyebrow">Programa de afiliadas</div>
        <h1>Indique o Planner e <em>ganhe 30%</em> por 12 meses</h1>
        <p className="sup-intro">
          Você conhece outras personal organizers. Indique o Planner Organiza, elas ganham <strong>30 dias grátis</strong>
          {" "}e você recebe <strong>30% de cada pagamento</strong> delas durante um ano, por Pix, todo mês.
        </p>
        <div className="ind-ctas">
          <a className="lp-btn-primary" href={CRIAR} onClick={() => rastrear("afiliada_criar", "AfiliadaCriar")}>Quero ser afiliada</a>
          <a className="ind-sec" href={ENTRAR} onClick={() => rastrear("afiliada_entrar", "AfiliadaEntrar")}>Já tenho conta: entrar e me inscrever</a>
        </div>

        <h2 className="ind-h2">Como funciona</h2>
        <ol className="ind-passos">
          <li><b>Inscreva-se</b><span>Entre ou crie a sua conta e vá em <em>Indique e ganhe</em>. Informe CPF e chave Pix e escolha o seu código.</span></li>
          <li><b>Receba o seu link</b><span>Depois da aprovação, você ganha um link e um código, como <code>TAMARA</code>, para divulgar.</span></li>
          <li><b>Ela testa 30 dias grátis</b><span>Quem entra pelo seu link ou usa o seu código tem 30 dias de teste em vez de 7.</span></li>
          <li><b>Você ganha 30% por 12 meses</b><span>Cada pagamento dela, no site, no iPhone ou no Android, gera comissão no seu painel.</span></li>
          <li><b>Pix todo mês</b><span>A comissão é liberada 30 dias após o pagamento e paga por Pix a partir de R$ 50.</span></li>
        </ol>

        <h2 className="ind-h2">Quanto dá para ganhar</h2>
        <div className="ind-tabela">
          {PLANOS.map(p => (
            <div key={p.nome} className="ind-card">
              <small>Indicada no plano {p.nome}</small>
              <b>{brl(comissaoAno(p))}</b>
              <span>em 12 meses</span>
            </div>
          ))}
        </div>
        <div className="ind-sim">
          <label htmlFor="ind-qtd">Se <b>{indicadas}</b> organizer{indicadas !== 1 ? "s" : ""} assinarem o plano anual pelo seu link:</label>
          <input id="ind-qtd" type="range" min={1} max={30} value={indicadas} onChange={e => setIndicadas(Number(e.target.value))} />
          <p>Você recebe cerca de <b>{brl(simulado)}</b> no ano.</p>
          <small>Valores aproximados, calculados sobre o que entra depois da taxa do cartão. Pelas lojas (App Store e Google Play) a taxa é maior e a comissão fica um pouco menor.</small>
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

        <div className="ind-final">
          <h2>Pronta para indicar?</h2>
          <a className="lp-btn-primary" href={CRIAR} onClick={() => rastrear("afiliada_criar", "AfiliadaCriar", { origem: "final" })}>Quero ser afiliada</a>
          <p className="ind-nota">A inscrição é aprovada pela equipe do Planner. Ao se inscrever, você aceita as regras do programa, mostradas na página de inscrição.</p>
        </div>
      </main>

      <footer className="lp-footer">
        <span>© {new Date().getFullYear()} Planner Organiza · Tâmara Cavalcante · CNPJ 40.278.995/0001-71</span>
        <div className="lp-footer-links">
          <a href="/">Início</a>
          <a href="/termos">Termos de Uso</a>
          <a href="/privacidade">Política de Privacidade</a>
          <a href="/suporte">Suporte</a>
        </div>
      </footer>
    </div>
  );
}
