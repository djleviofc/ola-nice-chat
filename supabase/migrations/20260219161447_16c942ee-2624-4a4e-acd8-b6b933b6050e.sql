
-- Tabela de pedidos/páginas
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  
  -- Dados do casal
  nome_cliente TEXT NOT NULL,
  nome_parceiro TEXT NOT NULL,
  email TEXT NOT NULL,
  titulo_pagina TEXT NOT NULL,
  data_especial DATE,
  
  -- Conteúdo da página
  mensagem TEXT,
  musica_url TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  journey_events JSONB DEFAULT '[]'::jsonb,
  
  -- Pagamento
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_preference_id TEXT,
  payment_id TEXT,
  amount INTEGER NOT NULL DEFAULT 2990,
  
  -- Status da página
  page_active BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (public checkout)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Policy: anyone can read active pages by slug
CREATE POLICY "Anyone can read active pages" ON public.orders
  FOR SELECT USING (page_active = true);

-- Index for slug lookups
CREATE INDEX idx_orders_slug ON public.orders (slug);
CREATE INDEX idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX idx_orders_preference_id ON public.orders (payment_preference_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
