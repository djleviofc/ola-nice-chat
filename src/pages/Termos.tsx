import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Termos = () => {
  return (
    <div className="relative bg-background min-h-screen font-body">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="text-sm font-body text-muted-foreground">Momentos de Amor</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-romantic text-foreground mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-10">Última atualização: fevereiro de 2025</p>

          <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar ou utilizar a plataforma <strong className="text-foreground">Momentos de Amor</strong> (disponível em momentosdeamor.com), você concorda integralmente com os presentes Termos de Uso. Caso não concorde com algum dos termos, por favor não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">2. Descrição do Serviço</h2>
              <p>
                O Momentos de Amor é uma plataforma digital que permite criar páginas românticas personalizadas contendo fotos, mensagens, músicas e outros elementos afetivos. Ao finalizar a criação, o usuário recebe um QR Code exclusivo para compartilhar com quem desejar.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">3. Cadastro e Uso</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Não é necessário criar uma conta para utilizar o serviço.</li>
                <li>Você é responsável pela veracidade das informações fornecidas no momento da criação da página.</li>
                <li>É vedada a criação de conteúdo ofensivo, difamatório, obsceno ou que viole direitos de terceiros.</li>
                <li>Cada compra gera uma página única, vinculada ao e-mail fornecido.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">4. Pagamento e Reembolso</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>O pagamento é realizado via <strong className="text-foreground">PIX</strong>, com confirmação instantânea.</li>
                <li>Após a confirmação do pagamento, a página é ativada imediatamente.</li>
                <li>Por se tratar de produto digital entregue imediatamente após o pagamento, <strong className="text-foreground">não há direito a reembolso</strong>, salvo em casos de falha técnica comprovada por nossa parte.</li>
                <li>Em caso de problemas, entre em contato pelo e-mail suporte@momentosdeamor.com.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">5. Conteúdo do Usuário</h2>
              <p className="mb-2">
                Ao enviar fotos, mensagens ou qualquer outro conteúdo para a plataforma, você declara e garante que:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Possui os direitos necessários sobre o conteúdo enviado.</li>
                <li>O conteúdo não viola direitos autorais, direitos de imagem ou qualquer outra legislação aplicável.</li>
                <li>O conteúdo não contém material ilegal, ofensivo ou que viole a privacidade de terceiros.</li>
              </ul>
              <p className="mt-2">
                O Momentos de Amor reserva-se o direito de remover conteúdos que violem estas diretrizes, sem aviso prévio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">6. Disponibilidade da Página</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Sua página ficará disponível por tempo <strong className="text-foreground">indeterminado</strong>, sem custos adicionais.</li>
                <li>Nos reservamos o direito de encerrar o serviço mediante aviso prévio de 30 dias por e-mail.</li>
                <li>Não nos responsabilizamos por indisponibilidades temporárias decorrentes de manutenção ou falhas técnicas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">7. Privacidade e Proteção de Dados</h2>
              <p className="mb-2">
                Seus dados são tratados com total sigilo e responsabilidade, em conformidade com a <strong className="text-foreground">Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Coletamos apenas as informações necessárias para a criação e entrega do serviço (nome, e-mail e conteúdo da página).</li>
                <li>Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.</li>
                <li>As fotos e demais conteúdos enviados são armazenados de forma segura e acessados apenas por meio do link/QR Code exclusivo da sua página.</li>
                <li>Para solicitar exclusão dos seus dados, entre em contato pelo e-mail suporte@momentosdeamor.com.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">8. Limitação de Responsabilidade</h2>
              <p>
                O Momentos de Amor não se responsabiliza por danos diretos, indiretos ou incidentais decorrentes do uso ou impossibilidade de uso da plataforma. Nossa responsabilidade total está limitada ao valor pago pelo serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">9. Alterações nos Termos</h2>
              <p>
                Podemos atualizar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor a partir da data de publicação nesta página. O uso continuado da plataforma após as alterações implica aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-body font-bold text-foreground mb-3">10. Contato</h2>
              <p>
                Em caso de dúvidas, sugestões ou solicitações relacionadas a estes Termos, entre em contato conosco:
              </p>
              <p className="mt-2">
                📧 <a href="mailto:suporte@momentosdeamor.com" className="text-primary hover:underline">suporte@momentosdeamor.com</a>
              </p>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground/50 font-body">
              Momentos de Amor © 2025. Todos os direitos reservados.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Termos;
