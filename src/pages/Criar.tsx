import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Upload, X, Sparkles, Loader2, ArrowLeft, Music, Image as ImageIcon, Calendar, Mail, User, Type, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://qrflash.greensyst.com.br";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_PHOTOS = 5;
const MAX_MESSAGE_LENGTH = 10000;

interface PhotoPreview {
  file: File;
  url: string;
}

const Criar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome_cliente: "",
    email: "",
    titulo_pagina: "",
    mensagem: "",
    data_especial: "",
    musica_url: "",
  });

  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      if (photos.length + newPhotos.length >= MAX_PHOTOS) {
        toast({ title: "Limite atingido", description: `Máximo de ${MAX_PHOTOS} fotos.`, variant: "destructive" });
        break;
      }
      const file = files[i];
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Formato inválido", description: `${file.name}: Use JPG, PNG, GIF ou WebP.`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "Arquivo grande demais", description: `${file.name}: Máximo 5MB por foto.`, variant: "destructive" });
        continue;
      }
      newPhotos.push({ file, url: URL.createObjectURL(file) });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const generateMessage = async () => {
    if (!formData.nome_cliente.trim()) {
      toast({ title: "Preencha seu nome", description: "Precisamos do seu nome para gerar a mensagem.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-message.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myName: formData.nome_cliente,
          partnerName: formData.titulo_pagina || "Amor",
          dataEspecial: formData.data_especial || "",
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar mensagem");
      const data = await res.json();
      if (data.message || data.mensagem) {
        updateField("mensagem", data.message || data.mensagem);
        toast({ title: "Mensagem gerada! ✨", description: "Você pode editar a mensagem como quiser." });
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar a mensagem. Tente novamente.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.nome_cliente.trim()) errs.nome_cliente = "Informe seu nome.";
    if (!formData.email.trim()) errs.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "E-mail inválido.";
    if (!formData.titulo_pagina.trim()) errs.titulo_pagina = "Dê um título à página.";
    if (!formData.mensagem.trim()) errs.mensagem = "Escreva uma mensagem.";
    if (formData.mensagem.length > MAX_MESSAGE_LENGTH) errs.mensagem = `Máximo ${MAX_MESSAGE_LENGTH} caracteres.`;
    if (!formData.data_especial) errs.data_especial = "Escolha uma data especial.";
    if (photos.length === 0) errs.fotos = "Adicione pelo menos 1 foto.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("nome_cliente", formData.nome_cliente.trim());
      fd.append("email", formData.email.trim());
      fd.append("titulo_pagina", formData.titulo_pagina.trim());
      fd.append("mensagem", formData.mensagem.trim());
      fd.append("data_especial", formData.data_especial);
      if (formData.musica_url.trim()) fd.append("musica_url", formData.musica_url.trim());
      photos.forEach((p) => fd.append("fotos[]", p.file));

      const res = await fetch(`${API_BASE}/api/create-order.php`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Erro ao criar pedido");
      const data = await res.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.order_id) {
        // Redirect to checkout
        const checkoutRes = await fetch(`${API_BASE}/api/checkout/index.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: data.order_id }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.checkout_url || checkoutData.init_point) {
          window.location.href = checkoutData.checkout_url || checkoutData.init_point;
        }
      } else {
        toast({ title: "Pedido criado!", description: "Redirecionando para pagamento..." });
      }
    } catch {
      toast({ title: "Erro ao criar pedido", description: "Tente novamente. Se o problema persistir, entre em contato.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-background min-h-screen font-body">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </Link>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="font-romantic text-lg text-foreground">Tempo Juntos</span>
        </div>
        <div className="w-16" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-romantic text-gradient-romantic mb-2">Crie sua página</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados e surpreenda quem você ama ❤️</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <FieldWrapper label="Seu nome" icon={User} error={errors.nome_cliente}>
            <input
              type="text"
              value={formData.nome_cliente}
              onChange={(e) => updateField("nome_cliente", e.target.value)}
              placeholder="Ex: João"
              maxLength={100}
              className="form-input"
            />
          </FieldWrapper>

          {/* Email */}
          <FieldWrapper label="Seu e-mail" icon={Mail} error={errors.email}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="joao@email.com"
              maxLength={255}
              className="form-input"
            />
          </FieldWrapper>

          {/* Título */}
          <FieldWrapper label="Título da página" icon={Type} error={errors.titulo_pagina}>
            <input
              type="text"
              value={formData.titulo_pagina}
              onChange={(e) => updateField("titulo_pagina", e.target.value)}
              placeholder="Ex: Nosso Amor"
              maxLength={100}
              className="form-input"
            />
          </FieldWrapper>

          {/* Data especial */}
          <FieldWrapper label="Data especial" icon={Calendar} error={errors.data_especial}>
            <input
              type="date"
              value={formData.data_especial}
              onChange={(e) => updateField("data_especial", e.target.value)}
              className="form-input"
            />
          </FieldWrapper>

          {/* Mensagem */}
          <FieldWrapper label="Mensagem de amor" icon={FileText} error={errors.mensagem}>
            <textarea
              value={formData.mensagem}
              onChange={(e) => updateField("mensagem", e.target.value)}
              placeholder="Escreva sua mensagem aqui..."
              maxLength={MAX_MESSAGE_LENGTH}
              rows={5}
              className="form-input resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={generateMessage}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-body font-semibold disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isGenerating ? "Gerando..." : "Estou sem ideia ✨"}
              </button>
              <span className="text-xs text-muted-foreground">{formData.mensagem.length}/{MAX_MESSAGE_LENGTH}</span>
            </div>
          </FieldWrapper>

          {/* Música */}
          <FieldWrapper label="Link da música (opcional)" icon={Music}>
            <input
              type="url"
              value={formData.musica_url}
              onChange={(e) => updateField("musica_url", e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="form-input"
            />
          </FieldWrapper>

          {/* Fotos */}
          <div>
            <label className="flex items-center gap-2 text-sm font-body font-semibold text-foreground mb-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Fotos ({photos.length}/{MAX_PHOTOS})
            </label>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={p.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Adicionar</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              multiple
              onChange={handlePhotoAdd}
              className="hidden"
            />

            {errors.fotos && <p className="text-xs text-destructive mt-1">{errors.fotos}</p>}
            <p className="text-xs text-muted-foreground">JPG, PNG, GIF ou WebP · Máx. 5MB cada</p>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-base py-4 rounded-full transition-colors glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando sua página...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 fill-primary-foreground" />
                Criar minha página
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você será redirecionado para o pagamento seguro via PIX.
          </p>
        </form>
      </div>
    </div>
  );
};

const FieldWrapper = ({ label, icon: Icon, error, children }: { label: string; icon: any; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-body font-semibold text-foreground mb-2">
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default Criar;
