import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Music } from "lucide-react";
import TimeCounter from "@/components/TimeCounter";

interface Milestone {
  emoji: string;
  title: string;
  date: string;
  description?: string;
}

interface TimelineStoriesProps {
  milestones: Milestone[];
  coupleNames: string;
  coupleDate: Date;
  onClose: () => void;
}

const IntroStory = ({ coupleNames, coupleDate }: { coupleNames: string; coupleDate: Date }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="mb-6"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-romantic flex items-center justify-center glow-primary">
        <Music className="w-10 h-10 text-primary-foreground" />
      </div>
    </motion.div>

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-xs sm:text-sm text-primary font-body uppercase tracking-[0.3em] mb-4"
    >
      Tempo de casal animado
    </motion.p>

    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="text-4xl sm:text-6xl font-romantic text-gradient-romantic leading-tight mb-4"
    >
      {coupleNames}
    </motion.h2>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-foreground/80 font-body text-sm sm:text-base max-w-xs mb-8 leading-relaxed"
    >
      Seu tempo de casal animado no estilo da retrospectiva do app de músicas. 100% personalizada para esse amor tão especial de vocês dois!
    </motion.p>

    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.65 }}
    >
      <TimeCounter startDate={coupleDate} />
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="mt-8 flex items-center gap-2"
    >
      <Heart className="w-4 h-4 text-primary fill-primary" />
      <span className="text-xs text-foreground/70 font-body uppercase tracking-widest">
        …e contando cada segundo
      </span>
      <Heart className="w-4 h-4 text-primary fill-primary" />
    </motion.div>
  </div>
);

const TimelineStories = ({ milestones, coupleNames, coupleDate, onClose }: TimelineStoriesProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const totalSlides = milestones.length + 1; // +1 for intro

  const goNext = useCallback(() => {
    if (current < totalSlides - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    } else {
      onClose();
    }
  }, [current, totalSlides, onClose]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }, [current]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir >= 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const isIntro = current === 0;
  const milestoneIndex = current - 1;
  const m = !isIntro ? milestones[milestoneIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 pb-2 z-10">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-foreground/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: i <= current ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-foreground/70 hover:text-foreground transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story content - tap zones */}
      <div
        className="flex-1 relative overflow-hidden cursor-pointer"
        onClick={handleTap}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {isIntro ? (
              <IntroStory coupleNames={coupleNames} coupleDate={coupleDate} />
            ) : m ? (
              <div className="flex flex-col items-center justify-center px-8">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.15 }}
                  className="text-7xl sm:text-8xl mb-6"
                >
                  {m.emoji}
                </motion.span>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs sm:text-sm text-primary font-body uppercase tracking-[0.3em] mb-3"
                >
                  {m.date}
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-5xl font-romantic text-gradient-romantic text-center leading-tight"
                >
                  {m.title}
                </motion.h2>

                {m.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mt-4 text-foreground/70 font-body text-center text-sm sm:text-base max-w-xs"
                  >
                    {m.description}
                  </motion.p>
                )}
              </div>
            ) : null}

            {/* Navigation hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
          className="absolute bottom-8 flex items-center gap-3 text-foreground/60"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-body uppercase tracking-widest">Toque para navegar</span>
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TimelineStories;
