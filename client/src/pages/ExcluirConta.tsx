import { useEffect } from "react";

// Página pública de exclusão de conta (link exigido pelo Google Play para apps com conta).
// A exclusão em si começa dentro do app (regra da Apple); aqui explicamos o caminho e o pedido por contato.
const WHATSAPP = "https://wa.me/5531992041112?text=Ol%C3%A1!%20Quero%20excluir%20a%20minha%20conta%20do%20Planner%20Organiza";
const EMAIL = "contato@plannerorganiza.com.br";
const APP_URL = "https://app.plannerorganiza.com.br";

export default function ExcluirConta() {
  useEffect(() => { document.title = "Excluir conta · Planner Organiza"; }, []);

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
        <div className="lp-section-eyebrow">Sua conta</div>
        <h1>Como excluir a sua <em>conta</em></h1>
        <p className="sup-intro">
          Você pode excluir a sua conta do Planner Organiza a qualquer momento. A exclusão apaga a conta e os dados
          guardados nela: clientes, propostas, agenda, financeiro e configurações da sua marca.
        </p>

        <h2>Pelo aplicativo (Android ou iPhone)</h2>
        <ol className="sup-passos">
          <li>Abra o app e entre na sua conta.</li>
          <li>Toque em <b>Menu</b> e depois em <b>Perfil e marca</b>.</li>
          <li>No fim da tela, toque em <b>Excluir minha conta</b> e confirme.</li>
        </ol>

        <h2>Sem acesso ao app</h2>
        <p className="sup-intro">
          Peça a exclusão pelo WhatsApp ou por e-mail, informando o e-mail da conta. Confirmamos que o pedido é seu antes
          de apagar.
        </p>
        <div className="sup-contatos">
          <a className="sup-contato" href={WHATSAPP} target="_blank" rel="noreferrer">
            <span className="sup-icone" aria-hidden="true">💬</span>
            <span><b>WhatsApp</b><small>(31) 99204-1112</small></span>
          </a>
          <a className="sup-contato" href={`mailto:${EMAIL}?subject=Excluir%20minha%20conta`}>
            <span className="sup-icone" aria-hidden="true">✉️</span>
            <span><b>E-mail</b><small>{EMAIL}</small></span>
          </a>
        </div>

        <h2>O que acontece com os dados</h2>
        <ul className="sup-passos">
          <li>A conta e os dados cadastrados nela são apagados em até 30 dias.</li>
          <li>Guardamos apenas o que a lei obriga a manter, como registros de cobrança e de acesso, pelo prazo legal.</li>
          <li>Assinatura feita pelo site é cancelada junto com a conta.</li>
          <li>
            Assinatura feita pelo <b>Google Play</b> ou pela <b>App Store</b> precisa ser cancelada na própria loja
            (Google Play › Assinaturas, ou Ajustes do iPhone › seu nome › Assinaturas). Excluir a conta não cancela a
            cobrança da loja.
          </li>
        </ul>

        <p className="sup-links">
          <a href="/privacidade">Política de Privacidade</a>
          <a href="/termos">Termos de Uso</a>
          <a href="/suporte">Suporte</a>
        </p>
      </main>

      <footer className="lp-footer">
        <span>© {new Date().getFullYear()} Planner Organiza. Feito com 💛 para personal organizers.</span>
      </footer>
    </div>
  );
}
