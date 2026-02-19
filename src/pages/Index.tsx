import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, Music, Star, Sparkles, Camera } from "lucide-react";
import TimeCounter from "@/components/TimeCounter";
import FloatingHearts from "@/components/FloatingHearts";
import PhotoCarousel from "@/components/PhotoCarousel";
import heroBg from "@/assets/hero-bg.jpg";
import coupleHands from "@/assets/couple-hands.jpg";
import coupleDance from "@/assets/couple-dance.jpg";
import romanticBg from "@/assets/romantic-bg.jpg";
import couplePhoto from "@/assets/couple-photo.jpg";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";

const COUPLE_DATE = new Date("2022-07-22T00:00:00");
const COUPLE_NAMES = "Maria & José";
const LOVE_MESSAGE = `Desde que você chegou, tudo ficou mais bonito e mais cheio de significado. Sua risada, suas palavras e sua presença tornam meus dias mais leves e cheios de amor. Obrigado(a) por compartilhar momentos comigo. Te amo mais a cada dia que passa. ❤️`;

const MILESTONES = [
  { emoji: "💕", title: "Primeiro encontro", date: "22 de julho de 2022" },
  { emoji: "💋", title: "Primeiro beijo", date: "25 de julho de 2022" },
  { emoji: "🏠", title: "Morando juntos", date: "15 de janeiro de 2023" },
  { emoji: "✈️", title: "Primeira viagem", date: "10 de março de 2023" },
];
const STORY_PHOTOS = [
  { src: story1, alt: "Nosso momento 1" },
  { src: story2, alt: "Nosso momento 2" },
  { src: story3, alt: "Nosso momento 3" },
];

function ParallaxImage({
  src,
  alt,
  speed = 0.3,
  overlay = 0.5,
  children,
  className = "",
}: {
  src: string;
  alt: string;
  speed?: number;
  overlay?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 20}%`, `${speed * 20}%`]);

  return (
    <div ref={ref} className={`relative min-h-screen overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-0 -top-[20%] -bottom-[20%]">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlay})` }}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <div className="relative bg-background">
      <FloatingHearts />

      {/* ── SLIDE 1: Hero with beach bg ── */}
      <ParallaxImage src={heroBg} alt="Casal na praia" speed={0.4} overlay={0.45}>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-romantic flex items-center justify-center glow-primary">
              <Heart className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm uppercase tracking-[0.3em] text-foreground/70 font-body mb-2"
          >
            Nosso
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-6xl sm:text-8xl font-romantic text-gradient-romantic leading-tight"
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
            transition={{ delay: 1.2 }}
            className="mt-12 animate-bounce text-foreground/50"
          >
            <span className="text-xs font-body uppercase tracking-widest">Deslize para baixo</span>
          </motion.div>
        </div>
      </ParallaxImage>

      {/* ── SLIDE 2: Names + Photo ── */}
      <ParallaxImage src={couplePhoto} alt={COUPLE_NAMES} speed={0.25} overlay={0.55}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl sm:text-7xl font-romantic text-gradient-romantic">
            {COUPLE_NAMES}
          </h2>
          <p className="text-sm text-foreground/60 font-body mt-3 tracking-widest uppercase">
            22 de julho de 2022
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </motion.div>
          </div>
        </motion.div>
      </ParallaxImage>

      {/* ── SLIDE 3: Counter over hands photo ── */}
      <ParallaxImage src={coupleHands} alt="Mãos do casal" speed={0.35} overlay={0.6}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center"
        >
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
          <p className="text-sm text-foreground/70 font-body uppercase tracking-[0.25em] mb-6">
            Estamos juntos há
          </p>
          <TimeCounter startDate={COUPLE_DATE} />
          <p className="mt-8 text-foreground/50 text-sm font-body">
            …e contando cada segundo ✨
          </p>
        </motion.div>
      </ParallaxImage>

      {/* ── SLIDE 4: Milestones over dance photo ── */}
      <ParallaxImage src={coupleDance} alt="Casal dançando" speed={0.3} overlay={0.65}>
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

          <div className="space-y-4">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-center gap-4 bg-background/40 backdrop-blur-md rounded-2xl p-5 border border-foreground/10"
              >
                <span className="text-3xl">{m.emoji}</span>
                <div>
                  <p className="text-foreground font-body font-medium">{m.title}</p>
                  <p className="text-xs text-foreground/50 font-body">{m.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxImage>

      {/* ── SLIDE 5: Photo Gallery Stories ── */}
      <ParallaxImage src={couplePhoto} alt="Nossas fotos" speed={0.15} overlay={0.7}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Camera className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic mb-8">
            Nossos Momentos
          </h2>
          <PhotoCarousel photos={STORY_PHOTOS} />
        </motion.div>
      </ParallaxImage>

      {/* ── SLIDE 6: Love Message over roses ── */}
      <ParallaxImage src={romanticBg} alt="Rosas e velas" speed={0.2} overlay={0.6}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg text-center"
        >
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-6" />
          <div className="bg-background/30 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-foreground/10 glow-primary">
            <p className="text-foreground/90 font-body text-base sm:text-lg leading-relaxed italic">
              "{LOVE_MESSAGE}"
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-foreground/40 text-xs font-body">
            <Music className="w-4 h-4" />
            <span>Nossa música favorita ♪</span>
          </div>

          <p className="mt-16 text-xs text-foreground/30 font-body">
            Feito com <Heart className="w-3 h-3 inline text-primary fill-primary" /> Tempo Juntos
          </p>
        </motion.div>
      </ParallaxImage>
    </div>
  );
};

export default Index;
