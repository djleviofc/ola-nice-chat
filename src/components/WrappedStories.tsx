import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Music } from "lucide-react";
import confetti from "canvas-confetti";

interface WrappedStoriesProps {
  coupleNames: string;
  coupleDate: Date;
  onClose: () => void;
}

/* ── Equalizer bars ── */
const EqualizerBars = ({ count = 5, color = "bg-spotify" }: { count?: number; color?: string }) => (
  <div className="flex items-end gap-1 h-10">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className={`w-1.5 rounded-full ${color}`}
        animate={{
          height: ["40%", "100%", "60%", "90%", "30%", "80%", "50%"],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ── Pulsing geometric circles ── */
const PulsingCircles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { size: 300, x: "-10%", y: "-15%", delay: 0 },
      { size: 200, x: "70%", y: "60%", delay: 0.5 },
      { size: 150, x: "50%", y: "10%", delay: 1 },
    ].map((c, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2 border-spotify/20"
        style={{ width: c.size, height: c.size, left: c.x, top: c.y }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: c.delay,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ── Odometer digit ── */
const OdometerDigit = ({ digit, delay }: { digit: string; delay: number }) => (
  <motion.span
    initial={{ y: 40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
    className="inline-block text-6xl sm:text-8xl font-extrabold font-body text-spotify"
  >
    {digit}
  </motion.span>
);

/* ── Slide 1: Cover ── */
const CoverSlide = ({ coupleNames }: { coupleNames: string }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
    <PulsingCircles />

    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="mb-8"
    >
      <div className="w-20 h-20 rounded-full bg-spotify flex items-center justify-center glow-spotify">
        <Music className="w-10 h-10 text-spotify-foreground" />
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-4"
    >
      <EqualizerBars />
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="text-5xl sm:text-7xl font-extrabold font-body text-foreground leading-tight"
    >
      {coupleNames}
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="text-foreground/60 font-body text-sm sm:text-base mt-4 max-w-xs leading-relaxed"
    >
      Os momentos que marcaram essa relação
    </motion.p>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1 }}
      className="mt-10"
    >
      <EqualizerBars count={7} />
    </motion.div>
  </div>
);

/* ── Slide 2: The Big Number ── */
const BigNumberSlide = ({ totalDays }: { totalDays: number }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center relative bg-wrapped-red">
    <PulsingCircles />

    <motion.p
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-foreground/80 font-body text-sm uppercase tracking-[0.3em] mb-6"
    >
      O Wrapped de vocês
    </motion.p>

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
    >
      <span className="text-7xl sm:text-9xl font-extrabold font-body text-foreground">
        {totalDays.toLocaleString("pt-BR")}
      </span>
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-foreground/90 font-body text-lg sm:text-xl mt-4 font-semibold"
    >
      dias de histórias, momentos e conexões
    </motion.p>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1 }}
      className="mt-8"
    >
      <EqualizerBars count={9} color="bg-foreground/30" />
    </motion.div>
  </div>
);

/* ── Slide 3: Animated Counter (Odometer) ── */
const OdometerSlide = ({ totalDays }: { totalDays: number }) => {
  const [counting, setCounting] = useState(true);
  const [displayNum, setDisplayNum] = useState(0);
  const target = totalDays;

  useEffect(() => {
    if (!counting) return;
    const duration = 2500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayNum(current);
      if (step >= steps) {
        clearInterval(interval);
        setCounting(false);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [counting, target]);

  const digits = displayNum.toLocaleString("pt-BR").split("");

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
      <PulsingCircles />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      className="text-spotify font-body text-sm uppercase tracking-[0.3em] mb-8"
      >
        Dias juntos
      </motion.p>

      <div className="flex items-center justify-center overflow-hidden">
        {digits.map((d, i) => (
          <OdometerDigit key={`${i}-${d}`} digit={d} delay={0.3 + i * 0.05} />
        ))}
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ delay: 2.8, duration: 0.6 }}
        className="h-1 bg-spotify rounded-full mt-8"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
        className="text-foreground/50 font-body text-xs mt-4 uppercase tracking-widest"
      >
        …e cada segundo contou
      </motion.p>
    </div>
  );
};

/* ── Slide 4: Final Stat ── */
const FinalStatSlide = ({ totalDays }: { totalDays: number }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
    <PulsingCircles />

    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.2 }}
      className="text-6xl mb-6"
    >
      🌟
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-spotify/20 max-w-sm glow-spotify"
    >
      <p className="text-spotify font-body text-xs uppercase tracking-[0.3em] mb-4">
        Estatística final
      </p>

      <p className="text-foreground font-body text-lg sm:text-xl font-semibold leading-relaxed">
        Dias juntos:{" "}
        <span className="text-spotify font-extrabold text-3xl sm:text-4xl">
          {totalDays.toLocaleString("pt-BR")}
        </span>
      </p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-foreground/70 font-body text-base mt-4"
      >
        Vocês estão no{" "}
        <span className="text-spotify font-bold">Top 18%</span>{" "}
        dos casais no mundo 🌟
      </motion.p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="mt-8"
    >
      <EqualizerBars count={7} />
    </motion.div>
  </div>
);

/* ── Main Wrapped Stories ── */
const WrappedStories = ({ coupleNames, coupleDate, onClose }: WrappedStoriesProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const now = new Date();
  const diffMs = now.getTime() - coupleDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

  const totalSlides = 4;

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

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.9 },
      colors: ["#1DB954", "#1ed760", "#17a34a", "#ffffff"],
    });
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

  const slides = [
    <CoverSlide coupleNames={coupleNames} />,
    <BigNumberSlide totalDays={totalDays} />,
    <OdometerSlide totalDays={totalDays} />,
    <FinalStatSlide totalDays={totalDays} />,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-wrapped flex flex-col"
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 pb-2 z-10">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-foreground/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-spotify rounded-full"
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

      {/* Story content */}
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
            {slides[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation hint */}
      <div className="flex items-center justify-center gap-3 py-2 text-foreground/30">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-xs font-body uppercase tracking-widest">Toque para navegar</span>
        <ChevronRight className="w-4 h-4" />
      </div>

    </motion.div>
  );
};

export default WrappedStories;
