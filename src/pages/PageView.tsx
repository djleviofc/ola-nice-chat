import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, Loader2 } from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";
import PhotoCarousel from "@/components/PhotoCarousel";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import WrappedStories from "@/components/WrappedStories";
import TimelineJourney from "@/components/TimelineJourney";
import BodasTimeline from "@/components/BodasTimeline";

interface PageData {
  nome_cliente: string;
  nome_parceiro: string;
  titulo_pagina: string;
  data_especial: string;
  mensagem: string;
  musica_url: string;
  fotos: Array<{ url: string; alt?: string }>;
  journey_events: Array<{ emoji: string; title: string; date: string; description: string }>;
}

type StoryPhase = "none" | "wrapped" | "timeline";

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [storyPhase, setStoryPhase] = useState<StoryPhase>("none");
  const [hasSeenTimeline, setHasSeenTimeline] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("nome_cliente, nome_parceiro, titulo_pagina, data_especial, mensagem, musica_url, fotos, journey_events")
        .eq("slug", slug)
        .eq("page_active", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPage(data as unknown as PageData);
      }
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <Heart className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-romantic text-foreground mb-2">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">Esta página ainda não foi ativada ou não existe.</p>
      </div>
    );
  }

  const coupleNames = `${page.nome_cliente} & ${page.nome_parceiro}`;
  const coupleDate = page.data_especial ? new Date(page.data_especial + "T00:00:00") : new Date();
  const photos = (page.fotos || []).map((f, i) => ({
    src: typeof f === "string" ? f : f.url,
    alt: typeof f === "string" ? `Foto ${i + 1}` : (f.alt || `Foto ${i + 1}`),
  }));

  const handlePlayTriggered = () => {
    setTimeout(() => setStoryPhase("wrapped"), 5000);
  };

  return (
    <div className="relative bg-background min-h-screen">
      <FloatingHearts />

      <AnimatePresence>
        {storyPhase === "wrapped" && (
          <WrappedStories
            coupleNames={coupleNames}
            coupleDate={coupleDate}
            onClose={() => setStoryPhase("timeline")}
          />
        )}
        {storyPhase === "timeline" && (
          <TimelineJourney
            onClose={() => { setStoryPhase("none"); setHasSeenTimeline(true); }}
            onNext={() => { setStoryPhase("none"); setHasSeenTimeline(true); }}
            events={page.journey_events}
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.8 }} className="mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-romantic flex items-center justify-center glow-primary">
            <Heart className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
          className="text-6xl sm:text-8xl font-romantic text-gradient-romantic leading-tight text-center"
        >
          {page.titulo_pagina}
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-12 animate-bounce text-foreground/50">
          <span className="text-xs font-body uppercase tracking-widest">Deslize para baixo</span>
        </motion.div>
      </section>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="relative py-20 px-4 flex flex-col items-center">
          <PhotoCarousel photos={photos} />
        </section>
      )}

      {/* Music */}
      {page.musica_url && (
        <section className="relative py-24 px-4 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <Music className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic">Nossa Música</h2>
          </motion.div>
          <SpotifyPlayer songName="Nossa Música" artistName={coupleNames} coverPhoto={photos.length > 0 ? photos[0].src : undefined} onPlayTriggered={handlePlayTriggered} />
          {hasSeenTimeline && storyPhase === "none" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 animate-bounce text-foreground/50">
              <span className="text-xs font-body uppercase tracking-widest">Deslize para baixo</span>
            </motion.div>
          )}
        </section>
      )}

      {/* Names */}
      <section className="relative py-24 px-4 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8 }} className="text-center">
          <h2 className="text-5xl sm:text-7xl font-romantic text-gradient-romantic">{coupleNames}</h2>
          {page.data_especial && (
            <p className="text-sm text-foreground/60 font-body mt-3 tracking-widest uppercase">
              {new Date(page.data_especial + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Bodas */}
      <section className="relative py-24 px-4 flex flex-col items-center">
        <BodasTimeline />
      </section>

      {/* Message */}
      {page.mensagem && (
        <section className="relative py-24 px-4 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8 }} className="max-w-lg text-center">
            <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-6" />
            <div className="bg-card/40 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-border glow-primary">
              <p className="text-foreground/90 font-body text-base sm:text-lg leading-relaxed italic">
                "{page.mensagem}"
              </p>
            </div>
            <p className="mt-16 text-xs text-foreground/30 font-body">
              Feito com <Heart className="w-3 h-3 inline text-primary fill-primary" /> Momentos de Amor
            </p>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default PageView;
