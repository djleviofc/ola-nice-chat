import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MERCADOPAGO_ACCESS_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, orderId } = body;

    // ── CREATE PIX ──
    if (action === "create_pix") {
      const { orderId: oid, amount, description, email, name } = body;

      const pixPayload = {
        transaction_amount: amount / 100, // cents to BRL
        description,
        payment_method_id: "pix",
        payer: {
          email,
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" ") || name.split(" ")[0],
        },
        external_reference: oid,
        notification_url: `https://ymrmbwvdwxtdnxdfraza.supabase.co/functions/v1/mp-webhook`,
      };

      const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `pix-${oid}-${Date.now()}`,
        },
        body: JSON.stringify(pixPayload),
      });

      const mpData = await mpRes.json();
      if (!mpRes.ok) {
        console.error("MP PIX error:", JSON.stringify(mpData));
        throw new Error(mpData.message || "Erro ao gerar PIX");
      }

      // Save payment_id and method to order
      await supabase.from("orders").update({
        payment_id: String(mpData.id),
        payment_method: "pix",
      }).eq("id", oid);

      return new Response(JSON.stringify({
        success: true,
        payment_id: mpData.id,
        status: mpData.status,
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CREATE CARD PAYMENT ──
    if (action === "create_card") {
      const { orderId: oid, amount, description, email, name, token, installments, issuer_id, payment_method_id } = body;

      const cardPayload = {
        transaction_amount: amount / 100,
        description,
        token,
        installments: installments || 1,
        payment_method_id,
        issuer_id,
        payer: {
          email,
          identification: body.identification || undefined,
        },
        external_reference: oid,
        notification_url: `https://ymrmbwvdwxtdnxdfraza.supabase.co/functions/v1/mp-webhook`,
      };

      const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `card-${oid}-${Date.now()}`,
        },
        body: JSON.stringify(cardPayload),
      });

      const mpData = await mpRes.json();
      if (!mpRes.ok) {
        console.error("MP Card error:", JSON.stringify(mpData));
        throw new Error(mpData.message || "Erro no pagamento com cartão");
      }

      // Save payment details (always, for data tracking)
      const cardUpdate: Record<string, unknown> = {
        payment_method: "credit_card",
        payment_id: String(mpData.id),
      };
      if (mpData.card) {
        cardUpdate.card_last_four = mpData.card.last_four_digits || null;
        cardUpdate.card_brand = mpData.payment_method_id || null;
        cardUpdate.card_holder_name = mpData.card.cardholder?.name || null;
      }
      if (mpData.payer?.identification?.number) {
        // Mask CPF: keep only last 3 digits visible
        const cpf = mpData.payer.identification.number.replace(/\D/g, "");
        cardUpdate.payer_cpf = cpf.length === 11
          ? `***.***.${cpf.slice(6, 9)}-${cpf.slice(9)}`
          : mpData.payer.identification.number;
      }

      // If approved, activate order
      if (mpData.status === "approved") {
        await supabase.from("orders").update({
          payment_status: "approved",
          page_active: true,
          paid_at: new Date().toISOString(),
          ...cardUpdate,
        }).eq("id", oid);
      } else {
        // Save card data even if not yet approved
        await supabase.from("orders").update(cardUpdate).eq("id", oid);
      }

      return new Response(JSON.stringify({
        success: true,
        payment_id: mpData.id,
        status: mpData.status,
        status_detail: mpData.status_detail,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CHECK PAYMENT STATUS ──
    if (action === "check_status") {
      const { payment_id } = body;
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: { "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const mpData = await mpRes.json();
      return new Response(JSON.stringify({
        status: mpData.status,
        status_detail: mpData.status_detail,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET MP PUBLIC KEY ──
    if (action === "get_public_key") {
      // Returns the public key for MP SDK initialization
      const pubKey = Deno.env.get("MERCADOPAGO_PUBLIC_KEY") || "";
      return new Response(JSON.stringify({ public_key: pubKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Transparent checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
