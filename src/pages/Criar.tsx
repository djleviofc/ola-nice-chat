import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Upload, X, Sparkles, Loader2, ArrowLeft, ArrowRight,
  Music, Image as ImageIcon, Calendar, Mail, User, Type, FileText,
  Plus, Trash2, Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://qrflash.greensyst.com.br";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_PHOTOS = 10;
const MAX_MESSAGE_LENGTH = 10000;

const EMOJI_OPTIONS = ["💕", "💋", "🏠", "✈️", "💍", "🎓", "🎂", "🐾", "👶", "🎄", "🌅", "🎵", "📸", "🌟", "🎉", "❤️‍🔥"];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_url?: string; checkout_url?: string; transaction_id: string } | null>(null);

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
    } else if (s === 4) {
      if (!musicaUrl.trim()) errs.musica = "A música é obrigatória para a experiência dos Stories.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          amount: 2990, // R$ 29,90
          description: `Momentos de Amor - ${coupleData.titulo_pagina}`,
          customer: {
            name: coupleData.nome_cliente.trim(),
            email: coupleData.email.trim(),
          },
          metadata: {
            nome_cliente: coupleData.nome_cliente.trim(),
            nome_parceiro: coupleData.nome_parceiro.trim(),
            titulo: coupleData.titulo_pagina.trim(),
          },
        },
      });

      if (error) throw error;

      if (data?.success && data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data?.error || "Resposta inesperada da API");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({ title: "Erro ao gerar pagamento", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  if (pixData) {
    return (
      <div className="relative bg-background min-h-screen font-body flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-romantic text-foreground mb-2">Pagamento PIX</h2>
          <p className="text-sm text-muted-foreground mb-8">Escaneie o QR Code ou copie o código para pagar</p>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            {pixData.qr_code_url ? (
              <img src={pixData.qr_code_url} alt="QR Code PIX" className="w-48 h-48 mx-auto mb-4 rounded-lg" />
            ) : (
              <div className="w-48 h-48 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-xs">QR Code</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-3">Valor: <strong className="text-foreground">R$ 29,90</strong></p>
            <div className="relative">
              <input
                readOnly
                value={pixData.qr_code}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-xs text-foreground font-mono truncate pr-16"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixData.qr_code);
                  toast({ title: "Código PIX copiado! 📋" });
                }}
                className="absolute right-1 top-1 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>

          {pixData.checkout_url && (
            <a
              href={pixData.checkout_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors glow-primary mb-4"
            >
              Abrir página de pagamento
            </a>
          )}

          <button
            onClick={() => setPixData(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao formulário
          </button>

          <p className="mt-8 text-[10px] text-muted-foreground/50">
            ID: {pixData.transaction_id}
          </p>
        </motion.div>
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

                      {/* Photo assignment */}
                      {photos.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground font-body mb-1.5">Foto associada (opcional)</p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                              type="button"
                              onClick={() => updateJourney(j.id, "photoId", "")}
                              className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${!j.photoId ? "border-primary bg-primary/10" : "border-border"}`}
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {photos.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => updateJourney(j.id, "photoId", p.id)}
                                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${j.photoId === p.id ? "border-primary ring-2 ring-primary/50" : "border-border"}`}
                              >
                                <img src={p.url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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

            {/* ── Step 4: Music (required) ── */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6 text-center">
                  <Music className="w-10 h-10 text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Cole o link da música que é a cara de vocês. Pode ser do Spotify, YouTube ou qualquer plataforma.
                  </p>
                  <input
                    type="url"
                    value={musicaUrl}
                    onChange={(e) => setMusicaUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="form-input text-center"
                  />
                  {errors.musica && <p className="text-xs text-destructive mt-2">{errors.musica}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Obrigatório — a música toca ao iniciar os Stories</p>
                </div>

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
                    <SummaryRow label="Música" value={musicaUrl ? "✓ Adicionada" : "Sem música"} />
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
          {isLastStep ? "Ao continuar, você será redirecionado para o pagamento seguro via PIX." : `Etapa ${step + 1} de ${STEPS.length}`}
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
