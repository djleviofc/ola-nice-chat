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
    console.log("Webhook received:", JSON.stringify(body));

    // Mercado Pago sends different notification types
    if (body.type === "payment" || body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data?.id;
      if (!paymentId) {
        console.log("No payment ID in webhook");
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Fetch payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const payment = await mpResponse.json();
      console.log("Payment details:", JSON.stringify({ id: payment.id, status: payment.status, preference_id: payment.preference_id }));

      if (payment.status === "approved") {
        // Find order by preference_id
        const preferenceId = payment.preference_id;
        const { data: order, error: findError } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_preference_id", preferenceId)
          .single();

        if (findError || !order) {
          console.error("Order not found for preference:", preferenceId, findError);
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Update order
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "approved",
            payment_id: String(paymentId),
            page_active: true,
            paid_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Error updating order:", updateError);
        } else {
          console.log("Order activated:", order.id);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, // Always return 200 to MP
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
