import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, Star, Sparkles } from "lucide-react";
import TimeCounter from "@/components/TimeCounter";
import FloatingHearts from "@/components/FloatingHearts";
import PhotoCarousel from "@/components/PhotoCarousel";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import TimelineStories from "@/components/TimelineStories";
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

const Index = () => {
  const [showStories, setShowStories] = useState(false);

  const handlePlayTriggered = () => {
    setTimeout(() => {
      setShowStories(true);
    }, 5000);
  };

  return (
    <div className="relative bg-background min-h-screen">
      <FloatingHearts />

      {/* Stories overlay */}
      <AnimatePresence>
        {showStories && (
          <TimelineStories
            milestones={MILESTONES}
            onClose={() => setShowStories(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SECTION 1: Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
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
          className="text-sm uppercase tracking-[0.3em] text-foreground/70 font-body mb-2"
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
          transition={{ delay: 1.2 }}
          className="mt-12 animate-bounce text-foreground/50"
        >
          <span className="text-xs font-body uppercase tracking-widest">Deslize para baixo</span>
        </motion.div>
      </section>

      {/* ── SECTION 2: Photo Carousel ── */}
      <section className="relative py-20 px-4 flex flex-col items-center">
        <PhotoCarousel photos={STORY_PHOTOS} />
      </section>

      {/* ── SECTION 3: Names ── */}
      <section className="relative py-24 px-4 flex flex-col items-center">
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
          <div className="mt-6 flex justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 4: Counter ── */}
      <section className="relative py-24 px-4 flex flex-col items-center">
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
      </section>

      {/* ── SECTION 5: Spotify Player ── */}
      <section className="relative py-24 px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Music className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic">
            Nossa Música
          </h2>
          <p className="text-sm text-foreground/50 font-body mt-2">
            Aperte o play e reviva nossa história ✨
          </p>
        </motion.div>
        <SpotifyPlayer
          songName="Nossa Música Favorita"
          artistName={COUPLE_NAMES}
          onPlayTriggered={handlePlayTriggered}
        />
      </section>

      {/* ── SECTION 6: Love Message ── */}
      <section className="relative py-24 px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg text-center"
        >
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-6" />
          <div className="bg-card/40 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-border glow-primary">
            <p className="text-foreground/90 font-body text-base sm:text-lg leading-relaxed italic">
              "{LOVE_MESSAGE}"
            </p>
          </div>

          <p className="mt-16 text-xs text-foreground/30 font-body">
            Feito com <Heart className="w-3 h-3 inline text-primary fill-primary" /> Tempo Juntos
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
