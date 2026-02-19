import { motion } from "framer-motion";
import { Heart, Music } from "lucide-react";
import TimeCounter from "@/components/TimeCounter";
import FloatingHearts from "@/components/FloatingHearts";
import couplePhoto from "@/assets/couple-photo.jpg";

const COUPLE_DATE = new Date("2022-07-22T00:00:00");
const COUPLE_NAMES = "Maria & José";
const LOVE_MESSAGE = `Desde que você chegou, tudo ficou mais bonito e mais cheio de significado. Sua risada, suas palavras e sua presença tornam meus dias mais leves e cheios de amor. Obrigado(a) por compartilhar momentos comigo. Te amo mais a cada dia que passa. ❤️`;

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <FloatingHearts />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-10 sm:py-16">
        {/* Logo / Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-6"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-romantic flex items-center justify-center glow-primary">
            <Heart className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-body mb-2">
            Nosso
          </p>
          <h1 className="text-5xl sm:text-7xl font-romantic text-gradient-romantic leading-tight">
            Tempo Juntos
          </h1>
          <p className="text-lg sm:text-xl text-foreground font-body font-light mt-1">
            É O MELHOR <span className="font-semibold">PRESENTE</span>
          </p>
        </motion.div>

        {/* Couple Names & Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-romantic text-gradient-romantic">
            {COUPLE_NAMES}
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            22 de julho de 2022
          </p>
        </motion.div>

        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="relative mb-10"
        >
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-primary/30 glow-primary">
            <img
              src={couplePhoto}
              alt={COUPLE_NAMES}
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-romantic flex items-center justify-center"
          >
            <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </motion.div>
        </motion.div>

        {/* Time Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mb-10 w-full max-w-lg"
        >
          <p className="text-center text-sm text-muted-foreground font-body uppercase tracking-widest mb-4">
            Juntos há
          </p>
          <TimeCounter startDate={COUPLE_DATE} />
        </motion.div>

        {/* Love Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="max-w-md text-center mb-10"
        >
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border">
            <p className="text-foreground/90 font-body text-sm sm:text-base leading-relaxed italic">
              "{LOVE_MESSAGE}"
            </p>
          </div>
        </motion.div>

        {/* Music hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex items-center gap-2 text-muted-foreground text-xs font-body"
        >
          <Music className="w-4 h-4" />
          <span>Nossa música favorita ♪</span>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground font-body">
            Feito com <Heart className="w-3 h-3 inline text-primary fill-primary" /> Tempo Juntos
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
