import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, X, ChevronDown } from "lucide-react";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";

interface TimelineEvent {
  month: string;
  year: string;
  title: string;
  description: string;
  photo?: string;
  rotation: number;
}

interface TimelineJourneyProps {
  onClose: () => void;
  onNext?: () => void;
  events?: Array<{ emoji: string; title: string; date: string; description: string; photo?: string }>;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  { month: "Mai", year: "2022", title: "Nossas almas se encontraram", description: "Enviei a primeira mensagem", photo: story1, rotation: -3 },
  { month: "Jun", year: "2022", title: "Primeiro encontro", description: "Nosso primeiro beijo", photo: story2, rotation: 4 },
  { month: "Ago", year: "2022", title: "Perdidamente apaixonado", description: "Eu já estava perdidamente apaixonado", rotation: -2 },
  { month: "Set", year: "2022", title: "Conheci sua família", description: "Conheci sua família pela primeira vez", photo: story3, rotation: 3 },
  { month: "Out", year: "2022", title: "Primeira viagem juntos", description: "Caldas Novas — nosso primeiro destino a dois", rotation: -4 },
  { month: "Nov", year: "2022", title: "Pedido de namoro", description: "A oficialização de algo único", rotation: 2 },
];

/* ── Stars background ── */
const StarsBackground = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5,
        delay: Math.random() * 3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-foreground"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
};

/* ── Polaroid photo frame ── */
const PolaroidFrame = ({
  photo,
  caption,
  rotation,
}: {
  photo: string;
  caption: string;
  rotation: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, rotate: rotation * 2 }}
    whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.6, type: "spring" }}
    className="bg-foreground p-2 pb-10 rounded-sm shadow-2xl relative mx-auto"
    style={{ maxWidth: 220 }}
  >
    <img
      src={photo}
      alt={caption}
      className="w-full aspect-square object-cover"
    />
    <p
      className="absolute bottom-2.5 left-0 right-0 text-center font-romantic text-sm"
      style={{ color: "hsl(var(--background))" }}
    >
      {caption}
    </p>
  </motion.div>
);

/* ── Single timeline event ── */
const TimelineItem = ({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) => {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative flex w-full mb-16"
    >
      {/* Center line dot */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center glow-primary">
          <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
        </div>
      </div>

      {/* Content - zigzag left/right */}
      <div
        className={`w-full flex ${
          isLeft ? "pr-[55%]" : "pl-[55%]"
        }`}
      >
        <div className={`w-full ${isLeft ? "text-right" : "text-left"}`}>
          {/* Date */}
          <p className="text-primary font-body font-bold text-xs uppercase tracking-[0.2em] mb-2 mt-1">
            {event.month} {event.year}
          </p>

          {/* Polaroid photo */}
          {event.photo && (
            <div className="mb-3">
              <PolaroidFrame
                photo={event.photo}
                caption={event.title}
                rotation={event.rotation}
              />
            </div>
          )}

          {/* Text */}
          <h3 className="text-foreground font-body font-bold text-base sm:text-lg leading-snug">
            {event.title}
          </h3>
          <p className="text-foreground/80 font-body text-sm mt-1 italic">
            {event.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Mobile single-column layout ── */
const TimelineItemMobile = ({
  event,
}: {
  event: TimelineEvent;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="relative pl-10 mb-14"
  >
    {/* Line dot */}
    <div className="absolute left-0 top-0 z-10">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center glow-primary">
        <Heart className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
      </div>
    </div>

    <p className="text-primary font-body font-bold text-xs uppercase tracking-[0.2em] mb-2">
      {event.month} {event.year}
    </p>

    {event.photo && (
      <div className="mb-3">
        <PolaroidFrame
          photo={event.photo}
          caption={event.title}
          rotation={event.rotation}
        />
      </div>
    )}

    <h3 className="text-foreground font-body font-bold text-base leading-snug">
      {event.title}
    </h3>
    <p className="text-foreground/80 font-body text-sm mt-1 italic">
      {event.description}
    </p>
  </motion.div>
);

/* ── Main component ── */
const TimelineJourney = ({ onClose, onNext, events: externalEvents }: TimelineJourneyProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rotations = [-3, 4, -2, 3, -4, 2, -3, 4, -2, 3];
  const EVENTS: TimelineEvent[] = useMemo(() => {
    if (externalEvents && externalEvents.length > 0) {
      return externalEvents.map((e, i) => {
        const parts = e.date.split(" ");
        return {
          month: parts[0] || "",
          year: parts[1] || "",
          title: e.title,
          description: e.description,
          photo: e.photo,
          rotation: rotations[i % rotations.length],
        };
      });
    }
    return DEFAULT_EVENTS;
  }, [externalEvents]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <StarsBackground />

      {/* Fixed header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/30">
        <h1 className="text-xl font-romantic text-gradient-romantic">Nossa Jornada</h1>
        <button
          onClick={onClose}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scroll content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative z-10"
      >
        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center py-10"
        >
          <Heart className="w-6 h-6 text-primary fill-primary mb-2" />
          <p className="text-foreground/80 font-body text-xs uppercase tracking-widest mb-2">
            Nossa história começa aqui
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4 text-foreground/30" />
          </motion.div>
        </motion.div>

        {/* Desktop zigzag timeline (hidden on mobile) */}
        <div className="relative max-w-lg mx-auto px-4 hidden sm:block">
          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent -translate-x-1/2" />

          {EVENTS.map((event, i) => (
            <TimelineItem key={i} event={event} index={i} />
          ))}
        </div>

        {/* Mobile single-column timeline */}
        <div className="relative max-w-sm mx-auto px-6 sm:hidden">
          {/* Left vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent ml-3.5" />

          {EVENTS.map((event, i) => (
            <TimelineItemMobile key={i} event={event} />
          ))}
        </div>

        {/* Ending section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center py-16 px-6"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-10 h-10 text-primary fill-primary mb-4" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-romantic text-gradient-romantic mb-6">
            E estamos apenas começando!
          </h2>

          <button
            onClick={onNext || onClose}
            className="px-8 py-3 rounded-full bg-card border border-border text-foreground font-body font-semibold text-sm hover:bg-secondary transition-colors"
          >
            Próxima Seção
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimelineJourney;
