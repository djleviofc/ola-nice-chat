import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const hearts = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 4 + Math.random() * 4,
  size: 10 + Math.random() * 14,
  opacity: 0.1 + Math.random() * 0.15,
}));

const FloatingHearts = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {hearts.map((h) => (
      <motion.div
        key={h.id}
        className="absolute"
        style={{ left: `${h.x}%`, bottom: -30 }}
        animate={{
          y: [0, -window.innerHeight - 100],
          x: [0, Math.sin(h.id) * 40],
          rotate: [0, 360],
        }}
        transition={{
          duration: h.duration,
          delay: h.delay,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Heart
          size={h.size}
          className="text-primary fill-primary"
          style={{ opacity: h.opacity }}
        />
      </motion.div>
    ))}
  </div>
);

export default FloatingHearts;
