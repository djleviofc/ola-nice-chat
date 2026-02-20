import { motion } from "framer-motion";
import { Heart, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingHearts = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-primary/20 select-none"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 20 + 10}px`,
        }}
        animate={{
          y: [0, -80, 0],
          opacity: [0.1, 0.4, 0.1],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: Math.random() * 4 + 4,
          repeat: Infinity,
          delay: Math.random() * 4,
        }}
      >
        ♥
      </motion.div>
    ))}
  </div>
);

const PagamentoSucesso = () => {
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      <FloatingHearts />

      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative inline-flex mb-8"
        >
          {/* Pulsing rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}

          <div className="relative w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-primary/60 font-body text-xs font-semibold tracking-widest uppercase mb-2">
            Pagamento confirmado
          </p>
          <h1 className="font-romantic text-gradient-romantic text-5xl mb-4">
            Que lindo! 💕
          </h1>
          <p className="text-foreground/70 font-body text-base leading-relaxed mb-8">
            Seu pedido foi recebido com sucesso. Agora é só aguardar!
          </p>
        </motion.div>

        {/* Email card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-body font-bold text-foreground text-base">
              Confira seu e-mail
            </h2>
          </div>

          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Em instantes você receberá um e-mail com:
          </p>

          <ul className="mt-4 space-y-3 text-left">
            {[
              { icon: "🔗", text: "O link da sua página romântica" },
              { icon: "📱", text: "QR Code exclusivo para compartilhar" },
              { icon: "💖", text: "Instruções para personalizar ainda mais" },
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-foreground/80 font-body text-sm">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-8"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground font-body text-xs leading-relaxed text-left">
              <span className="text-primary font-semibold">Dica:</span> Verifique também a caixa de spam ou promoções caso não encontre o e-mail na caixa de entrada.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col gap-3"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-sm transition-colors glow-primary"
          >
            <Heart className="w-4 h-4 fill-primary-foreground" />
            Voltar ao início
          </Link>
          <p className="text-muted-foreground font-body text-xs">
            Obrigado por usar o Momentos de Amor 💕
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PagamentoSucesso;
