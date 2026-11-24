import { useEffect } from "react";
import { CabecalhoIndique, RodapeIndique } from "./Indique";

// Termos do programa de afiliadas (plannerorganiza.com.br/indique/termos).
// Precisam bater com utils/afiliados.py do PlannerOrganizer: 30% do líquido, 12 meses a contar do 1º pagamento,
// liberação em 30 dias, Pix mensal a partir de R$ 50, só pagamentos em reais, sem autoindicação.
const ATUALIZADO = "24 de novembro de 2026";

export default function IndiqueTermos() {
  useEffect(() => { document.title = "Termos do programa de afiliadas · Planner Organiza"; }, []);
  return (
    <div className="lp-page lp-suporte lp-indique">
      <CabecalhoIndique />
      <main className="sup-main ind-main ind-termos">
        <div className="lp-section-eyebrow">Programa de afiliadas</div>
        <h1>Termos do programa de afiliadas</h1>
        <p className="sup-intro">
          Estas regras valem para quem se inscreve no programa "Indique e ganhe" do Planner Organiza.
          Atualizado em {ATUALIZADO}. <a href="/indique">Voltar para a página do programa</a>.
        </p>

        <nav className="ind-indice">
          <a href="#quem">1. Quem pode participar</a>
          <a href="#inscricao">2. Inscrição e aprovação</a>
          <a href="#vinculo">3. Como a indicada fica ligada a você</a>
          <a href="#comissao">4. Quanto você ganha</a>
          <a href="#pagamento">5. Liberação e pagamento</a>
          <a href="#reembolso">6. Reembolso e cancelamento</a>
          <a href="#divulgacao">7. Como divulgar (e o que não pode)</a>
          <a href="#impostos">8. Impostos</a>
          <a href="#dados">9. Seus dados</a>
          <a href="#fim">10. Suspensão, mudanças e fim do programa</a>
          <a href="#contato">11. Contato</a>
        </nav>

        <h2 id="quem">1. Quem pode participar</h2>
        <ul>
          <li>Pessoas maiores de 18 anos, com CPF e chave Pix em seu próprio nome.</li>
          <li>É preciso ter uma conta no Planner Organiza (criar a conta é grátis). Não é preciso ser assinante.</li>
          <li>Cada pessoa pode ter apenas uma inscrição como afiliada.</li>
        </ul>

        <h2 id="inscricao">2. Inscrição e aprovação</h2>
        <ul>
          <li>A inscrição é feita no site do Planner, em <b>Indique e ganhe</b>, com nome, CPF, chave Pix, Instagram (opcional) e o código que você quer usar.</li>
          <li>Toda inscrição passa pela aprovação da equipe do Planner Organiza, que pode recusar sem precisar justificar.</li>
          <li>Depois de aprovada, aparecem no seu painel o seu <b>link</b> (plannerorganiza.com.br/?ref=SEUCODIGO) e o seu <b>código</b>.</li>
          <li>Se o código escolhido já estiver em uso, o sistema acrescenta um número (por exemplo, ANA2).</li>
        </ul>

        <h2 id="vinculo">3. Como a indicada fica ligada a você</h2>
        <p>A comissão só existe se a conta da indicada estiver ligada ao seu código. A ligação acontece assim:</p>
        <ul>
          <li><b>No site</b> (computador ou navegador do celular): a indicada abre o seu link e cria a conta. A ligação é automática.</li>
          <li><b>No app Android</b> (Google Play): ao criar a conta, ela toca em <b>"Tenho um convite"</b> e digita o seu código.</li>
          <li><b>No app iPhone</b> (App Store): ao criar a conta, ela toca em <b>"Tenho um convite"</b> e digita o seu código.</li>
          <li>O link não é repassado pelas lojas até o app. Quem baixa o app precisa digitar o código; sem ele, a indicação não é registrada.</li>
          <li>Se a ligação não acontecer, a indicada pode informar o seu código no site, em <b>Indique e ganhe</b>, em até 7 dias depois de criar a conta.</li>
          <li>Cada conta fica ligada a <b>uma única afiliada</b>, para sempre. Vale o primeiro código registrado; não é possível trocar depois.</li>
          <li>Contas que já existiam antes da indicação não podem ser ligadas depois desse prazo.</li>
        </ul>

        <h2 id="comissao">4. Quanto você ganha</h2>
        <ul>
          <li>Você recebe <b>30% do valor líquido</b> de cada pagamento da indicada.</li>
          <li><b>Valor líquido</b> é o que de fato entra para o Planner Organiza:
            <ul>
              <li>no site (cartão, pelo Stripe): o valor pago menos a taxa do cartão (3,99% + R$ 0,39);</li>
              <li>na App Store e na Google Play: o valor que a loja repassa, depois da taxa dela (em geral 15%).</li>
            </ul>
          </li>
          <li>A comissão vale para os pagamentos feitos durante <b>12 meses</b>, contados do primeiro pagamento da indicada. Depois disso, ela continua cliente, mas não gera mais comissão.</li>
          <li>Valem os planos mensal, trimestral e anual, inclusive as renovações dentro desses 12 meses.</li>
          <li>Só contam pagamentos em <b>reais (R$)</b>. Assinaturas pagas em outra moeda pelas lojas não geram comissão.</li>
          <li>O período de teste grátis (7 dias) não gera comissão, porque não há pagamento.</li>
          <li>A indicada não ganha desconto nem dias extras por usar o seu código, e você não pode prometer isso.</li>
        </ul>

        <h2 id="pagamento">5. Liberação e pagamento</h2>
        <ul>
          <li>Cada comissão fica <b>"a liberar"</b> por 30 dias depois do pagamento da indicada, que é o prazo de reembolso.</li>
          <li>Passados os 30 dias, ela vira <b>"liberada"</b>.</li>
          <li>No início de cada mês, pagamos por <b>Pix</b>, na chave cadastrada, todo o valor liberado de quem tem <b>R$ 50 ou mais</b>.</li>
          <li>Se o valor liberado for menor que R$ 50, ele fica acumulado para o mês seguinte. Nada se perde.</li>
          <li>Você acompanha tudo no seu painel: indicadas, assinantes, comissões a liberar, liberadas e já recebidas.</li>
          <li>A chave Pix precisa estar no seu nome. Se ela mudar, avise antes do pagamento pelo e-mail de contato.</li>
        </ul>

        <h2 id="reembolso">6. Reembolso e cancelamento da indicada</h2>
        <ul>
          <li>Se a indicada pedir reembolso de um pagamento, a comissão daquele pagamento é cancelada, se ainda não tiver sido paga a você.</li>
          <li>Se a indicada cancelar a assinatura, as comissões dos pagamentos que ela já fez continuam valendo; só não há novas.</li>
          <li>Comissões já pagas a você não são descontadas depois, exceto em caso de fraude (item 10).</li>
        </ul>

        <h2 id="divulgacao">7. Como divulgar (e o que não pode)</h2>
        <p>Pode divulgar no seu Instagram, TikTok, WhatsApp, grupos, cursos e mentorias, com as suas palavras. Não é permitido:</p>
        <ul>
          <li>Indicar a si mesma, usar outra conta sua ou criar contas falsas para gerar comissão.</li>
          <li>Anunciar no Google, Meta ou em qualquer plataforma usando o nome "Planner Organiza" (ou parecido) como palavra-chave, nome de anúncio ou de página.</li>
          <li>Se passar pelo Planner Organiza, pela Tâmara ou pela equipe, ou criar perfis, sites e e-mails que pareçam oficiais.</li>
          <li>Prometer descontos, dias grátis extras, recursos ou preços diferentes dos oficiais.</li>
          <li>Enviar spam ou mensagens em massa para pessoas que não pediram.</li>
          <li>Usar conteúdo enganoso, ofensivo ou que desrespeite a lei.</li>
        </ul>

        <h2 id="impostos">8. Impostos</h2>
        <ul>
          <li>A comissão é renda sua, e você é responsável por declará-la.</li>
          <li>Se você for MEI ou tiver empresa, podemos pedir nota fiscal do valor recebido.</li>
          <li>Se for pessoa física, podem ser feitas as retenções previstas na lei, quando houver.</li>
        </ul>

        <h2 id="dados">9. Seus dados</h2>
        <ul>
          <li>Usamos nome, CPF, chave Pix, e-mail e Instagram só para aprovar a inscrição, calcular e pagar as comissões e cumprir obrigações legais.</li>
          <li>A indicada não vê os seus dados, e você não vê os dados dela: no painel aparecem só números e valores.</li>
          <li>O tratamento segue a <a href="/privacidade">Política de Privacidade</a> do Planner Organiza e a LGPD.</li>
        </ul>

        <h2 id="fim">10. Suspensão, mudanças e fim do programa</h2>
        <ul>
          <li>Em caso de fraude ou de descumprimento destes termos, a inscrição pode ser suspensa ou encerrada, e as comissões ligadas à irregularidade são canceladas ou devolvidas.</li>
          <li>O programa pode mudar ou acabar, com aviso de pelo menos 30 dias. Comissões já liberadas continuam garantidas e serão pagas.</li>
          <li>Você pode sair do programa quando quiser, pelo e-mail de contato. O que já estiver liberado será pago no mês seguinte, se for R$ 50 ou mais.</li>
          <li>Ser afiliada não cria vínculo de emprego, sociedade ou representação com o Planner Organiza.</li>
        </ul>

        <h2 id="contato">11. Contato</h2>
        <p>
          Dúvidas sobre o programa, pagamentos ou mudança de chave Pix: <a href="mailto:contato@candeiatec.com.br">contato@candeiatec.com.br</a>.
          Responsável pelo programa: Tâmara Cavalcante · CNPJ 40.278.995/0001-71.
        </p>

        <div className="ind-final">
          <a className="lp-btn-primary" href="/indique">Voltar para Indique e ganhe</a>
        </div>
      </main>
      <RodapeIndique />
    </div>
  );
}
