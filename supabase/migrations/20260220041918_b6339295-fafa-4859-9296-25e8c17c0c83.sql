
-- Adicionar colunas de dados de pagamento para rastreamento detalhado
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_last_four text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_brand text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS card_holder_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payer_cpf text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payer_phone text DEFAULT NULL;

COMMENT ON COLUMN public.orders.payment_method IS 'pix | credit_card';
COMMENT ON COLUMN public.orders.card_last_four IS 'Últimos 4 dígitos do cartão (mascarado)';
COMMENT ON COLUMN public.orders.card_brand IS 'Bandeira: visa, mastercard, elo, etc.';
COMMENT ON COLUMN public.orders.card_holder_name IS 'Nome no cartão';
COMMENT ON COLUMN public.orders.payer_cpf IS 'CPF do pagador (mascarado: ***.***.XXX-XX)';
COMMENT ON COLUMN public.orders.payer_phone IS 'Telefone do pagador';
