import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface WrappedStoriesProps {
  coupleNames: string;
  coupleDate: Date;
  onClose: () => void;
}

/* ── Floating petals background ── */
const FloatingPetals = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 10 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${5 + i * 10}%`,
          top: `${10 + (i % 4) * 20}%`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.sin(i) * 15, 0],
          rotate: [0, 180, 360],
          opacity: [0.08, 0.2, 0.08],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.4,
          ease: "easeInOut",
        }}
      >
        <Heart
          className="text-primary fill-primary"
          style={{ width: 10 + (i % 3) * 8, height: 10 + (i % 3) * 8 }}
        />
      </motion.div>
    ))}
  </div>
);

/* ── Glowing orbs ── */
const GlowOrbs = ({ color = "hsl(var(--primary))" }: { color?: string }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { size: 350, x: "-15%", y: "-20%", opacity: 0.06 },
      { size: 250, x: "65%", y: "55%", opacity: 0.05 },
      { size: 180, x: "40%", y: "5%", opacity: 0.04 },
    ].map((orb, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: orb.size,
          height: orb.size,
          left: orb.x,
          top: orb.y,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          opacity: orb.opacity,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [orb.opacity, orb.opacity * 2, orb.opacity] }}
        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
      />
    ))}
  </div>
);

/* ── Divider line ── */
const RomanticDivider = () => (
  <div className="flex items-center gap-3 my-6">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 60 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="h-px bg-gradient-to-r from-transparent to-primary/50"
    />
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
    >
      <Heart className="w-3 h-3 text-primary fill-primary" />
    </motion.div>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 60 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="h-px bg-gradient-to-l from-transparent to-primary/50"
    />
  </div>
);

/* ── Slide 1: Cover ── */
const CoverSlide = ({ coupleNames }: { coupleNames: string }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
    <FloatingPetals />
    <GlowOrbs />

    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 1 }}
      className="mb-8 relative"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary fill-primary" />
      </div>
      {/* Pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>

    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="text-primary font-body text-xs uppercase tracking-[0.4em] mb-3"
    >
      A história de
    </motion.p>

    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="text-5xl sm:text-6xl font-romantic text-gradient-romantic leading-tight"
    >
      {coupleNames}
    </motion.h1>

    <RomanticDivider />

    <motion.p
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="text-foreground/80 font-body text-sm max-w-xs leading-relaxed italic"
    >
      "Cada momento juntos é uma página do livro mais bonito que já foi escrito"
    </motion.p>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.3 }}
      className="mt-8 flex gap-2"
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        >
          <Star className="w-3 h-3 text-primary fill-primary" />
        </motion.div>
      ))}
    </motion.div>
  </div>
);

/* ── Slide 2: The Big Number ── */
const BigNumberSlide = ({ totalDays }: { totalDays: number }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
    <FloatingPetals />
    <GlowOrbs color="hsl(var(--primary))" />

    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-2"
    >
      <Heart className="w-8 h-8 text-primary fill-primary mx-auto" />
    </motion.div>

    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-foreground/90 font-body text-xs uppercase tracking-[0.4em] mb-6"
    >
      Já se passaram
    </motion.p>

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      className="relative"
    >
      {/* Glow behind number */}
      <div
        className="absolute inset-0 blur-3xl rounded-full"
        style={{ background: "hsl(var(--primary)/0.25)", transform: "scale(1.5)" }}
      />
      <span className="relative text-8xl sm:text-9xl font-romantic text-gradient-romantic">
        {totalDays.toLocaleString("pt-BR")}
      </span>
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="text-foreground font-romantic text-3xl sm:text-4xl mt-2"
    >
      dias de amor
    </motion.p>

    <RomanticDivider />

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="text-foreground/80 font-body text-sm italic max-w-xs leading-relaxed"
    >
      "O amor verdadeiro não se mede em dias, mas os dias ao seu lado são eternos"
    </motion.p>
  </div>
);

/* ── Odometer digit ── */
const OdometerDigit = ({ digit, delay }: { digit: string; delay: number }) => (
  <motion.span
    initial={{ y: 40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
    className="inline-block text-5xl sm:text-7xl font-romantic text-gradient-romantic"
  >
    {digit}
  </motion.span>
);

/* ── Slide 3: Minutes Together ── */
const OdometerSlide = ({ totalMinutes }: { totalMinutes: number }) => {
  const [counting, setCounting] = useState(true);
  const [displayNum, setDisplayNum] = useState(0);
  const target = totalMinutes;

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
      <FloatingPetals />
      <GlowOrbs />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="mb-4"
      >
        <Heart className="w-8 h-8 text-primary fill-primary mx-auto" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-foreground/90 font-body text-xs uppercase tracking-[0.4em] mb-6"
      >
        Minutos juntos
      </motion.p>

      <div className="flex items-center justify-center overflow-hidden flex-wrap gap-1">
        {digits.map((d, i) => (
          <OdometerDigit key={`${i}-${d}`} digit={d} delay={0.3 + i * 0.05} />
        ))}
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ delay: 2.8, duration: 0.8 }}
        className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mt-8"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
        className="flex items-center gap-2 mt-5"
      >
        <Heart className="w-3 h-3 text-primary fill-primary" />
        <p className="text-foreground/85 font-body text-sm italic">
          e cada minuto foi inesquecível
        </p>
        <Heart className="w-3 h-3 text-primary fill-primary" />
      </motion.div>
    </div>
  );
};

/* ── Slide 4: Final Love Note ── */
const FinalStatSlide = ({ totalDays, coupleNames }: { totalDays: number; coupleNames?: string }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.7 },
        colors: ["#e91e8c", "#f48fb1", "#ff6b9d", "#ffffff", "#ffd6e7"],
        shapes: ["circle"],
        scalar: 0.8,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
      <FloatingPetals />
      <GlowOrbs />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2, stiffness: 120 }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Heart className="w-16 h-16 text-primary fill-primary" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.4), transparent)" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card/40 backdrop-blur-md rounded-3xl p-8 border border-primary/20 max-w-sm"
        style={{ boxShadow: "0 0 40px hsl(var(--primary)/0.12)" }}
      >
        <p className="text-primary font-body text-xs uppercase tracking-[0.3em] mb-4">
          O resumo de vocês
        </p>

        <p className="text-foreground font-romantic text-4xl sm:text-5xl mb-2 text-gradient-romantic">
          {totalDays.toLocaleString("pt-BR")}
        </p>
        <p className="text-foreground font-romantic text-xl mb-4">
          dias de uma história linda
        </p>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent my-4" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-foreground/85 font-body text-sm italic leading-relaxed"
        >
          "Que essa história continue sendo escrita com muito amor, para sempre."
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center gap-2 mt-5"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            >
              <Heart className="w-4 h-4 text-primary fill-primary" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ── Main Wrapped Stories ── */
const WrappedStories = ({ coupleNames, coupleDate, onClose }: WrappedStoriesProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const now = new Date();
  const diffMs = now.getTime() - coupleDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

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
    <OdometerSlide totalMinutes={totalMinutes} />,
    <FinalStatSlide totalDays={totalDays} coupleNames={coupleNames} />,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Progress bars */}
      <div className="flex gap-1.5 px-4 pt-4 pb-2 z-10">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-foreground/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }}
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
        className="absolute top-4 right-4 z-20 text-foreground/50 hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
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
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {slides[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation hint */}
      <div className="flex items-center justify-center gap-3 py-3 text-foreground/60">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-xs font-body uppercase tracking-widest">Toque para navegar</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
};

export default WrappedStories;
