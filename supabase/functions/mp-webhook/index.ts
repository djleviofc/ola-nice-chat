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

    // Parse query params (MP IPN uses query params)
    const url = new URL(req.url);
    const topicParam = url.searchParams.get("topic");
    const idParam = url.searchParams.get("id");

    // Try to parse body (MP Webhooks use JSON body)
    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      // body might be empty for IPN
    }

    console.log("Webhook received - params:", { topicParam, idParam }, "body:", JSON.stringify(body));

    let paymentId: string | null = null;

    // Format 1: IPN via query params (?topic=payment&id=PAYMENT_ID)
    if (topicParam === "payment" && idParam) {
      paymentId = idParam;
    }
    // Format 2: Webhooks JSON body (type: "payment")
    else if (body.type === "payment" && body.data) {
      paymentId = String((body.data as Record<string, unknown>).id);
    }
    // Format 3: action based
    else if (
      (body.action === "payment.updated" || body.action === "payment.created") &&
      body.data
    ) {
      paymentId = String((body.data as Record<string, unknown>).id);
    }
    // Format 4: direct payment_id in body
    else if (body.payment_id) {
      paymentId = String(body.payment_id);
    }

    if (!paymentId) {
      console.log("No payment ID found in webhook. Body:", JSON.stringify(body), "Params:", topicParam, idParam);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing payment ID:", paymentId);

    // Fetch payment details from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const payment = await mpResponse.json();
    console.log("Payment details:", JSON.stringify({
      id: payment.id,
      status: payment.status,
      preference_id: payment.preference_id,
      external_reference: payment.external_reference,
    }));

    if (payment.status === "approved") {
      // Try by preference_id first
      const preferenceId = payment.preference_id;
      let orderId: string | null = null;

      if (preferenceId) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_preference_id", preferenceId)
          .single();
        if (order) orderId = order.id;
      }

      // Fallback: try by external_reference (slug or order id)
      if (!orderId && payment.external_reference) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("id", payment.external_reference)
          .single();
        if (order) orderId = order.id;
      }

      if (!orderId) {
        console.error("Order not found for preference:", preferenceId, "external_ref:", payment.external_reference);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
      } else {
        console.log("✅ Order activated:", orderId);
      }
    } else {
      console.log("Payment status not approved:", payment.status, "- skipping activation");
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
