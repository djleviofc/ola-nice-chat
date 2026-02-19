import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { X } from "lucide-react";

interface BodaData {
  year: number;
  name: string;
  emoji: string;
  color: string;
  meaning: string;
}

const COUPLE_DATE = new Date("2022-07-22T00:00:00");

const ALL_BODAS: BodaData[] = [
  { year: 1, name: "Papel", emoji: "📜", color: "340 82% 55%", meaning: "Simboliza o início frágil e delicado do relacionamento, como uma folha em branco pronta para ser escrita a dois." },
  { year: 2, name: "Algodão", emoji: "🧶", color: "141 73% 42%", meaning: "Representa a flexibilidade e o conforto que o casal já conquistou juntos." },
  { year: 3, name: "Couro", emoji: "👜", color: "30 80% 50%", meaning: "Simboliza a resistência e a durabilidade que o amor começa a demonstrar." },
  { year: 4, name: "Flores", emoji: "🌸", color: "300 60% 55%", meaning: "Representa a beleza e a fragilidade do amor que precisa ser cuidado diariamente." },
  { year: 5, name: "Madeira", emoji: "🪵", color: "25 50% 40%", meaning: "Simboliza as raízes sólidas que o casal criou juntos." },
  { year: 6, name: "Açúcar", emoji: "🍬", color: "200 70% 55%", meaning: "Representa a doçura e os momentos felizes compartilhados." },
  { year: 7, name: "Lã", emoji: "🧣", color: "0 70% 50%", meaning: "Simboliza o aconchego e a proteção mútua do casal." },
  { year: 8, name: "Papoula", emoji: "🌺", color: "15 85% 55%", meaning: "Representa a fertilidade e a vida que floresce na relação." },
  { year: 9, name: "Cerâmica", emoji: "🏺", color: "45 60% 45%", meaning: "Simboliza a moldagem do relacionamento feita com paciência e carinho." },
  { year: 10, name: "Estanho", emoji: "🥈", color: "210 10% 60%", meaning: "Representa a maleabilidade e a capacidade de se adaptar juntos." },
  { year: 11, name: "Aço", emoji: "⚙️", color: "220 15% 50%", meaning: "Simboliza a força e a resistência do vínculo." },
  { year: 12, name: "Seda", emoji: "🎀", color: "330 70% 65%", meaning: "Representa a suavidade e a elegância da relação." },
  { year: 13, name: "Linho", emoji: "🧵", color: "80 30% 50%", meaning: "Simboliza a pureza e a leveza do amor." },
  { year: 14, name: "Marfim", emoji: "🦷", color: "40 30% 80%", meaning: "Representa a raridade e o valor do relacionamento." },
  { year: 15, name: "Cristal", emoji: "💎", color: "190 60% 60%", meaning: "Simboliza a transparência e a pureza do amor." },
  { year: 16, name: "Safira", emoji: "💙", color: "220 80% 50%", meaning: "Representa a lealdade e a sinceridade." },
  { year: 17, name: "Rosa", emoji: "🌹", color: "350 75% 55%", meaning: "Simboliza a paixão que permanece viva." },
  { year: 18, name: "Turquesa", emoji: "🧿", color: "175 60% 45%", meaning: "Representa a proteção e a sorte no amor." },
  { year: 19, name: "Cretone", emoji: "🎨", color: "280 50% 55%", meaning: "Simboliza a criatividade e a renovação." },
  { year: 20, name: "Porcelana", emoji: "🏛️", color: "210 30% 75%", meaning: "Representa a delicadeza e o refinamento da relação." },
  { year: 25, name: "Prata", emoji: "🪙", color: "0 0% 70%", meaning: "Simboliza a preciosidade e o brilho de 25 anos juntos." },
  { year: 30, name: "Pérola", emoji: "🫧", color: "30 20% 85%", meaning: "Representa a beleza construída com o tempo, camada por camada." },
  { year: 35, name: "Coral", emoji: "🪸", color: "10 70% 55%", meaning: "Simboliza a vida marinha profunda e a beleza orgânica do amor." },
  { year: 40, name: "Esmeralda", emoji: "💚", color: "145 70% 40%", meaning: "Representa a renovação, a esperança e a vitalidade." },
  { year: 45, name: "Rubi", emoji: "❤️‍🔥", color: "0 80% 45%", meaning: "Simboliza a paixão ardente que sobrevive décadas." },
  { year: 50, name: "Ouro", emoji: "🥇", color: "45 90% 50%", meaning: "Representa o mais alto valor e a realização suprema do amor." },
  { year: 55, name: "Ametista", emoji: "🔮", color: "270 60% 55%", meaning: "Simboliza a serenidade e a sabedoria adquirida juntos." },
  { year: 60, name: "Diamante", emoji: "💍", color: "195 50% 70%", meaning: "Representa a eternidade e a indestrutibilidade do amor." },
  { year: 65, name: "Platina", emoji: "✨", color: "210 15% 75%", meaning: "Simboliza a raridade extrema e o prestígio de uma vida juntos." },
  { year: 70, name: "Vinho", emoji: "🍷", color: "340 50% 35%", meaning: "Representa o amor que, como o vinho, melhora com o tempo." },
  { year: 75, name: "Brilhante", emoji: "💫", color: "50 80% 55%", meaning: "Simboliza o brilho inabalável de uma vida inteira de amor." },
  { year: 80, name: "Nogueira", emoji: "🌰", color: "25 40% 30%", meaning: "Representa a solidez e as raízes profundas do casal." },
  { year: 85, name: "Girassol", emoji: "🌻", color: "45 85% 50%", meaning: "Simboliza a alegria e a luz que o amor traz à vida." },
  { year: 90, name: "Álamo", emoji: "🌳", color: "120 40% 35%", meaning: "Representa a grandiosidade e a força da natureza." },
  { year: 95, name: "Sândalo", emoji: "🪵", color: "30 35% 40%", meaning: "Simboliza a fragrância duradoura e a memória eterna." },
  { year: 100, name: "Jequitibá", emoji: "🌿", color: "150 50% 30%", meaning: "Representa a árvore milenar — um amor que transcende gerações." },
];

const BodaCard = ({
  boda,
  completed,
  daysInfo,
  onOpenMeaning,
}: {
  boda: BodaData;
  completed: boolean;
  daysInfo: string;
  onOpenMeaning: () => void;
}) => {
  const ringColor = `hsl(${boda.color})`;
  const glowColor = `hsl(${boda.color} / 0.3)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3 min-w-[140px] sm:min-w-[160px]"
    >
      <span
        className="px-4 py-1 rounded-full text-xs font-body font-bold uppercase tracking-wider"
        style={{ backgroundColor: ringColor, color: "#fff" }}
      >
        {boda.year} Ano{boda.year > 1 ? "s" : ""}
      </span>

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

      <div className="text-center">
        {completed ? (
          <p className="text-foreground font-body font-bold text-xs">Completo</p>
        ) : (
          <p className="text-muted-foreground font-body text-xs">
            faltam <span style={{ color: ringColor }} className="font-semibold">{daysInfo}</span> dias
          </p>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenMeaning();
        }}
        className="px-3 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider border transition-colors"
        style={{
          borderColor: ringColor,
          color: ringColor,
        }}
      >
        significado
      </button>
    </motion.div>
  );
};

const MeaningModal = ({
  boda,
  onClose,
}: {
  boda: BodaData;
  onClose: () => void;
}) => {
  const ringColor = `hsl(${boda.color})`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-border relative"
        style={{ boxShadow: `0 0 40px hsl(${boda.color} / 0.2)` }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <span className="text-5xl">{boda.emoji}</span>
          <div>
            <span
              className="px-3 py-0.5 rounded-full text-xs font-body font-bold uppercase"
              style={{ backgroundColor: ringColor, color: "#fff" }}
            >
              {boda.year} Ano{boda.year > 1 ? "s" : ""}
            </span>
          </div>
          <h3 className="text-2xl font-body font-bold text-foreground">
            Bodas de {boda.name}
          </h3>
          <p className="text-foreground/70 font-body text-sm leading-relaxed">
            {boda.meaning}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BodasTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBoda, setSelectedBoda] = useState<BodaData | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ["40px", "0px"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const bodasWithStatus = useMemo(() => {
    const now = new Date();
    return ALL_BODAS.map((boda) => {
      const anniversary = new Date(COUPLE_DATE);
      anniversary.setFullYear(COUPLE_DATE.getFullYear() + boda.year);
      const diffMs = anniversary.getTime() - now.getTime();
      const completed = diffMs <= 0;
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { boda, completed, daysRemaining };
    });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden py-24">
      {/* Parallax background layer */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-20 -bottom-20 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
        {/* Decorative parallax circles */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full border border-primary/10 -left-40 top-10"
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0px", "-60px"]) }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full border border-accent/10 -right-20 bottom-20"
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0px", "-100px"]) }}
        />
      </motion.div>

      {/* Title with parallax */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="text-center mb-10 relative z-10"
      >
        <p className="text-sm text-foreground/60 font-body italic mb-1">nosso tempo em</p>
        <h2 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic">Bodas</h2>
      </motion.div>

      {/* Horizontal scroll cards with staggered parallax */}
      <div
        className="flex gap-6 overflow-x-auto pb-6 px-4 snap-x snap-mandatory relative z-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {bodasWithStatus.map(({ boda, completed, daysRemaining }, i) => (
          <motion.div
            key={boda.year}
            className="snap-center flex-shrink-0"
            style={{
              y: useTransform(
                scrollYProgress,
                [0, 0.5, 1],
                [`${30 + (i % 3) * 15}px`, "0px", `${-10 - (i % 3) * 10}px`]
              ),
            }}
          >
            <BodaCard
              boda={boda}
              completed={completed}
              daysInfo={daysRemaining > 0 ? daysRemaining.toLocaleString("pt-BR") : "0"}
              onOpenMeaning={() => setSelectedBoda(boda)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBoda && (
          <MeaningModal boda={selectedBoda} onClose={() => setSelectedBoda(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BodasTimeline;
