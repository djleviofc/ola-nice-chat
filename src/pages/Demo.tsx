import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, Star } from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";
import BodasTimeline from "@/components/BodasTimeline";
import PhotoCarousel from "@/components/PhotoCarousel";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import WrappedStories from "@/components/WrappedStories";
import TimelineJourney from "@/components/TimelineJourney";
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

type StoryPhase = "none" | "countdown" | "wrapped" | "timeline";

const Index = () => {
  const [storyPhase, setStoryPhase] = useState<StoryPhase>("none");
  const [hasSeenTimeline, setHasSeenTimeline] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (storyPhase !== "countdown") return;
    if (countdown <= 0) {
      setStoryPhase("wrapped");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [storyPhase, countdown]);

  const handlePlayTriggered = () => {
    setCountdown(5);
    setStoryPhase("countdown");
  };

  return (
    <div className="relative bg-background min-h-screen">
      <FloatingHearts />

      {/* Stories overlays */}
      <AnimatePresence>
        {storyPhase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.18) 0%, hsl(var(--background)) 70%)" }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/20"
                style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ y: [0, -20, 0], scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
              >
                <Heart className="fill-primary" style={{ width: 20 + i * 6, height: 20 + i * 6 }} />
              </motion.div>
            ))}
            <div className="relative flex items-center justify-center mb-8">
              <motion.div
                className="absolute rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 200, height: 200 }}
              />
              <motion.div
                className="absolute rounded-full border border-primary/20"
                animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                style={{ width: 200, height: 200 }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.4, opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-[9rem] font-romantic text-gradient-romantic leading-none"
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mb-6"
            >
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-foreground/60 font-romantic text-2xl text-center"
            >
              Preparando algo especial…
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-foreground/30 font-body text-xs uppercase tracking-[0.3em] mt-3"
            >
              para vocês dois ♡
            </motion.p>
          </motion.div>
        )}
        {storyPhase === "wrapped" && (
          <WrappedStories
            coupleNames={COUPLE_NAMES}
            coupleDate={COUPLE_DATE}
            onClose={() => setStoryPhase("timeline")}
          />
        )}
        {storyPhase === "timeline" && (
          <TimelineJourney
            onClose={() => { setStoryPhase("none"); setHasSeenTimeline(true); }}
            onNext={() => { setStoryPhase("none"); setHasSeenTimeline(true); }}
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
          Momentos de Amor
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

      {/* ── SECTION 3: Spotify Player ── */}
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

        {/* Deslize para baixo - appears after stories close */}
        {hasSeenTimeline && storyPhase === "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 animate-bounce text-foreground/50"
          >
            <span className="text-xs font-body uppercase tracking-widest">Deslize para baixo</span>
          </motion.div>
        )}
      </section>

      {/* ── SECTION 4: Names ── */}
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

      {/* ── SECTION 5: Bodas ── */}
      <section className="relative py-24 px-4 flex flex-col items-center">
        <BodasTimeline />
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
            Feito com <Heart className="w-3 h-3 inline text-primary fill-primary" /> Momentos de Amor
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
