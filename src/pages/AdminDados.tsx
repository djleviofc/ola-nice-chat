import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Lock, RefreshCw, CreditCard, QrCode, Download,
  Search, ShieldCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderFull {
  id: string;
  slug: string;
  nome_cliente: string;
  nome_parceiro: string;
  email: string;
  titulo_pagina: string;
  payment_status: string;
  payment_method: string | null;
  payment_id: string | null;
  payment_preference_id: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  card_holder_name: string | null;
  payer_cpf: string | null;
  payer_phone: string | null;
  page_active: boolean;
  amount: number;
  created_at: string;
  paid_at: string | null;
}

const methodIcon = (method: string | null) => {
  if (method === "pix") return <QrCode className="w-4 h-4 text-green-400" />;
  if (method === "credit_card") return <CreditCard className="w-4 h-4 text-blue-400" />;
  return <span className="text-muted-foreground text-xs">—</span>;
};

const methodLabel = (method: string | null) => {
  if (method === "pix") return "PIX";
  if (method === "credit_card") return "Cartão";
  return "—";
};

const brandColors: Record<string, string> = {
  visa: "text-blue-400",
  mastercard: "text-orange-400",
  elo: "text-yellow-400",
  amex: "text-indigo-400",
  hipercard: "text-red-400",
};

const AdminDados = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<OrderFull[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState<"all" | "pix" | "credit_card">("all");

  const fetchOrders = async (pwd?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-orders", {
        headers: { "x-admin-password": pwd || password },
      });
      if (error) throw error;
      if (data?.error === "Unauthorized") {
        setAuthenticated(false);
        toast({ title: "Senha incorreta", variant: "destructive" });
        return;
      }
      setOrders(data.orders || []);
      setAuthenticated(true);
    } catch {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(password);
  };

  const exportCSV = () => {
    const headers = [
      "ID", "Nome Cliente", "Nome Parceiro", "Email", "Título",
      "Método", "Status", "Valor (R$)", "Payment ID",
      "Bandeira", "Últimos 4", "Nome Cartão", "CPF (mascarado)",
      "Telefone", "Criado em", "Pago em",
    ];
    const rows = filtered.map(o => [
      o.id, o.nome_cliente, o.nome_parceiro, o.email, o.titulo_pagina,
      methodLabel(o.payment_method), o.payment_status,
      (o.amount / 100).toFixed(2), o.payment_id || "",
      o.card_brand || "", o.card_last_four || "", o.card_holder_name || "",
      o.payer_cpf || "", o.payer_phone || "",
      new Date(o.created_at).toLocaleString("pt-BR"),
      o.paid_at ? new Date(o.paid_at).toLocaleString("pt-BR") : "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentodeamor-dados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.nome_cliente.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.card_last_four?.includes(q) ||
      o.payment_id?.includes(q) ||
      false;
    const matchMethod = filterMethod === "all" || o.payment_method === filterMethod;
    return matchSearch && matchMethod;
  });

  const stats = {
    total: orders.length,
    pix: orders.filter(o => o.payment_method === "pix").length,
    card: orders.filter(o => o.payment_method === "credit_card").length,
    approved: orders.filter(o => o.payment_status === "approved").length,
    revenue: orders.filter(o => o.payment_status === "approved").reduce((s, o) => s + o.amount, 0) / 100,
  };

  // ── Login screen ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-romantic text-foreground">Dados Confidenciais</h1>
            <p className="text-muted-foreground text-sm mt-1">Acesso restrito — apenas administradores</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            className="form-input text-center w-full"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {loading ? "Verificando..." : "Acessar"}
          </button>
          <a href="/admin" className="block text-xs text-muted-foreground hover:text-foreground">
            ← Voltar ao painel admin
          </a>
        </motion.form>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-romantic text-foreground">Dados de Compras</h1>
              <p className="text-xs text-muted-foreground">Informações confidenciais — uso interno</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 text-sm bg-card border border-border hover:bg-muted/50 text-foreground px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => fetchOrders()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "PIX", value: stats.pix, color: "text-green-400" },
            { label: "Cartão", value: stats.card, color: "text-blue-400" },
            { label: "Aprovados", value: stats.approved, color: "text-primary" },
            { label: "Receita", value: `R$ ${stats.revenue.toFixed(2)}`, color: "text-primary" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, email, payment ID…"
              className="form-input pl-9 w-full"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pix", "credit_card"] as const).map(m => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMethod === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "all" ? "Todos" : m === "pix" ? "PIX" : "Cartão"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Método</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Dados Pagamento</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Valor</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
                {filtered.map(order => (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-3 text-foreground font-medium">
                        {order.nome_cliente}
                        <span className="text-muted-foreground font-normal"> & {order.nome_parceiro}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{order.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {methodIcon(order.payment_method)}
                          <span className="text-xs text-foreground">{methodLabel(order.payment_method)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.payment_method === "credit_card" && order.card_last_four ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium uppercase ${brandColors[order.card_brand?.toLowerCase() || ""] || "text-muted-foreground"}`}>
                              {order.card_brand || "—"}
                            </span>
                            <span className="text-xs text-foreground font-mono">••••&nbsp;{order.card_last_four}</span>
                          </div>
                        ) : order.payment_method === "pix" ? (
                          <span className="text-xs text-green-400 font-mono">
                            {order.payment_id ? `ID: ${order.payment_id.slice(0, 10)}…` : "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment_status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {order.payment_status === "approved" ? "Aprovado" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono text-xs">
                        R$ {(order.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {expandedId === order.id
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-muted/10 border-b border-border">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Order ID</p>
                              <p className="text-foreground font-mono break-all">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Payment ID (MP)</p>
                              <p className="text-foreground font-mono">{order.payment_id || "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Preference ID</p>
                              <p className="text-foreground font-mono text-[10px] break-all">{order.payment_preference_id || "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Slug da Página</p>
                              <p className="text-foreground font-mono">{order.slug}</p>
                            </div>
                            {order.payment_method === "credit_card" && (
                              <>
                                <div>
                                  <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Bandeira</p>
                                  <p className={`font-medium uppercase ${brandColors[order.card_brand?.toLowerCase() || ""] || "text-foreground"}`}>
                                    {order.card_brand || "—"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Últimos 4 dígitos</p>
                                  <p className="text-foreground font-mono text-base">••••&nbsp;{order.card_last_four || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Nome no Cartão</p>
                                  <p className="text-foreground">{order.card_holder_name || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">CPF (mascarado)</p>
                                  <p className="text-foreground font-mono">{order.payer_cpf || "—"}</p>
                                </div>
                              </>
                            )}
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Pago em</p>
                              <p className="text-foreground">{order.paid_at ? new Date(order.paid_at).toLocaleString("pt-BR") : "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium uppercase tracking-wider text-[10px]">Criado em</p>
                              <p className="text-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Dados confidenciais — {filtered.length} registro(s) exibido(s)
        </p>
      </div>
    </div>
  );
};

export default AdminDados;
