import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Pen, CreditCard, QrCode, Lightbulb, ChevronLeft, ChevronRight, Star, X, Clock, HelpCircle, Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TESTIMONIALS = [
  { name: "Ana & Pedro", time: "juntos a 2 anos", message: "Ficou lindo com nossas fotos. Simples e cheio de significado.", rating: 5 },
  { name: "Carla & Lucas", time: "juntos a 4 anos", message: "Ele amou o presente! Chorou quando viu a página com nossa história.", rating: 5 },
  { name: "Julia & Marcos", time: "juntos a 1 ano", message: "Surpreendi no aniversário de namoro. A reação dele não teve preço!", rating: 5 },
  { name: "Bea & Thiago", time: "juntos a 3 anos", message: "Muito fácil de criar e o resultado ficou incrível. Super recomendo!", rating: 5 },
];

const TIPS = [
  { title: "Imprima seu QR Code", description: "Imprima o QR Code em um papel fotográfico, pode tornar seu presente ainda mais duradouro e sofisticado. Dica extra: Papéis fotográficos de 230g possuem maior durabilidade e acabamento." },
  { title: "Adicione uma música especial", description: "Coloque a música que marcou vocês! Quando a pessoa abrir a página, vai ouvir a trilha sonora do amor de vocês." },
  { title: "Escolha fotos com significado", description: "Selecione fotos que contem a história de vocês. Cada imagem vale mais que mil palavras." },
  { title: "Personalize a mensagem", description: "Escreva do coração! Uma mensagem autêntica toca muito mais do que qualquer texto pronto." },
];

const FAQS = [
  { q: "O que é o Tempo Juntos?", a: "É uma plataforma que cria páginas românticas personalizadas com suas fotos, mensagens e músicas. Você recebe um QR Code exclusivo para compartilhar com quem ama." },
  { q: "A página é permanente?", a: "Sim! Sua página fica disponível para sempre, sem custos adicionais." },
  { q: "Como faço para criar minha página?", a: "É simples: personalize com suas fotos e mensagens, finalize o pagamento via PIX e receba seu QR Code na hora." },
  { q: "Consigo editar a página depois de criada?", a: "No momento a edição não está disponível, mas estamos trabalhando nessa funcionalidade." },
  { q: "Métodos de pagamento?", a: "Aceitamos PIX como forma de pagamento, com confirmação instantânea." },
  { q: "Minhas informações ficam públicas?", a: "Não! Apenas quem tem o link ou QR Code pode acessar sua página." },
  { q: "Funciona em outros dispositivos?", a: "Sim! A página funciona perfeitamente em celulares, tablets e computadores." },
];

const TimeCounterLanding = () => {
  const [time, setTime] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("2022-01-15T00:00:00");
    const update = () => {
      const now = new Date();
      let years = now.getFullYear() - target.getFullYear();
      let months = now.getMonth() - target.getMonth();
      let days = now.getDate() - target.getDate();
      if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }
      setTime({ years, months, days, hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { value: time.years, label: "Anos" },
    { value: time.months, label: "Meses" },
    { value: time.days, label: "Dias" },
    { value: time.hours, label: "Horas" },
    { value: time.minutes, label: "Minutos" },
    { value: time.seconds, label: "Segundos" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {blocks.map((b) => (
        <div key={b.label} className="bg-card border border-border rounded-lg p-3 text-center">
          <span className="text-2xl sm:text-3xl font-bold text-foreground font-body">{b.value}</span>
          <p className="text-xs text-muted-foreground font-body mt-1">{b.label}</p>
        </div>
      ))}
    </div>
  );
};

const Index = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="relative bg-background min-h-screen font-body">
      {/* Top Banner */}
      {showBanner && (
        <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-xs sm:text-sm font-body flex items-center justify-center relative">
          <span>🎁 Hoje com <strong>50% OFF</strong> · Aproveite!</span>
          <button onClick={() => setShowBanner(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.8 }}>
          <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4" />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-1">
          NOSSO
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl sm:text-7xl font-romantic text-foreground leading-tight mb-2">
          Tempo Juntos
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-6">
          <p className="text-lg text-primary font-body font-semibold">
            É O MELHOR <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded">PRESENTE</span>
          </p>
          <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
            Crie um <strong className="text-foreground">QR Code</strong> exclusivo com todo o <strong className="text-foreground">tempo</strong> que você e seu amor estão <strong className="text-foreground">juntos</strong>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Link
            to="/criar"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-base px-8 py-3 rounded-full transition-colors glow-primary"
          >
            Criar minha página
          </Link>
          <p className="text-xs text-muted-foreground mt-3">+ de 17.000 páginas criadas</p>
        </motion.div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-romantic text-foreground">Como funciona?</h2>
          <p className="text-sm text-muted-foreground font-body mt-2">São apenas <strong className="text-foreground">3 passos simples</strong></p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Pen, step: "Passo 1", title: "Personalize", desc: "Adicione suas fotos, data especial e uma mensagem de amor." },
            { icon: CreditCard, step: "Passo 2", title: "Finalize", desc: "Escolha o plano ideal e finalize o pagamento de forma segura." },
            { icon: QrCode, step: "Passo 3", title: "Surpreenda!", desc: "Receba seu QR Code exclusivo e surpreenda quem você ama." },
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-body mb-1">{item.step}</p>
              <h3 className="text-xl font-romantic text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Histórias / Testimonials */}
      <section className="py-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-romantic text-foreground">Histórias</h2>
          <p className="text-sm text-muted-foreground font-body mt-2">O que nossos casais estão dizendo</p>
        </div>

        <div className="max-w-md mx-auto relative">
          <div className="bg-card border border-border rounded-2xl p-6 text-center min-h-[180px] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-body font-bold text-sm">
                {TESTIMONIALS[testimonialIndex].name.charAt(0)}
              </span>
            </div>
            <p className="font-body font-semibold text-foreground text-sm">{TESTIMONIALS[testimonialIndex].name}</p>
            <p className="text-xs text-muted-foreground font-body mb-3">{TESTIMONIALS[testimonialIndex].time}</p>
            <p className="text-sm text-foreground/80 font-body italic mb-3">"{TESTIMONIALS[testimonialIndex].message}"</p>
            <div className="flex gap-1">
              {Array.from({ length: TESTIMONIALS[testimonialIndex].rating }).map((_, i) => (
                <Heart key={i} className="w-4 h-4 text-primary fill-primary" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setTestimonialIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIndex(i)} className={`h-1.5 rounded-full transition-all ${i === testimonialIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
            ))}
            <button onClick={() => setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length)} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Surpreenda / Tips */}
      <section className="py-20 px-4">
        <div className="text-center mb-10">
          <Lightbulb className="w-8 h-8 text-primary mx-auto mb-2" />
          <h2 className="text-4xl sm:text-5xl font-romantic text-foreground">Surpreenda</h2>
          <p className="text-sm text-muted-foreground font-body mt-2">
            <strong className="text-foreground">Dicas</strong> para tornar seu presente <strong className="text-foreground">ainda melhor</strong>
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground min-h-[140px]">
            <h4 className="font-body font-bold text-base mb-2">{TIPS[tipIndex].title}</h4>
            <p className="text-sm opacity-90 font-body leading-relaxed">{TIPS[tipIndex].description}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setTipIndex((i) => (i - 1 + TIPS.length) % TIPS.length)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {TIPS.map((_, i) => (
              <button key={i} onClick={() => setTipIndex(i)} className={`h-1.5 rounded-full transition-all ${i === tipIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
            ))}
            <button onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Time Counter */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-romantic text-foreground mb-1">
          A quanto <span className="text-primary">tempo</span>
        </h2>
        <h2 className="text-3xl sm:text-4xl font-romantic text-foreground mb-4">
          estamos <strong className="text-primary">juntos</strong>?
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-2">
          Tenha essa resposta de uma forma
        </p>
        <p className="text-sm text-primary font-body font-semibold mb-8">única e surpreendente</p>

        <TimeCounterLanding />

        <Link
          to="/criar"
          className="inline-block mt-10 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-bold text-base px-8 py-3 rounded-full transition-colors glow-primary"
        >
          Criar minha página
        </Link>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-romantic text-foreground">Dúvidas?</h2>
          <p className="text-sm text-muted-foreground font-body mt-2">Perguntas frequentes</p>
        </div>

        <div className="max-w-lg mx-auto">
          <Accordion type="single" collapsible>
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-sm font-body text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-body">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-3" />
          <h3 className="text-3xl font-romantic text-foreground mb-3">Tempo Juntos</h3>
          <p className="text-xs text-muted-foreground font-body mb-8">
            Um presente que celebra o tempo<br />ao lado de quem você ama.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left sm:text-center mb-8">
            <div>
              <h4 className="text-xs font-body font-bold text-foreground uppercase mb-2">Contato</h4>
              <p className="text-xs text-muted-foreground font-body">suporte@tempojuntos.com</p>
            </div>
            <div>
              <h4 className="text-xs font-body font-bold text-foreground uppercase mb-2">Links</h4>
              <p className="text-xs text-muted-foreground font-body">Termos de uso e política de privacidade</p>
            </div>
            <div>
              <h4 className="text-xs font-body font-bold text-foreground uppercase mb-2">Redes Sociais</h4>
              <p className="text-xs text-muted-foreground font-body">Instagram · TikTok</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/50 font-body">
            Tempo Juntos © 2025. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
