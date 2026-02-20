import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoCarouselProps {
  photos: { src: string; alt: string }[];
  autoPlayInterval?: number;
}

const PhotoCarousel = ({ photos, autoPlayInterval = 4000 }: PhotoCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % photos.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [photos.length, autoPlayInterval]);

  const goTo = (index: number) => {
    if (index === current) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl border border-primary/20 glow-primary"
        style={{ width: "clamp(200px, 60vw, 320px)", aspectRatio: "9/14" }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={photos[current].src}
              alt={photos[current].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-6">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-primary" : "w-2 bg-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoCarousel;
