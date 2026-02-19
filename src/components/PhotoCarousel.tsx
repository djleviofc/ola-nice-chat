import { useState } from "react";
import { motion } from "framer-motion";

interface PhotoCarouselProps {
  photos: { src: string; alt: string }[];
}

const PhotoCarousel = ({ photos }: PhotoCarouselProps) => {
  const [current, setCurrent] = useState(0);

  const getIndex = (offset: number) =>
    (current + offset + photos.length) % photos.length;

  const goTo = (index: number) => {
    if (index === current) return;
    setCurrent(index);
  };

  const prev = getIndex(-1);
  const next = getIndex(1);

  const cards = [
    { index: prev, position: "left" as const },
    { index: current, position: "center" as const },
    { index: next, position: "right" as const },
  ];

  const positionStyles = {
    left: {
      left: "0%",
      top: "50%",
      translateX: "0%",
      translateY: "-50%",
      rotateY: 25,
      scale: 0.8,
      opacity: 0.6,
      zIndex: 1,
      width: "40%",
    },
    center: {
      left: "50%",
      top: "50%",
      translateX: "-50%",
      translateY: "-50%",
      rotateY: 0,
      scale: 1,
      opacity: 1,
      zIndex: 10,
      width: "50%",
    },
    right: {
      right: "0%",
      left: "auto",
      top: "50%",
      translateX: "0%",
      translateY: "-50%",
      rotateY: -25,
      scale: 0.8,
      opacity: 0.6,
      zIndex: 1,
      width: "40%",
    },
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="relative w-full max-w-3xl mx-auto"
        style={{ perspective: "1200px", height: "clamp(300px, 50vw, 450px)" }}
      >
        {cards.map(({ index, position }) => {
          const styles = positionStyles[position];
          const isCenter = position === "center";

          return (
            <motion.div
              key={`${position}-${index}`}
              className={`absolute ${isCenter ? "" : "cursor-pointer"}`}
              style={{
                transformStyle: "preserve-3d",
                top: styles.top,
                zIndex: styles.zIndex,
                ...(position === "right"
                  ? { right: 0 }
                  : { left: styles.left }),
              }}
              animate={{
                rotateY: styles.rotateY,
                scale: styles.scale,
                opacity: styles.opacity,
                y: "-50%",
                ...(position === "center" ? { x: "-50%" } : {}),
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              onClick={isCenter ? undefined : () => goTo(index)}
            >
              <div
                className={`aspect-[9/14] overflow-hidden rounded-2xl shadow-2xl ${
                  isCenter ? "border-2 border-primary/40 glow-primary" : ""
                }`}
                style={{ width: styles.width === "50%" ? "clamp(180px, 25vw, 280px)" : "clamp(140px, 20vw, 220px)" }}
              >
                <img
                  src={photos[index].src}
                  alt={photos[index].alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          );
        })}
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
