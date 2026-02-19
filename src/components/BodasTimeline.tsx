import { motion } from "framer-motion";
import { useRef } from "react";

interface Boda {
  year: number;
  name: string;
  emoji: string;
  color: string; // HSL
  completed: boolean;
  daysAgo?: number;
}

const BODAS: Boda[] = [
  { year: 1, name: "Papel", emoji: "📜", color: "340 82% 55%", completed: true, daysAgo: 211 },
  { year: 2, name: "Algodão", emoji: "🧶", color: "141 73% 42%", completed: true, daysAgo: 0 },
  { year: 3, name: "Couro", emoji: "👜", color: "30 80% 50%", completed: false },
  { year: 4, name: "Flores", emoji: "🌸", color: "300 60% 55%", completed: false },
  { year: 5, name: "Madeira", emoji: "🪵", color: "25 50% 40%", completed: false },
  { year: 6, name: "Açúcar", emoji: "🍬", color: "200 70% 55%", completed: false },
  { year: 7, name: "Lã", emoji: "🧣", color: "0 70% 50%", completed: false },
  { year: 8, name: "Papoula", emoji: "🌺", color: "15 85% 55%", completed: false },
  { year: 9, name: "Cerâmica", emoji: "🏺", color: "45 60% 45%", completed: false },
  { year: 10, name: "Estanho", emoji: "🥈", color: "210 10% 60%", completed: false },
];

const BodaCard = ({ boda }: { boda: Boda }) => {
  const ringColor = `hsl(${boda.color})`;
  const glowColor = `hsl(${boda.color} / 0.3)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3 min-w-[140px] sm:min-w-[160px]"
    >
      {/* Year badge */}
      <span
        className="px-4 py-1 rounded-full text-xs font-body font-bold uppercase tracking-wider"
        style={{ backgroundColor: ringColor, color: "#fff" }}
      >
        {boda.year} Ano{boda.year > 1 ? "s" : ""}
      </span>

      {/* Circle with emoji */}
      <div
        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center"
        style={{
          border: `3px solid ${ringColor}`,
          boxShadow: `0 0 25px ${glowColor}, 0 0 50px ${glowColor}`,
          backgroundColor: "hsl(var(--card))",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl sm:text-4xl">{boda.emoji}</span>
          <span className="text-foreground font-body font-semibold text-xs sm:text-sm">
            {boda.name}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        {boda.completed ? (
          <>
            <p className="text-foreground font-body font-bold text-xs">Completo</p>
            {boda.daysAgo !== undefined && boda.daysAgo > 0 && (
              <p className="font-body text-xs" style={{ color: ringColor }}>
                há {boda.daysAgo} dias
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground font-body text-xs">Em breve</p>
        )}
      </div>
    </motion.div>
  );
};

const BodasTimeline = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <p className="text-sm text-foreground/60 font-body italic mb-1">nosso tempo em</p>
        <h2 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic">Bodas</h2>
      </motion.div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 px-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {BODAS.map((boda) => (
          <div key={boda.year} className="snap-center flex-shrink-0">
            <BodaCard boda={boda} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BodasTimeline;
