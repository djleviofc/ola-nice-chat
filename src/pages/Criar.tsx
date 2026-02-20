import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Upload, X, Sparkles, Loader2, ArrowLeft, ArrowRight,
  Music, Image as ImageIcon, Calendar, Mail, User, Type, FileText,
  Plus, Trash2, Check, Search
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CheckoutTransparente from "@/components/CheckoutTransparente";

const API_BASE = "https://qrflash.greensyst.com.br";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_PHOTOS = 10;
const MAX_MESSAGE_LENGTH = 10000;

const EMOJI_OPTIONS = ["💕", "💋", "🏠", "✈️", "💍", "🎓", "🎂", "🐾", "👶", "🎄", "🌅", "🎵", "📸", "🌟", "🎉", "❤️‍🔥"];

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  collectionName: string;
}

interface PhotoPreview {
  id: string;
  file: File;
  url: string;
}

interface JourneyEvent {
  id: string;
  emoji: string;
  month: string;
  year: string;
  title: string;
  description: string;
  date: string;
  photoId?: string;
}

const STEPS = [
  { label: "Casal", icon: Heart },
  { label: "Fotos", icon: ImageIcon },
  { label: "Mensagem", icon: FileText },
  { label: "Jornada", icon: Calendar },
  { label: "Música", icon: Music },
];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const uid = () => Math.random().toString(36).slice(2, 9);

/* ── Reusable field ── */
const Field = ({ label, icon: Icon, error, children, hint }: { label: string; icon?: any; error?: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-body font-semibold text-foreground">
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ── Step indicator ── */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center gap-1.5 w-full px-2">
    {STEPS.map((step, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      return (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full h-1 rounded-full overflow-hidden bg-border">
            <motion.div
              className={done || active ? "h-full bg-primary rounded-full" : "h-full"}
              initial={false}
              animate={{ width: done ? "100%" : active ? "50%" : "0%" }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <step.icon className={`w-3 h-3 ${active ? "text-primary" : done ? "text-primary/60" : "text-muted-foreground/40"}`} />
            <span className={`text-[10px] font-body ${active ? "text-primary font-semibold" : done ? "text-foreground/60" : "text-muted-foreground/40"}`}>
              {step.label}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

/* ══════════════════════════════════════════════════ */
/*                    MAIN COMPONENT                 */
/* ══════════════════════════════════════════════════ */
const Criar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);


  // Step 1: Couple info
  const [coupleData, setCoupleData] = useState({
    nome_cliente: "",
    nome_parceiro: "",
    email: "",
    titulo_pagina: "",
    data_especial: "",
  });

  // Step 2: Photos
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);

  // Step 3: Message
  const [mensagem, setMensagem] = useState("");

  // Step 4: Journey events (unified milestones + journey)
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([
    { id: uid(), emoji: "💕", month: "Jan", year: "2022", title: "", description: "", date: "" },
  ]);

  // Step 5: Music
  const [musicaUrl, setMusicaUrl] = useState("");
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState<ItunesTrack[]>([]);
  const [musicSearching, setMusicSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<ItunesTrack | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const searchMusic = async (q: string) => {
    if (!q.trim()) return;
    setMusicSearching(true);
    setMusicResults([]);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=12&country=BR`
      );
      const data = await res.json();
      const tracks = (data.results || []).filter((t: ItunesTrack) => t.previewUrl);
      setMusicResults(tracks);
    } catch {
      toast({ title: "Erro na busca", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setMusicSearching(false);
    }
  };

  const togglePreview = (track: ItunesTrack) => {
    if (playingId === track.trackId) {
      previewAudio?.pause();
      setPlayingId(null);
      setPreviewAudio(null);
      return;
    }
    previewAudio?.pause();
    const audio = new Audio(track.previewUrl);
    audio.loop = false;
    audio.play().catch(() => {});
    audio.onended = () => { setPlayingId(null); setPreviewAudio(null); };
    setPreviewAudio(audio);
    setPlayingId(track.trackId);
  };

  const selectTrack = (track: ItunesTrack) => {
    previewAudio?.pause();
    setPlayingId(null);
    setPreviewAudio(null);
    setSelectedTrack(track);
    setMusicaUrl(track.previewUrl);
    clearError("musica");
  };

  const updateCouple = (field: string, value: string) => {
    setCoupleData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  /* ── Photo handling ── */
  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: PhotoPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      if (photos.length + newPhotos.length >= MAX_PHOTOS) {
        toast({ title: "Limite atingido", description: `Máximo ${MAX_PHOTOS} fotos.`, variant: "destructive" });
        break;
      }
      const file = files[i];
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Formato inválido", description: `${file.name}: Use JPG, PNG, GIF ou WebP.`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "Arquivo grande", description: `${file.name}: Máximo 5MB.`, variant: "destructive" });
        continue;
      }
      newPhotos.push({ id: uid(), file, url: URL.createObjectURL(file) });
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    clearError("fotos");
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  /* ── AI Message ── */
  const generateMessage = async () => {
    if (!coupleData.nome_cliente.trim()) {
      toast({ title: "Preencha seu nome primeiro", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-love-message", {
        body: {
          myName: coupleData.nome_cliente,
          partnerName: coupleData.nome_parceiro || "Amor",
          dataEspecial: coupleData.data_especial || "",
        },
      });
      if (error) throw error;
      if (data?.message) {
        setMensagem(data.message);
        toast({ title: "Mensagem gerada! ✨" });
      } else {
        throw new Error("Sem mensagem");
      }
    } catch {
      toast({ title: "Erro ao gerar mensagem", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Journey ── */
  const addJourney = () => setJourneyEvents((prev) => [...prev, { id: uid(), emoji: "💕", month: "Jan", year: "2022", title: "", description: "", date: "" }]);
  const removeJourney = (id: string) => setJourneyEvents((prev) => prev.filter((j) => j.id !== id));
  const updateJourney = (id: string, field: string, value: string) =>
    setJourneyEvents((prev) => prev.map((j) => (j.id === id ? { ...j, [field]: value } : j)));

  /* ── Validation per step ── */
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!coupleData.nome_cliente.trim()) errs.nome_cliente = "Informe seu nome.";
      if (!coupleData.nome_parceiro.trim()) errs.nome_parceiro = "Informe o nome do parceiro(a).";
      if (!coupleData.email.trim()) errs.email = "Informe seu e-mail.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupleData.email)) errs.email = "E-mail inválido.";
      if (!coupleData.titulo_pagina.trim()) errs.titulo_pagina = "Dê um título à página.";
      if (!coupleData.data_especial) errs.data_especial = "Escolha uma data especial.";
    } else if (s === 1) {
      if (photos.length < 1) errs.fotos = "Adicione pelo menos 1 foto.";
    } else if (s === 2) {
      if (!mensagem.trim()) errs.mensagem = "Escreva uma mensagem de amor.";
      if (mensagem.length > MAX_MESSAGE_LENGTH) errs.mensagem = `Máximo ${MAX_MESSAGE_LENGTH} caracteres.`;
    } else if (s === 3) {
      const valid = journeyEvents.filter((j) => j.title.trim());
      if (valid.length === 0) errs.journey = "Adicione pelo menos 1 evento.";
      const missingPhoto = valid.find((j) => !j.photoId);
      if (missingPhoto) errs.journey = `O momento "${missingPhoto.title}" precisa de uma foto associada.`;
    } else if (s === 4) {
      if (!musicaUrl.trim()) errs.musica = "Pesquise e escolha a música do casal para continuar.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  /* ── Submit: save order then show transparent checkout ── */
  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    try {
      // Generate ID and slug on the frontend to avoid needing to SELECT after INSERT
      const orderId = crypto.randomUUID();
      const slug = `${coupleData.titulo_pagina.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

      // Upload photos
      const photoUrls: string[] = [];
      const photoIdToUrl: Record<string, string> = {};
      for (const photo of photos) {
        const ext = photo.file.name.split('.').pop() || 'jpg';
        const filePath = `${slug}/${photo.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('couple-photos')
          .upload(filePath, photo.file, { contentType: photo.file.type });
        if (uploadError) {
          console.error("Upload error:", JSON.stringify(uploadError));
          throw new Error(`Erro no upload da foto: ${uploadError.message}`);
        }
        const { data: urlData } = supabase.storage.from('couple-photos').getPublicUrl(filePath);
        photoUrls.push(urlData.publicUrl);
        photoIdToUrl[photo.id] = urlData.publicUrl;
      }

      // Insert order with pre-generated ID (page_active = false until payment)
      // Do NOT use .select() after insert — SELECT policy only returns page_active=true rows
      const { error: insertError } = await supabase.from("orders").insert({
        id: orderId,
        slug,
        nome_cliente: coupleData.nome_cliente.trim(),
        nome_parceiro: coupleData.nome_parceiro.trim(),
        email: coupleData.email.trim(),
        titulo_pagina: coupleData.titulo_pagina.trim(),
        data_especial: coupleData.data_especial || null,
        mensagem: mensagem.trim(),
        musica_url: musicaUrl.trim(),
        fotos: photoUrls.map((url, i) => ({ url, alt: `Foto ${i + 1}` })),
        journey_events: journeyEvents.filter(j => j.title.trim()).map(j => ({
          emoji: j.emoji,
          title: j.title,
          date: `${j.month} ${j.year}`,
          description: j.description,
          photo: j.photoId ? photoIdToUrl[j.photoId] : undefined,
        })),
        amount: 1499,
      } as any);

      if (insertError) throw insertError;

      setSavedOrderId(orderId);
      setSavedSlug(slug);
      setShowCheckout(true);
    } catch (err: any) {
      console.error("Submit error:", err);
      const detail = err?.message || err?.error_description || JSON.stringify(err);
      toast({ title: "Erro ao salvar pedido", description: detail || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  if (showCheckout && savedOrderId) {
    return (
      <div className="relative bg-background min-h-screen font-body">
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="font-romantic text-lg text-foreground">Momentos de Amor</span>
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-8">
          <CheckoutTransparente
            orderId={savedOrderId}
            amount={1499}
            description={`Momentos de Amor - ${coupleData.titulo_pagina}`}
            customerName={coupleData.nome_cliente}
            customerEmail={coupleData.email}
            onSuccess={() => navigate("/pagamento-sucesso")}
            onBack={() => setShowCheckout(false)}
          />
        </div>
      </div>
    );
  }




  return (
    <div className="relative bg-background min-h-screen font-body">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="font-romantic text-lg text-foreground">Momentos de Amor</span>
          </div>
          <div className="w-16" />
        </div>
        <div className="px-4 pb-3">
          <StepIndicator currentStep={step} totalSteps={STEPS.length} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
              >
                {(() => { const Icon = STEPS[step].icon; return <Icon className="w-6 h-6 text-primary" />; })()}
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-romantic text-gradient-romantic">
                {step === 0 && "Dados do Casal"}
                {step === 1 && "Suas Fotos"}
                {step === 2 && "Mensagem de Amor"}
                {step === 3 && "Nossa Jornada"}
                {step === 4 && "Música do Casal"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {step === 0 && "Informações básicas sobre vocês"}
                {step === 1 && "As fotos que contam a história de vocês"}
                {step === 2 && "Escreva algo especial para quem você ama"}
                {step === 3 && "Marcos e linha do tempo da história de vocês"}
                {step === 4 && "A trilha sonora do amor de vocês (obrigatória)"}
              </p>
            </div>

            {/* ── Step 0: Couple Info ── */}
            {step === 0 && (
              <div className="space-y-5">
                <Field label="Seu nome" icon={User} error={errors.nome_cliente}>
                  <input type="text" value={coupleData.nome_cliente} onChange={(e) => updateCouple("nome_cliente", e.target.value)} placeholder="Ex: João" maxLength={100} className="form-input" />
                </Field>
                <Field label="Nome do(a) parceiro(a)" icon={User} error={errors.nome_parceiro}>
                  <input type="text" value={coupleData.nome_parceiro} onChange={(e) => updateCouple("nome_parceiro", e.target.value)} placeholder="Ex: Maria" maxLength={100} className="form-input" />
                </Field>
                <Field label="Seu e-mail" icon={Mail} error={errors.email}>
                  <input type="email" value={coupleData.email} onChange={(e) => updateCouple("email", e.target.value)} placeholder="joao@email.com" maxLength={255} className="form-input" />
                </Field>
                <Field label="Título da página" icon={Type} error={errors.titulo_pagina}>
                  <input type="text" value={coupleData.titulo_pagina} onChange={(e) => updateCouple("titulo_pagina", e.target.value)} placeholder="Ex: Nosso Amor" maxLength={100} className="form-input" />
                </Field>
                <Field label="Data especial" icon={Calendar} error={errors.data_especial} hint="Quando o relacionamento começou?">
                  <input type="date" value={coupleData.data_especial} onChange={(e) => updateCouple("data_especial", e.target.value)} className="form-input" />
                </Field>
              </div>
            )}

            {/* ── Step 1: Photos ── */}
            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  Adicione as fotos que aparecerão no carrossel 3D e na linha do tempo. Mínimo 1, máximo {MAX_PHOTOS}.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {photos.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                    >
                      <img src={p.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removePhoto(p.id)} className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                          <X className="w-4 h-4 text-destructive-foreground" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 bg-background/70 text-foreground text-[10px] font-body px-1.5 py-0.5 rounded-md">
                        #{i + 1}
                      </span>
                    </motion.div>
                  ))}

                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 flex flex-col items-center justify-center gap-2 transition-colors bg-primary/5 hover:bg-primary/10"
                    >
                      <Upload className="w-6 h-6 text-primary/60" />
                      <span className="text-xs text-primary/60 font-body font-semibold">Adicionar</span>
                    </button>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(",")} multiple onChange={handlePhotoAdd} className="hidden" />
                {errors.fotos && <p className="text-xs text-destructive text-center">{errors.fotos}</p>}
                <p className="text-xs text-muted-foreground text-center">JPG, PNG, GIF ou WebP · Máx. 5MB cada</p>
              </div>
            )}

            {/* ── Step 2: Message ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-5">
                  <textarea
                    value={mensagem}
                    onChange={(e) => { setMensagem(e.target.value); clearError("mensagem"); }}
                    placeholder="Escreva aqui sua mensagem de amor... Conte o que essa pessoa significa para você, relembre momentos especiais, diga o que sente..."
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={8}
                    className="form-input resize-none bg-transparent border-none focus:ring-0 p-0 text-base leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={generateMessage}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl transition-colors font-body font-semibold text-sm disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? "Gerando..." : "Estou sem ideia ✨"}
                  </button>
                  <span className="text-xs text-muted-foreground font-body">{mensagem.length.toLocaleString()}/{MAX_MESSAGE_LENGTH.toLocaleString()}</span>
                </div>
                {errors.mensagem && <p className="text-xs text-destructive">{errors.mensagem}</p>}
              </div>
            )}

            {/* ── Step 3: Journey (unified) ── */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  Adicione os momentos marcantes do relacionamento. Eles aparecerão nos Stories e na linha do tempo.
                </p>

                <div className="space-y-4">
                  {journeyEvents.map((j, i) => (
                    <motion.div
                      key={j.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-body font-semibold uppercase tracking-wider">Momento #{i + 1}</span>
                        {journeyEvents.length > 1 && (
                          <button type="button" onClick={() => removeJourney(j.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Emoji selector */}
                      <div>
                        <p className="text-xs text-muted-foreground font-body mb-1.5">Emoji (para os Stories)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => updateJourney(j.id, "emoji", emoji)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${j.emoji === emoji ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-card hover:bg-secondary"}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={j.title}
                        onChange={(e) => updateJourney(j.id, "title", e.target.value)}
                        placeholder="Ex: Primeiro beijo"
                        maxLength={100}
                        className="form-input"
                      />

                      <input
                        type="text"
                        value={j.date}
                        onChange={(e) => updateJourney(j.id, "date", e.target.value)}
                        placeholder="Ex: 25 de julho de 2022 (para os Stories)"
                        maxLength={50}
                        className="form-input"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-body mb-1">Mês (timeline)</p>
                          <select
                            value={j.month}
                            onChange={(e) => updateJourney(j.id, "month", e.target.value)}
                            className="form-input"
                          >
                            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-body mb-1">Ano (timeline)</p>
                          <input
                            type="text"
                            value={j.year}
                            onChange={(e) => updateJourney(j.id, "year", e.target.value)}
                            placeholder="2022"
                            maxLength={4}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        value={j.description}
                        onChange={(e) => updateJourney(j.id, "description", e.target.value)}
                        placeholder="Descrição breve (opcional)"
                        maxLength={200}
                        className="form-input"
                      />

                      {/* Photo assignment — obrigatório */}
                      <div className={`rounded-xl p-3 border-2 transition-colors ${!j.photoId ? "border-destructive/40 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
                        <p className="text-xs font-body font-semibold mb-2 flex items-center gap-1.5">
                          <span className="text-destructive">★</span>
                          <span className="text-foreground">Foto do momento</span>
                          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${!j.photoId ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                            {!j.photoId ? "OBRIGATÓRIO" : "✓ OK"}
                          </span>
                        </p>

                        {photos.length === 0 ? (
                          <div className="rounded-xl border-2 border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            Adicione fotos na etapa anterior para selecionar aqui.
                          </div>
                        ) : (
                          <>
                            {/* Large preview of selected photo */}
                            {j.photoId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative mb-3 rounded-2xl overflow-hidden border-2 border-primary glow-primary"
                                style={{ aspectRatio: "16/9" }}
                              >
                                <img
                                  src={photos.find((p) => p.id === j.photoId)?.url}
                                  alt="Foto selecionada"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] font-body font-bold px-2 py-0.5 rounded-full">
                                  Selecionada
                                </div>
                                <button
                                  type="button"
                                  onClick={() => updateJourney(j.id, "photoId", "")}
                                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            )}

                            {/* Thumbnail selector */}
                            <div className="grid grid-cols-4 gap-2">
                              {photos.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => updateJourney(j.id, "photoId", p.id)}
                                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                    j.photoId === p.id
                                      ? "border-primary ring-2 ring-primary/50 scale-95"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                                  {j.photoId === p.id && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-primary" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addJourney}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 text-primary font-body font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Adicionar momento
                </button>
                {errors.journey && <p className="text-xs text-destructive text-center">{errors.journey}</p>}
              </div>
            )}

            {/* ── Step 4: Music ── */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Selected track card */}
                {selectedTrack ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center gap-4"
                  >
                    <img src={selectedTrack.artworkUrl100} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-semibold text-sm truncate">{selectedTrack.trackName}</p>
                      <p className="text-muted-foreground text-xs truncate">{selectedTrack.artistName}</p>
                      <p className="text-primary text-xs mt-1">✓ Música selecionada</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedTrack(null); setMusicaUrl(""); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Music className="w-8 h-8 text-primary flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Pesquise o nome da música ou artista para encontrar a canção de vocês.
                      </p>
                    </div>

                    {/* Search input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={musicQuery}
                        onChange={(e) => setMusicQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchMusic(musicQuery)}
                        placeholder="Ex: Perfect Ed Sheeran, Evidências..."
                        className="form-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => searchMusic(musicQuery)}
                        disabled={musicSearching || !musicQuery.trim()}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm flex items-center gap-2 disabled:opacity-50 transition-colors hover:bg-primary/90"
                      >
                        {musicSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Results */}
                {musicResults.length > 0 && !selectedTrack && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-body px-1">{musicResults.length} músicas encontradas — toque ▶ para ouvir 30s</p>
                    {musicResults.map((track) => (
                      <motion.div
                        key={track.trackId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition-colors"
                      >
                        <img src={track.artworkUrl100} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-semibold text-sm truncate">{track.trackName}</p>
                          <p className="text-muted-foreground text-xs truncate">{track.artistName}</p>
                        </div>
                        {/* Preview button */}
                        <button
                          type="button"
                          onClick={() => togglePreview(track)}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-primary hover:border-primary transition-colors flex-shrink-0"
                        >
                          {playingId === track.trackId ? (
                            <span className="text-base leading-none">⏸</span>
                          ) : (
                            <span className="text-base leading-none">▶</span>
                          )}
                        </button>
                        {/* Select button */}
                        <button
                          type="button"
                          onClick={() => selectTrack(track)}
                          className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-body font-bold text-xs flex-shrink-0 hover:bg-primary/90 transition-colors"
                        >
                          Escolher
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {errors.musica && <p className="text-xs text-destructive text-center">{errors.musica}</p>}

                {/* Summary */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-body font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Resumo do pedido
                  </h3>
                  <div className="space-y-2 text-sm font-body">
                    <SummaryRow label="Casal" value={`${coupleData.nome_cliente} & ${coupleData.nome_parceiro}`} />
                    <SummaryRow label="Título" value={coupleData.titulo_pagina} />
                    <SummaryRow label="Data especial" value={coupleData.data_especial} />
                    <SummaryRow label="Fotos" value={`${photos.length} foto${photos.length !== 1 ? "s" : ""}`} />
                    <SummaryRow label="Mensagem" value={`${mensagem.length} caracteres`} />
                    <SummaryRow label="Momentos" value={`${journeyEvents.filter((j) => j.title.trim()).length} momento${journeyEvents.filter((j) => j.title.trim()).length !== 1 ? "s" : ""}`} />
                    <SummaryRow label="Música" value={selectedTrack ? `${selectedTrack.trackName} — ${selectedTrack.artistName}` : "Não selecionada"} />
                    <div className="flex items-center justify-between pt-2 mt-1">
                      <span className="font-body font-bold text-foreground text-sm">Total</span>
                      <span className="font-body font-bold text-primary text-base">R$ 14,99</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-10 mb-6">
          {step > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-3.5 rounded-full border border-border text-foreground font-body font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}

          {!isLastStep ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-sm flex items-center justify-center gap-2 transition-colors glow-primary"
            >
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-sm flex items-center justify-center gap-2 transition-colors glow-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Criando...</>
              ) : (
                <><Heart className="w-5 h-5 fill-primary-foreground" /> Criar minha página</>
              )}
            </motion.button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground pb-8">
          {isLastStep ? "Ao continuar, você escolherá pagar via PIX ou cartão de crédito." : `Etapa ${step + 1} de ${STEPS.length}`}
        </p>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-semibold text-right max-w-[60%] truncate">{value}</span>
  </div>
);

export default Criar;
