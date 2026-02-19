import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Milestone {
  emoji: string;
  title: string;
  date: string;
  description?: string;
}

interface TimelineStoriesProps {
  milestones: Milestone[];
  onClose: () => void;
}

const TimelineStories = ({ milestones, onClose }: TimelineStoriesProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    if (current < milestones.length - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    } else {
      onClose();
    }
  }, [current, milestones.length, onClose]);

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

  const m = milestones[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 pb-2 z-10">
        {milestones.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-foreground/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: i < current ? "100%" : i === current ? "100%" : "0%" }}
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
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            {/* Emoji */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.15 }}
              className="text-7xl sm:text-8xl mb-6"
            >
              {m.emoji}
            </motion.span>

            {/* Date */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm text-primary font-body uppercase tracking-[0.3em] mb-3"
            >
              {m.date}
            </motion.p>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-5xl font-romantic text-gradient-romantic text-center leading-tight"
            >
              {m.title}
            </motion.h2>

            {/* Description */}
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

            {/* Navigation hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-8 flex items-center gap-3 text-foreground/30"
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
