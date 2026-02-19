import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Heart } from "lucide-react";
import defaultCouplePhoto from "@/assets/couple-photo.jpg";

interface SpotifyPlayerProps {
  songName: string;
  artistName: string;
  coverPhoto?: string;
  musicUrl?: string;
  onPlayTriggered: () => void;
}

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

const SpotifyPlayer = ({ songName, artistName, coverPhoto, musicUrl, onPlayTriggered }: SpotifyPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const [ytReady, setYtReady] = useState(false);

  const youtubeId = musicUrl ? getYouTubeId(musicUrl) : null;

  // Load YouTube IFrame API if needed
  useEffect(() => {
    if (!youtubeId) return;
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, [youtubeId]);

  const initYtPlayer = useCallback(() => {
    if (!youtubeId || !ytReady || !ytContainerRef.current || ytPlayerRef.current) return;
    ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
      height: "1",
      width: "1",
      videoId: youtubeId,
      playerVars: { autoplay: 1, loop: 1, playlist: youtubeId, controls: 0 },
      events: {
        onReady: (e: any) => e.target.playVideo(),
      },
    });
  }, [youtubeId, ytReady]);

  const handlePlay = () => {
    if (hasTriggered) return;

    if (youtubeId) {
      initYtPlayer();
    } else if (musicUrl) {
      // Create and unlock Audio element synchronously within the user gesture context
      const audio = new Audio();
      audio.loop = true;
      audio.src = musicUrl;
      // Unlock for iOS/mobile: attempt play immediately (may fail, but unlocks element)
      audio.play().catch(() => {});
      audioRef.current = audio;
    }

    setIsPlaying(true);
    setHasTriggered(true);
    onPlayTriggered();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-sm mx-auto"
    >
      {/* Hidden YouTube player */}
      {youtubeId && <div ref={ytContainerRef} className="hidden" />}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 border border-border shadow-2xl">
        {/* Album art */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5">
          <img
            src={coverPhoto || defaultCouplePhoto}
            alt="Foto do casal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Song info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-foreground font-body font-semibold text-base truncate">
              {songName}
            </h3>
            <p className="text-muted-foreground font-body text-sm truncate">
              {artistName}
            </p>
          </div>
          <Heart className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={isPlaying ? { width: "100%" } : { width: "0%" }}
              transition={isPlaying ? { duration: 5, ease: "linear" } : {}}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground font-body">0:00</span>
            <span className="text-xs text-muted-foreground font-body">3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button className="text-foreground/50 hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Pause className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <button className="text-foreground/50 hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SpotifyPlayer;
