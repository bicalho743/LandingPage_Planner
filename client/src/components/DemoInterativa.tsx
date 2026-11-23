/**
 * Demonstração interativa da landing: uma réplica leve das telas do app, com dados de uma organizer
 * fictícia. Nada é salvo e nada sai do navegador. Seis passos guiados (cliente, agenda, proposta, PDF,
 * marca e financeiro); a troca de cor vale só para o PDF da proposta.
 */
import { useEffect, useMemo, useState } from "react";

type Tela = "clientes" | "ficha" | "agenda" | "proposta" | "pdf" | "financeiro";
type Props = {
  aoCadastrar: (origem: string) => void;
  aoRastrear: (ga: string, meta: string, params?: Record<string, unknown>, custom?: boolean) => void;
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CLIENTES = [
  { id: 1, nome: "Mariana Albuquerque", bairro: "Savassi, BH", tel: "(31) 90000-1234", aniv: "12/03", status: "Retorno em 14 dias", tag: "retorno" },
  { id: 2, nome: "Juliana Ferraz", bairro: "Lourdes, BH", tel: "(31) 90000-5678", aniv: "28/07", status: "Visita técnica qua 10h", tag: "visita" },
  { id: 3, nome: "Patrícia Lemos", bairro: "Belvedere, BH", tel: "(31) 90000-9012", aniv: "05/11", status: "Proposta enviada", tag: "proposta" },
  { id: 4, nome: "Camila Duarte", bairro: "Funcionários, BH", tel: "(31) 90000-3456", aniv: "19/01", status: "Serviço concluído", tag: "ok" },
];

const AMBIENTES = [
  { nome: "Closet do casal", valor: 900 },
  { nome: "Cozinha", valor: 650 },
  { nome: "Despensa", valor: 380 },
  { nome: "Quarto infantil", valor: 520 },
  { nome: "Lavanderia", valor: 300 },
];

const CORES = ["#0D1B2A", "#7A4B8C", "#2F6F5E", "#B5525C", "#C9A84C", "#3C6E9F"];

const PASSOS: { id: Tela; titulo: string; dica: string }[] = [
  { id: "ficha", titulo: "Abra a ficha de uma cliente", dica: "Toque em Mariana Albuquerque: contato, aniversário e o retorno marcado." },
  { id: "agenda", titulo: "Veja a agenda da semana", dica: "Visitas, serviços e retornos num lugar só. Toque em um compromisso." },
  { id: "proposta", titulo: "Monte uma proposta", dica: "Marque os ambientes e o total aparece na hora, já com o sinal." },
  { id: "pdf", titulo: "Abra a proposta em PDF", dica: "É assim que a cliente recebe, pronta para o WhatsApp." },
  { id: "pdf", titulo: "Coloque sua marca no PDF", dica: "Escolha a cor e o nome do seu negócio: o PDF muda na hora." },
  { id: "financeiro", titulo: "Aprovou? O sinal entra sozinho", dica: "Toque em Aprovar e veja o sinal cair no financeiro." },
];

export default function DemoInterativa({ aoCadastrar, aoRastrear }: Props) {
  const [aparelho, setAparelho] = useState<"tablet" | "celular">(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches ? "celular" : "tablet");
  const [tela, setTela] = useState<Tela>("clientes");
  const [feitos, setFeitos] = useState<boolean[]>([false, false, false, false, false, false]);
  const [ativo, setAtivo] = useState(0);
  const [escolhidos, setEscolhidos] = useState<string[]>(["Closet do casal", "Cozinha"]);
  const [assistentes, setAssistentes] = useState(1);
  const [cor, setCor] = useState(CORES[0]);
  const [marca, setMarca] = useState("Studio Organize");
  const [aprovada, setAprovada] = useState(false);
  const [compromisso, setCompromisso] = useState<string | null>(null);

  const subtotal = useMemo(() => AMBIENTES.filter(a => escolhidos.includes(a.nome)).reduce((s, a) => s + a.valor, 0), [escolhidos]);
  const equipe = assistentes * 250;
  const total = subtotal + equipe + 60;
  const sinal = Math.round(total * 0.3);

  const marcar = (i: number) => setFeitos(f => {
    if (f[i]) return f;
    const n = [...f]; n[i] = true;
    aoRastrear("demo_passo", "DemoPasso", { passo: i + 1 }, true);
    return n;
  });
  useEffect(() => {
    const prox = feitos.findIndex(f => !f);
    setAtivo(prox === -1 ? 5 : prox);
  }, [feitos]);

  const ir = (t: Tela) => { setTela(t); setCompromisso(null); };
  const irPasso = (i: number) => {
    const t = PASSOS[i].id;
    if (i === 0) { ir("ficha"); marcar(0); }
    else if (t === "pdf" && escolhidos.length === 0) { setEscolhidos(["Closet do casal"]); ir("pdf"); }
    else ir(t);
    if (i === 1) marcar(1);
    if (i === 3) marcar(3);
  };
  const recomecar = () => {
    setTela("clientes"); setFeitos([false, false, false, false, false, false]); setEscolhidos(["Closet do casal", "Cozinha"]);
    setAssistentes(1); setCor(CORES[0]); setMarca("Studio Organize"); setAprovada(false); setCompromisso(null);
  };
  const tudoFeito = feitos.every(Boolean);

  const abas: { id: Tela; rot: string; ic: string }[] = [
    { id: "clientes", rot: "Clientes", ic: "👥" },
    { id: "agenda", rot: "Agenda", ic: "📅" },
    { id: "proposta", rot: "Propostas", ic: "📄" },
    { id: "financeiro", rot: "Financeiro", ic: "💰" },
  ];

  return (
    <div className="dm-wrap">
      <div className="dm-esq">
        <div className="lp-section-eyebrow">Experimente agora</div>
        <h2>Mexa no app. <em>Antes de criar a conta.</em></h2>
        <p className="lp-section-sub">
          Este é o Planner Organiza com a agenda e as clientes de uma organizer fictícia. Toque, monte, escolha.
          Nada do que você fizer aqui é salvo.
        </p>
        <div className="dm-toggle" role="tablist" aria-label="Ver como">
          <button className={aparelho === "tablet" ? "on" : ""} onClick={() => setAparelho("tablet")}>▭ Tablet</button>
          <button className={aparelho === "celular" ? "on" : ""} onClick={() => setAparelho("celular")}>▯ Celular</button>
        </div>
        <ol className="dm-passos">
          {PASSOS.map((p, i) => (
            <li key={i}>
              <button className={`${feitos[i] ? "feito" : ""} ${ativo === i ? "ativo" : ""}`} onClick={() => irPasso(i)}>
                <span className="dm-num">{feitos[i] ? "✓" : i + 1}</span>
                <span>{p.titulo}</span>
                <span className="dm-seta">→</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="dm-dica">{tudoFeito ? "Pronto! Você viu o caminho todo, da cliente ao sinal no caixa." : PASSOS[ativo].dica}</div>
        <div className="dm-acoes">
          <button className="lp-btn-primary" onClick={() => { aoRastrear("demo_cadastro", "DemoCadastro", {}, true); aoCadastrar("demo"); }}>
            Gostei, quero começar grátis
          </button>
          <button className="dm-recomecar" onClick={recomecar}>Recomeçar</button>
        </div>
        <p className="dm-nota">Clientes, valores e telefones são fictícios.</p>
      </div>

      <div className={`dm-aparelho ${aparelho}`}>
        <div className="dm-tela">
          <div className="dm-topo">
            <span className="dm-logo">Planner <b>Organiza</b></span>
            <span className="dm-selo">Demonstração · nada é salvo</span>
          </div>

          <div className="dm-corpo">
            {tela === "clientes" && (
              <div>
                <h4>Clientes</h4>
                <div className="dm-busca">🔎 Buscar por nome ou telefone</div>
                {CLIENTES.map(c => (
                  <button key={c.id} className={`dm-card dm-cli ${c.id === 1 ? "dm-pulsa" : ""}`}
                          onClick={() => { ir("ficha"); marcar(0); }}>
                    <span className="dm-av">{c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    <span className="dm-cli-txt"><b>{c.nome}</b><small>{c.bairro}</small></span>
                    <span className={`dm-tag ${c.tag}`}>{c.status}</span>
                  </button>
                ))}
              </div>
            )}

            {tela === "ficha" && (
              <div>
                <button className="dm-voltar" onClick={() => ir("clientes")}>← Clientes</button>
                <div className="dm-card dm-ficha">
                  <span className="dm-av g">MA</span>
                  <div><b>Mariana Albuquerque</b><small>Savassi, BH · cliente desde mar/2025</small></div>
                </div>
                <div className="dm-grade">
                  <div className="dm-card"><small>Telefone</small><b>(31) 90000-1234</b></div>
                  <div className="dm-card"><small>Aniversário</small><b>🎂 12/03</b></div>
                  <div className="dm-card"><small>Último serviço</small><b>Closet e cozinha</b></div>
                  <div className="dm-card"><small>Retorno</small><b>Em 14 dias</b></div>
                </div>
                <div className="dm-card dm-obs"><small>Observações da casa</small>Prefere manhãs. Portaria pede nome da equipe na véspera.</div>
                <div className="dm-linha">
                  <button className="dm-btn verde">WhatsApp</button>
                  <button className="dm-btn" onClick={() => ir("proposta")}>Nova proposta</button>
                </div>
              </div>
            )}

            {tela === "agenda" && (
              <div>
                <h4>Agenda · semana de 24/11</h4>
                <div className="dm-semana">
                  {[
                    ["Seg", []], ["Ter", [["09:00", "Retorno", "Camila Duarte", "retorno"]]],
                    ["Qua", [["10:00", "Visita técnica", "Juliana Ferraz", "visita"]]],
                    ["Qui", [["08:30", "Organização", "Mariana Albuquerque", "servico"]]],
                    ["Sex", [["08:30", "Organização", "Mariana Albuquerque", "servico"], ["16:00", "Aniversário", "Patrícia Lemos", "aniv"]]],
                  ].map(([dia, itens]: any) => (
                    <div key={dia} className="dm-dia">
                      <span className="dm-dia-nome">{dia}</span>
                      {itens.length === 0 && <span className="dm-vazio">livre</span>}
                      {itens.map((it: string[], k: number) => (
                        <button key={k} className={`dm-ev ${it[3]}`} onClick={() => { setCompromisso(`${it[1]} · ${it[2]} · ${dia} ${it[0]}`); marcar(1); }}>
                          <b>{it[0]}</b> {it[1]}<small>{it[2]}</small>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                {compromisso && <div className="dm-card dm-detalhe">📌 {compromisso}<small>O app avisa no celular na manhã do dia.</small></div>}
              </div>
            )}

            {tela === "proposta" && (
              <div>
                <h4>Nova proposta · Mariana Albuquerque</h4>
                <small className="dm-rot">Ambientes do projeto</small>
                <div className="dm-chips">
                  {AMBIENTES.map(a => {
                    const on = escolhidos.includes(a.nome);
                    return (
                      <button key={a.nome} className={on ? "on" : ""}
                              onClick={() => { setEscolhidos(e => on ? e.filter(x => x !== a.nome) : [...e, a.nome]); marcar(2); }}>
                        {on ? "✓ " : "+ "}{a.nome} <small>{brl(a.valor)}</small>
                      </button>
                    );
                  })}
                </div>
                <div className="dm-linha dm-equipe">
                  <small className="dm-rot">Assistentes</small>
                  <button onClick={() => { setAssistentes(a => Math.max(0, a - 1)); marcar(2); }}>−</button>
                  <b>{assistentes}</b>
                  <button onClick={() => { setAssistentes(a => Math.min(4, a + 1)); marcar(2); }}>+</button>
                  <small>R$ 250 por dia cada</small>
                </div>
                <div className="dm-card dm-total">
                  <div><span>Ambientes</span><b>{brl(subtotal)}</b></div>
                  <div><span>Equipe</span><b>{brl(equipe)}</b></div>
                  <div><span>Deslocamento</span><b>{brl(60)}</b></div>
                  <div className="t"><span>Total</span><b>{brl(total)}</b></div>
                  <div><span>Sinal de 30% para reservar a data</span><b>{brl(sinal)}</b></div>
                </div>
                <button className="dm-btn ouro" disabled={escolhidos.length === 0} onClick={() => { marcar(2); ir("pdf"); marcar(3); }}>
                  Gerar PDF da proposta
                </button>
              </div>
            )}

            {tela === "pdf" && (
              <div className="dm-pdf-area">
                <div className="dm-marca">
                  <small className="dm-rot">Sua marca no PDF</small>
                  <div className="dm-cores">
                    {CORES.map(c => (
                      <button key={c} style={{ background: c }} className={cor === c ? "on" : ""} aria-label={`Cor ${c}`}
                              onClick={() => { setCor(c); marcar(4); }} />
                    ))}
                  </div>
                  <input value={marca} maxLength={28} onChange={e => { setMarca(e.target.value); marcar(4); }} aria-label="Nome do seu negócio" />
                </div>
                <div className="dm-pdf" style={{ ["--marca" as any]: cor }}>
                  <div className="dm-pdf-topo">
                    <span className="dm-pdf-logo">{(marca || "S").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                    <div><b>{marca || "Seu negócio"}</b><small>Ana Ribeiro · Personal organizer</small></div>
                    <span className="dm-pdf-num">Nº 024<small>válida até 07/01</small></span>
                  </div>
                  <div className="dm-pdf-titulo">Proposta de Serviço<small>para Mariana Albuquerque</small></div>
                  <table>
                    <tbody>
                      {AMBIENTES.filter(a => escolhidos.includes(a.nome)).map(a => (
                        <tr key={a.nome}><td>{a.nome}</td><td>{brl(a.valor)}</td></tr>
                      ))}
                      <tr><td>Equipe ({assistentes} assistente{assistentes !== 1 ? "s" : ""})</td><td>{brl(equipe)}</td></tr>
                      <tr><td>Deslocamento</td><td>{brl(60)}</td></tr>
                    </tbody>
                  </table>
                  <div className="dm-pdf-total"><span>Investimento</span><b>{brl(total)}</b></div>
                  <small className="dm-pdf-sinal">Sinal de {brl(sinal)} para reservar a data · saldo no dia do serviço</small>
                </div>
                <div className="dm-linha">
                  <button className="dm-btn verde">Enviar no WhatsApp</button>
                  <button className="dm-btn ouro" onClick={() => ir("financeiro")}>Cliente aprovou →</button>
                </div>
              </div>
            )}

            {tela === "financeiro" && (
              <div>
                <h4>Financeiro · novembro</h4>
                <div className="dm-grade">
                  <div className="dm-card"><small>Recebido no mês</small><b>{brl(4280 + (aprovada ? sinal : 0))}</b></div>
                  <div className="dm-card"><small>A receber</small><b>{brl(2150 + (aprovada ? total - sinal : 0))}</b></div>
                </div>
                {!aprovada ? (
                  <div className="dm-card dm-aprovar">
                    <div><b>Proposta Nº 024 · Mariana</b><small>{brl(total)} · sinal de {brl(sinal)}</small></div>
                    <button className="dm-btn ouro dm-pulsa" onClick={() => { setAprovada(true); marcar(5); }}>Aprovar</button>
                  </div>
                ) : (
                  <div className="dm-card dm-ok">✅ Proposta aprovada. O sinal entrou como recebido e o saldo ficou a receber, sem digitar nada.</div>
                )}
                <small className="dm-rot">Lançamentos</small>
                {aprovada && <div className="dm-lanc novo"><span>Sinal · Mariana Albuquerque</span><b>+ {brl(sinal)}</b></div>}
                <div className="dm-lanc"><span>Saldo · Camila Duarte</span><b>+ {brl(1850)}</b></div>
                <div className="dm-lanc"><span>Caixas organizadoras</span><b className="neg">− {brl(320)}</b></div>
                <div className="dm-lanc"><span>Sinal · Juliana Ferraz</span><b>+ {brl(540)}</b></div>
              </div>
            )}
          </div>

          <nav className="dm-abas">
            {abas.map(a => (
              <button key={a.id} className={tela === a.id || (a.id === "clientes" && tela === "ficha") || (a.id === "proposta" && tela === "pdf") ? "on" : ""}
                      onClick={() => { ir(a.id); if (a.id === "agenda") marcar(1); }}>
                <span>{a.ic}</span>{a.rot}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
