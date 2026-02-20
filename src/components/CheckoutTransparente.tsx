import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  QrCode, CreditCard, Copy, Check, Loader2, Heart, RefreshCw,
  ChevronLeft, AlertCircle, Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutTransparenteProps {
  orderId: string;
  amount: number; // in cents
  description: string;
  customerName: string;
  customerEmail: string;
  onSuccess: () => void;
  onBack: () => void;
}

type PaymentTab = "pix" | "card";
type PixStatus = "idle" | "loading" | "ready" | "polling" | "approved" | "error";
type CardStatus = "idle" | "loading" | "approved" | "error";

const CheckoutTransparente = ({
  orderId,
  amount,
  description,
  customerName,
  customerEmail,
  onSuccess,
  onBack,
}: CheckoutTransparenteProps) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<PaymentTab>("pix");

  // PIX state
  const [pixStatus, setPixStatus] = useState<PixStatus>("idle");
  const [pixCode, setPixCode] = useState("");
  const [pixQrBase64, setPixQrBase64] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Card state
  const [cardStatus, setCardStatus] = useState<CardStatus>("idle");
  const [cardError, setCardError] = useState("");
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    cpf: "",
  });

  // MP SDK
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState("");
  const mpRef = useRef<any>(null);

  // Load MP SDK and public key
  useEffect(() => {
    const loadMP = async () => {
      try {
        const { data } = await supabase.functions.invoke("create-transparent-checkout", {
          body: { action: "get_public_key" },
        });
        if (data?.public_key) {
          setMpPublicKey(data.public_key);
          const script = document.createElement("script");
          script.src = "https://sdk.mercadopago.com/js/v2";
          script.onload = () => {
            const MercadoPago = (window as any).MercadoPago;
            if (MercadoPago && data.public_key) {
              mpRef.current = new MercadoPago(data.public_key, { locale: "pt-BR" });
              setMpLoaded(true);
            }
          };
          document.head.appendChild(script);
        }
      } catch {
        console.error("Failed to load MP SDK");
      }
    };
    loadMP();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // Generate PIX
  const generatePix = async () => {
    setPixStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("create-transparent-checkout", {
        body: {
          action: "create_pix",
          orderId,
          amount,
          description,
          email: customerEmail,
          name: customerName,
        },
      });
      if (error || !data?.success) throw new Error(data?.error || "Erro ao gerar PIX");
      setPixCode(data.qr_code || "");
      setPixQrBase64(data.qr_code_base64 || "");
      setPixPaymentId(String(data.payment_id));
      setPixStatus("ready");
      startPolling(String(data.payment_id));
    } catch (err) {
      console.error(err);
      setPixStatus("error");
      toast({ title: "Erro ao gerar PIX", description: "Tente novamente.", variant: "destructive" });
    }
  };

  // Poll payment status
  const startPolling = (pid: string) => {
    setPixStatus("polling");
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("create-transparent-checkout", {
          body: { action: "check_status", payment_id: pid },
        });
        if (data?.status === "approved") {
          clearInterval(pollingRef.current!);
          setPixStatus("approved");
          setTimeout(onSuccess, 1500);
        }
      } catch { /* silent */ }
    }, 5000);
    // Stop after 10 min
    setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }, 600_000);
  };

  const copyPix = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Código PIX copiado! 📋" });
  };

  // Format card number
  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };
  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  // Pay with card via MP SDK tokenization
  const payCard = async () => {
    if (!mpRef.current) {
      toast({ title: "SDK não carregado, tente novamente.", variant: "destructive" });
      return;
    }
    const [expMonth, expYear] = cardForm.expiry.split("/");
    const cardNumber = cardForm.number.replace(/\s/g, "");
    if (!cardNumber || !cardForm.name || !expMonth || !expYear || !cardForm.cvv) {
      setCardError("Preencha todos os campos do cartão.");
      return;
    }
    setCardStatus("loading");
    setCardError("");
    try {
      const tokenData = await mpRef.current.createCardToken({
        cardNumber,
        cardholderName: cardForm.name,
        cardExpirationMonth: expMonth,
        cardExpirationYear: `20${expYear}`,
        securityCode: cardForm.cvv,
        identificationType: "CPF",
        identificationNumber: cardForm.cpf.replace(/\D/g, ""),
      });
      if (!tokenData?.id) throw new Error("Token inválido");

      // Get payment method id
      const bins = await mpRef.current.getPaymentMethods({ bin: cardNumber.slice(0, 6) });
      const pmId = bins?.results?.[0]?.id || "visa";

      const { data, error } = await supabase.functions.invoke("create-transparent-checkout", {
        body: {
          action: "create_card",
          orderId,
          amount,
          description,
          email: customerEmail,
          name: customerName,
          token: tokenData.id,
          installments: 1,
          payment_method_id: pmId,
          identification: { type: "CPF", number: cardForm.cpf.replace(/\D/g, "") },
        },
      });
      if (error || !data?.success) throw new Error(data?.error || "Pagamento recusado");
      if (data.status === "approved") {
        setCardStatus("approved");
        setTimeout(onSuccess, 1500);
      } else {
        throw new Error(`Status: ${data.status_detail}`);
      }
    } catch (err: any) {
      setCardStatus("error");
      setCardError(err.message || "Pagamento recusado. Verifique os dados.");
      toast({ title: "Erro no pagamento", description: err.message, variant: "destructive" });
    }
  };

  const amountBRL = (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-romantic text-2xl text-gradient-romantic">Finalizar pedido</h2>
          <p className="text-xs text-muted-foreground font-body">Pagamento seguro • {amountBRL}</p>
        </div>
        <div className="ml-auto">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Amount card */}
      <div className="bg-card/60 border border-border rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="font-body text-sm text-muted-foreground truncate max-w-[200px]">{description}</span>
        </div>
        <span className="font-body font-bold text-primary text-lg">{amountBRL}</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-card border border-border rounded-xl p-1 mb-6 gap-1">
        {[
          { key: "pix", label: "PIX", icon: QrCode },
          { key: "card", label: "Cartão", icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as PaymentTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body font-semibold text-sm transition-all ${
              tab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* PIX TAB */}
        {tab === "pix" && (
          <motion.div
            key="pix"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {pixStatus === "idle" && (
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-body text-sm mb-6">
                  Gere o QR Code PIX para pagar instantaneamente
                </p>
                <button
                  onClick={generatePix}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold py-3.5 px-8 rounded-full transition-colors glow-primary"
                >
                  <QrCode className="w-5 h-5" />
                  Gerar QR Code PIX
                </button>
              </div>
            )}

            {pixStatus === "loading" && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground font-body text-sm">Gerando PIX...</p>
              </div>
            )}

            {(pixStatus === "ready" || pixStatus === "polling") && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  {pixQrBase64 ? (
                    <img
                      src={`data:image/png;base64,${pixQrBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto rounded-xl border border-border"
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-muted rounded-xl flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground font-body mt-3">
                    Aponte a câmera do celular para pagar
                  </p>
                </div>

                {/* Copia e Cola */}
                <div className="space-y-2">
                  <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                    Ou copie o código PIX
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-body text-muted-foreground truncate">
                      {pixCode.slice(0, 40)}...
                    </div>
                    <button
                      onClick={copyPix}
                      className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status */}
                {pixStatus === "polling" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                    <p className="text-xs font-body text-muted-foreground">
                      Aguardando confirmação do pagamento...
                    </p>
                  </div>
                )}

                <button
                  onClick={generatePix}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground font-body text-xs transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Gerar novo código
                </button>
              </div>
            )}

            {pixStatus === "approved" && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="font-romantic text-3xl text-gradient-romantic">Pago! 💕</p>
              </div>
            )}

            {pixStatus === "error" && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="text-foreground font-body font-semibold mb-2">Erro ao gerar PIX</p>
                <button onClick={generatePix} className="text-primary font-body text-sm underline">
                  Tentar novamente
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* CARD TAB */}
        {tab === "card" && (
          <motion.div
            key="card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {cardStatus === "approved" ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="font-romantic text-3xl text-gradient-romantic">Aprovado! 💕</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {/* Card number */}
                  <div>
                    <label className="text-xs font-body font-semibold text-muted-foreground mb-1.5 block">Número do cartão</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardForm.number}
                      onChange={(e) => setCardForm((p) => ({ ...p, number: formatCard(e.target.value) }))}
                      placeholder="0000 0000 0000 0000"
                      className="form-input tracking-widest"
                      maxLength={19}
                    />
                  </div>

                  {/* Cardholder */}
                  <div>
                    <label className="text-xs font-body font-semibold text-muted-foreground mb-1.5 block">Nome no cartão</label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                      placeholder="NOME COMO NO CARTÃO"
                      className="form-input uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Expiry */}
                    <div>
                      <label className="text-xs font-body font-semibold text-muted-foreground mb-1.5 block">Validade</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/AA"
                        className="form-input"
                        maxLength={5}
                      />
                    </div>
                    {/* CVV */}
                    <div>
                      <label className="text-xs font-body font-semibold text-muted-foreground mb-1.5 block">CVV</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="123"
                        className="form-input"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="text-xs font-body font-semibold text-muted-foreground mb-1.5 block">CPF do titular</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardForm.cpf}
                      onChange={(e) => setCardForm((p) => ({ ...p, cpf: formatCpf(e.target.value) }))}
                      placeholder="000.000.000-00"
                      className="form-input"
                      maxLength={14}
                    />
                  </div>
                </div>

                {cardError && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-body text-destructive">{cardError}</p>
                  </div>
                )}

                {!mpLoaded && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Carregando SDK de pagamento...
                  </div>
                )}

                <button
                  onClick={payCard}
                  disabled={cardStatus === "loading" || !mpLoaded}
                  className="w-full py-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-sm flex items-center justify-center gap-2 transition-colors glow-primary disabled:opacity-50"
                >
                  {cardStatus === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pagar {amountBRL}</>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground font-body flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Pagamento seguro via Mercado Pago
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CheckoutTransparente;
