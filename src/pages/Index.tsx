import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, Music, Star, Sparkles } from "lucide-react";
import TimeCounter from "@/components/TimeCounter";
import FloatingHearts from "@/components/FloatingHearts";
import couplePhoto from "@/assets/couple-photo.jpg";

const COUPLE_DATE = new Date("2022-07-22T00:00:00");
const COUPLE_NAMES = "Maria & José";
const LOVE_MESSAGE = `Desde que você chegou, tudo ficou mais bonito e mais cheio de significado. Sua risada, suas palavras e sua presença tornam meus dias mais leves e cheios de amor. Obrigado(a) por compartilhar momentos comigo. Te amo mais a cada dia que passa. ❤️`;

const MILESTONES = [
  { emoji: "💕", title: "Primeiro encontro", date: "22 de julho de 2022" },
  { emoji: "💋", title: "Primeiro beijo", date: "25 de julho de 2022" },
  { emoji: "🏠", title: "Morando juntos", date: "15 de janeiro de 2023" },
  { emoji: "✈️", title: "Primeira viagem", date: "10 de março de 2023" },
];

function ParallaxSection({
  children,
  speed = 0.5,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.25], [1, 0.85]);

  return (
    <div ref={containerRef} className="relative min-h-[500vh] bg-background">
      <FloatingHearts />

      {/* ── SLIDE 1: Hero ── */}
      <motion.section
        style={{ opacity: opacityHero, scale: scaleHero }}
        className="sticky top-0 z-10 flex min-h-screen flex-col items-center justify-center px-4"
      >
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-body mb-2"
        >
          Nosso
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-6xl sm:text-8xl font-romantic text-gradient-romantic leading-tight text-center"
        >
          Tempo Juntos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg sm:text-xl text-foreground font-body font-light mt-2"
        >
          É O MELHOR <span className="font-semibold">PRESENTE</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 animate-bounce text-muted-foreground"
        >
          <span className="text-xs font-body uppercase tracking-widest">Deslize para baixo</span>
        </motion.div>
      </motion.section>

      {/* ── SLIDE 2: Photo + Names ── */}
      <ParallaxSection speed={0.3} className="relative z-20 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative mb-8"
          >
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-primary/30 glow-primary">
              <img src={couplePhoto} alt={COUPLE_NAMES} className="w-full h-full object-cover" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-romantic flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-6xl font-romantic text-gradient-romantic text-center"
          >
            {COUPLE_NAMES}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground font-body mt-2"
          >
            22 de julho de 2022
          </motion.p>
        </div>
      </ParallaxSection>

      {/* ── SLIDE 3: Counter ── */}
      <ParallaxSection speed={0.2} className="relative z-20 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-center text-sm text-muted-foreground font-body uppercase tracking-[0.25em] mb-6">
              Estamos juntos há
            </p>
            <TimeCounter startDate={COUPLE_DATE} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-muted-foreground text-center text-sm font-body"
          >
            …e contando cada segundo ✨
          </motion.p>
        </div>
      </ParallaxSection>

      {/* ── SLIDE 4: Milestones ── */}
      <ParallaxSection speed={0.4} className="relative z-20 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Star className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic">
              Nossos Momentos
            </h2>
          </motion.div>

          <div className="space-y-6">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-center gap-4 bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border"
              >
                <span className="text-3xl">{m.emoji}</span>
                <div>
                  <p className="text-foreground font-body font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground font-body">{m.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>

      {/* ── SLIDE 5: Love Message ── */}
      <ParallaxSection speed={0.15} className="relative z-20 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg text-center"
        >
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-6" />
          <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-border glow-primary">
            <p className="text-foreground/90 font-body text-base sm:text-lg leading-relaxed italic">
              "{LOVE_MESSAGE}"
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground text-xs font-body">
            <Music className="w-4 h-4" />
            <span>Nossa música favorita ♪</span>
          </div>

          <p className="mt-16 text-xs text-muted-foreground font-body">
            Feito com <Heart className="w-3 h-3 inline text-primary fill-primary" /> Tempo Juntos
          </p>
        </motion.div>
      </ParallaxSection>
    </div>
  );
};

export default Index;
