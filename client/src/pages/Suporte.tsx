import { useState, useEffect } from "react";

// Página de suporte (URL de suporte da App Store e da Google Play): contato e respostas rápidas.
const WHATSAPP = "https://wa.me/5531992041112?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20Planner%20Organiza";
const EMAIL = "contato@plannerorganiza.com.br";
const APP_URL = "https://app.plannerorganiza.com.br";

const PERGUNTAS = [
  {
    q: "Como entro na minha conta?",
    a: "No app ou em app.plannerorganiza.com.br, entre com e-mail e senha, com o Google ou, no iPhone, com a Apple. É a mesma conta no celular e no computador: tudo fica sincronizado.",
  },
  {
    q: "Esqueci a minha senha. E agora?",
    a: "Na tela de entrada, toque em \"Esqueci minha senha\" e informe o seu e-mail. Você recebe um link para criar uma senha nova. Se o e-mail não chegar, olhe a caixa de spam ou fale com a gente.",
  },
  {
    q: "Como gero o PDF de uma proposta?",
    a: "Em Propostas, toque na proposta e depois em \"Proposta Comercial (PDF)\". O PDF sai com o seu logo e as suas cores, que você configura em Menu > Perfil e marca.",
  },
  {
    q: "Como funcionam os lembretes de retorno das clientes?",
    a: "Quando a proposta é finalizada, o app cria os retornos da pós-organização (agradecimento, acompanhamento, ajuste fino). Eles aparecem na tela inicial no dia certo, com a mensagem pronta para o WhatsApp.",
  },
  {
    q: "O app calcula os meus impostos?",
    a: "O app organiza o DAS de cada mês, o limite do ano e o prazo da declaração do MEI ou do Simples Nacional. Os valores são estimativas para você se organizar: o app não substitui o contador.",
  },
  {
    q: "Como excluo a minha conta?",
    a: "No app, abra Menu > Perfil e marca e toque em \"Excluir minha conta\", no fim da tela. Seus dados são apagados e, se houver assinatura, ela é cancelada. Se preferir, peça a exclusão pelo WhatsApp ou por e-mail.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Seguimos a LGPD. Os seus dados e os das suas clientes ficam guardados com segurança e não são compartilhados com terceiros.",
  },
];

export default function Suporte() {
  const [aberta, setAberta] = useState<number | null>(0);
  useEffect(() => { document.title = "Suporte · Planner Organiza"; }, []);

  return (
    <div className="lp-page lp-suporte">
      <header className="lp-header scrolled">
        <a href="/" className="lp-logo">
          <img src="/icon-192.png" alt="" className="lp-logo-icone" width="34" height="34" />
          Planner <span>Organiza</span>
        </a>
        <a href={APP_URL} className="lp-header-cta">Entrar</a>
      </header>

      <main className="sup-main">
        <div className="lp-section-eyebrow">Suporte</div>
        <h1>Como podemos <em>ajudar?</em></h1>
        <p className="sup-intro">
          Fale com a gente pelo WhatsApp ou por e-mail. Quem responde é gente de verdade, que conhece o app.
          Respondemos em dias úteis, geralmente em poucas horas.
        </p>

        <div className="sup-contatos">
          <a className="sup-contato" href={WHATSAPP} target="_blank" rel="noreferrer">
            <span className="sup-icone" aria-hidden="true">💬</span>
            <span><b>WhatsApp</b><small>(31) 99204-1112</small></span>
          </a>
          <a className="sup-contato" href={`mailto:${EMAIL}?subject=Suporte%20Planner%20Organiza`}>
            <span className="sup-icone" aria-hidden="true">✉️</span>
            <span><b>E-mail</b><small>{EMAIL}</small></span>
          </a>
        </div>

        <h2>Respostas rápidas</h2>
        <div className="sup-faq">
          {PERGUNTAS.map((p, i) => (
            <div className="lp-faq-item" key={p.q}>
              <button className="lp-faq-q" onClick={() => setAberta(aberta === i ? null : i)} aria-expanded={aberta === i}>
                {p.q}
                <span className={`arrow${aberta === i ? " open" : ""}`}>+</span>
              </button>
              <div className={`lp-faq-a${aberta === i ? " open" : ""}`}>{p.a}</div>
            </div>
          ))}
        </div>

        <p className="sup-links">
          <a href={`${APP_URL}/?show_politica=true`} target="_blank" rel="noreferrer">Política de Privacidade</a>
          <a href={`${APP_URL}/?show_termos=true`} target="_blank" rel="noreferrer">Termos de Uso</a>
          <a href="/">Conheça o Planner Organiza</a>
        </p>
      </main>

      <footer className="lp-footer">
        <span>© {new Date().getFullYear()} Planner Organiza. Feito com 💛 para personal organizers.</span>
      </footer>
    </div>
  );
}
