import { useState } from "react";
import { motion } from "framer-motion";

interface PhotoCarouselProps {
  photos: { src: string; alt: string }[];
}

const PhotoCarousel = ({ photos }: PhotoCarouselProps) => {
  const [current, setCurrent] = useState(0);

  const getIndex = (offset: number) =>
    (current + offset + photos.length) % photos.length;

  const prev = getIndex(-1);
  const next = getIndex(1);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="relative w-full max-w-4xl mx-auto flex items-center justify-center gap-4 sm:gap-8 px-4"
        style={{ perspective: "1200px" }}
      >
        {/* Left card */}
        <motion.div
          key={`left-${prev}`}
          className="flex-shrink-0 cursor-pointer"
          animate={{ rotateY: 30, scale: 0.85, opacity: 0.6 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onClick={() => setCurrent(prev)}
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src={photos[prev].src}
            alt={photos[prev].alt}
            className="w-[160px] sm:w-[220px] h-[240px] sm:h-[340px] object-cover rounded-2xl shadow-2xl"
          />
        </motion.div>

        {/* Center card */}
        <motion.div
          key={`center-${current}`}
          className="flex-shrink-0 z-10"
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="w-[200px] sm:w-[280px] h-[300px] sm:h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/40 glow-primary">
            <img
              src={photos[current].src}
              alt={photos[current].alt}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Right card */}
        <motion.div
          key={`right-${next}`}
          className="flex-shrink-0 cursor-pointer"
          animate={{ rotateY: -30, scale: 0.85, opacity: 0.6 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onClick={() => setCurrent(next)}
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src={photos[next].src}
            alt={photos[next].alt}
            className="w-[160px] sm:w-[220px] h-[240px] sm:h-[340px] object-cover rounded-2xl shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
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
