/**
 * "Veja por dentro": telas REAIS do Planner Organiza (app Android/iPhone e site no computador), gravadas com a conta
 * de demonstração de uma organizer de exemplo (PlannerOrganizer/scripts/telas_reais). Sete passos clicáveis; no passo
 * do PDF, as cores trocam o PDF real da proposta. As imagens ficam em /telas (app_*.webp, web_*.webp, pdf_*.webp).
 */
import { useEffect, useState } from "react";

type Aparelho = "computador" | "android" | "iphone";
type Props = {
  aoCadastrar: (origem: string) => void;
  aoRastrear: (ga: string, meta: string, params?: Record<string, unknown>, custom?: boolean) => void;
};

const PASSOS = [
  { id: "inicio", titulo: "Comece o dia pelo Início", dica: "Quanto sobrou no mês, o que tem para receber e pagar e o que fazer hoje, com o WhatsApp a um toque." },
  { id: "agenda", titulo: "Veja a agenda da semana", dica: "Serviços, visitas, retornos, aniversários das clientes e contas, organizados por dia." },
  { id: "precificacao", titulo: "Calcule o preço de um projeto", dica: "Marque os ambientes: o preço sugerido, o mínimo e o sinal aparecem na hora, com os seus números." },
  { id: "propostas", titulo: "Acompanhe cada proposta", dica: "Em aberto, aprovada, em execução e concluída: você vê onde cada cliente está." },
  { id: "pdf", titulo: "Proposta em PDF com a sua marca", dica: "É assim que a cliente recebe, com o botão de aprovar pelo WhatsApp. Toque nas cores ao lado." },
  { id: "pos", titulo: "Retornos que trazem a cliente de volta", dica: "Depois do serviço, a mensagem certa no dia certo: agradecimento, acompanhamento e opinião." },
  { id: "financeiro", titulo: "Aprovou? O sinal entra no financeiro", dica: "O que entrou, o que saiu e o que ainda vai entrar, sem planilha." },
] as const;

const CORES = [
  { id: "dourado", hex: "#B8943D", nome: "Dourado" },
  { id: "marinho", hex: "#0D1B2A", nome: "Azul-marinho" },
  { id: "ameixa", hex: "#5B4B8A", nome: "Ameixa" },
  { id: "verde", hex: "#2F7D57", nome: "Verde" },
  { id: "rosa", hex: "#B5546A", nome: "Rosa" },
  { id: "azul", hex: "#3D6BB3", nome: "Azul" },
];

function aparelhoInicial(): Aparelho {
  if (typeof navigator === "undefined") return "computador";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches ? "iphone" : "computador";
}

function BarraStatus({ tipo }: { tipo: Aparelho }) {
  return (
    <div className={`tr-status ${tipo}`}>
      <span>9:41</span>
      {tipo === "iphone" ? <i className="tr-ilha" /> : <i className="tr-camera" />}
      <span className="tr-icones" aria-hidden="true">
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4a6.7 6.7 0 0 0-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.5 1.9-2a2.8 2.8 0 0 0-3.8 0Z" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45" /><rect x="2" y="2" width="16" height="8" rx="2" /><rect x="22.6" y="4" width="1.6" height="4" rx=".8" opacity=".45" /></svg>
      </span>
    </div>
  );
}

export default function TelasReais({ aoCadastrar, aoRastrear }: Props) {
  const [aparelho, setAparelho] = useState<Aparelho>("computador");
  const [ativo, setAtivo] = useState(0);
  const [vistos, setVistos] = useState<boolean[]>(PASSOS.map((_, i) => i === 0));
  const [cor, setCor] = useState(CORES[0].id);
  useEffect(() => { setAparelho(aparelhoInicial()); }, []);

  const passo = PASSOS[ativo];
  const abrir = (i: number) => {
    setAtivo(i);
    setVistos((v) => v.map((x, j) => x || j === i));
    aoRastrear("demo_passo", "DemoPasso", { passo: i + 1, aparelho }, true);
  };
  const celular = aparelho !== "computador";
  const src = passo.id === "pdf" ? `/telas/pdf_${cor}.webp` : `/telas/${celular ? "app" : "web"}_${passo.id}.webp`;
  const alt = passo.id === "pdf" ? "Proposta em PDF gerada pelo Planner Organiza" :
    `Tela ${passo.titulo.toLowerCase()} no ${celular ? "app Planner Organiza" : "Planner Organiza no computador"}`;

  return (
    <div className="dm-wrap">
      <div className="dm-esq">
        <div className="lp-section-eyebrow">Telas reais</div>
        <h2>O Planner de verdade. <em>Antes de criar a conta.</em></h2>
        <p className="lp-section-sub">
          Estas são as telas reais do app e do site, com a conta de uma organizer de exemplo. Escolha o aparelho e toque nos passos.
        </p>
        <div className="dm-toggle tr-toggle" role="tablist" aria-label="Ver no">
          {([["computador", "Computador"], ["android", "Android"], ["iphone", "iPhone"]] as [Aparelho, string][]).map(([id, rot]) => (
            <button key={id} role="tab" aria-selected={aparelho === id} className={aparelho === id ? "on" : ""}
                    onClick={() => { setAparelho(id); aoRastrear("demo_aparelho", "DemoAparelho", { aparelho: id }, true); }}>
              {rot}
            </button>
          ))}
        </div>
        <ol className="dm-passos">
          {PASSOS.map((p, i) => (
            <li key={p.id}>
              <button className={`${vistos[i] && i !== ativo ? "feito" : ""} ${ativo === i ? "ativo" : ""}`} onClick={() => abrir(i)}>
                <span className="dm-num">{vistos[i] && i !== ativo ? "✓" : i + 1}</span>
                <span>{p.titulo}</span>
                <span className="dm-seta">→</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="dm-dica">{passo.dica}</div>
        <div className="dm-acoes">
          <button className="lp-btn-primary" onClick={() => { aoRastrear("demo_cadastro", "DemoCadastro", {}, true); aoCadastrar("demo"); }}>
            Gostei, quero começar grátis
          </button>
          {ativo < PASSOS.length - 1 && <button className="dm-recomecar" onClick={() => abrir(ativo + 1)}>Próximo passo</button>}
        </div>
        <p className="dm-nota">Clientes, valores e telefones da conta de exemplo são fictícios.</p>
      </div>

      <div className="tr-palco">
        {celular ? (
          <div className={`tr-cel ${aparelho}`}>
            <div className="tr-cel-tela">
              <BarraStatus tipo={aparelho} />
              <div className={`tr-cel-img ${passo.id === "pdf" ? "pdf" : ""}`}>
                <img src={src} alt={alt} width={390} height={passo.id === "pdf" ? 552 : 844} loading="lazy" decoding="async" />
              </div>
              <div className="tr-cel-gesto"><i /></div>
            </div>
          </div>
        ) : (
          <div className="tr-pc">
            <div className="tr-pc-barra"><i /><i /><i /><span>app.plannerorganiza.com.br</span></div>
            <div className={`tr-pc-img ${passo.id === "pdf" ? "pdf" : ""}`}>
              <img src={src} alt={alt} width={1440} height={passo.id === "pdf" ? 2037 : 900} loading="lazy" decoding="async" />
            </div>
          </div>
        )}
        {passo.id === "pdf" && (
          <div className="tr-cores" role="radiogroup" aria-label="Cor da sua marca no PDF">
            {CORES.map((c) => (
              <button key={c.id} role="radio" aria-checked={cor === c.id} aria-label={c.nome} title={c.nome}
                      className={cor === c.id ? "on" : ""} style={{ background: c.hex }}
                      onClick={() => { setCor(c.id); aoRastrear("demo_cor", "DemoCor", { cor: c.id }, true); }} />
            ))}
            <span>Sua cor, seu logotipo</span>
          </div>
        )}
        {/* pré-carrega as cores do PDF quando o passo abre, para a troca ser imediata */}
        {passo.id === "pdf" && <div hidden>{CORES.map((c) => <img key={c.id} src={`/telas/pdf_${c.id}.webp`} alt="" />)}</div>}
      </div>
    </div>
  );
}
