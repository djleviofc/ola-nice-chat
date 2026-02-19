import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoCarouselProps {
  photos: { src: string; alt: string }[];
}

const PhotoCarousel = ({ photos }: PhotoCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + photos.length) % photos.length);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, scale: 0.9 }),
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Photo container - stories aspect ratio */}
      <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-primary/30 glow-primary">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={current}
            src={photos[current].src}
            alt={photos[current].alt}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={() => paginate(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground/80 hover:bg-background/70 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground/80 hover:bg-background/70 transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousel;
