import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lock, Eye, CheckCircle, Clock, ExternalLink, RefreshCw, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  slug: string;
  nome_cliente: string;
  nome_parceiro: string;
  email: string;
  titulo_pagina: string;
  payment_status: string;
  page_active: boolean;
  amount: number;
  created_at: string;
  paid_at: string | null;
}

const Admin = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

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
      toast({ title: "Erro ao carregar pedidos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(password);
  };

  const activateOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-orders?action=activate", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: { orderId },
      });
      if (error) throw error;
      toast({ title: "Página ativada! ✅" });
      fetchOrders();
    } catch {
      toast({ title: "Erro ao ativar", variant: "destructive" });
    }
  };

  const resendEmail = async (orderId: string) => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/mp-webhook?action=resend&order_id=${orderId}`,
        { method: "POST", headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Email reenviado! ✉️" });
    } catch (e: unknown) {
      toast({ title: `Erro ao reenviar: ${e instanceof Error ? e.message : "erro"}`, variant: "destructive" });
    }
  };

  const statusBadge = (status: string, active: boolean) => {
    if (active && status === "approved") return { label: "Pago ✅", color: "bg-green-500/20 text-green-400" };
    if (status === "approved") return { label: "Pago", color: "bg-green-500/20 text-green-400" };
    if (status === "pending") return { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" };
    return { label: status, color: "bg-muted text-muted-foreground" };
  };

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.payment_status === "approved").length,
    pending: orders.filter(o => o.payment_status === "pending").length,
    active: orders.filter(o => o.page_active).length,
    revenue: orders.filter(o => o.payment_status === "approved").reduce((sum, o) => sum + o.amount, 0) / 100,
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-romantic text-foreground">Painel Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            className="form-input text-center"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-romantic text-foreground">Painel Admin</h1>
          <button onClick={() => fetchOrders()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Pedidos", value: stats.total, icon: Eye },
            { label: "Pagos", value: stats.paid, icon: CheckCircle },
            { label: "Pendentes", value: stats.pending, icon: Clock },
            { label: "Receita", value: `R$ ${stats.revenue.toFixed(2)}`, icon: CheckCircle },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <s.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Casal</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Título</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">Nenhum pedido ainda</td>
                  </tr>
                )}
                {orders.map(order => {
                  const badge = statusBadge(order.payment_status, order.page_active);
                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 text-foreground font-medium">
                        {order.nome_cliente} & {order.nome_parceiro}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.email}</td>
                      <td className="px-4 py-3 text-foreground">{order.titulo_pagina}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        {order.page_active && (
                          <span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            Ativa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.page_active && (
                            <a
                              href={`/p/${order.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="Ver página"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {order.page_active && (
                            <button
                              onClick={() => resendEmail(order.id)}
                              className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
                              title="Reenviar email"
                            >
                              <Mail className="w-3 h-3" />
                              Email
                            </button>
                          )}
                          {!order.page_active && (
                            <button
                              onClick={() => activateOrder(order.id)}
                              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                              Ativar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
