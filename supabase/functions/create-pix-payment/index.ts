import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MP_API_URL = "https://api.mercadopago.com/checkout/preferences";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured");
    }

    const body = await req.json();
    const { amount, description, customer, metadata } = body;

    if (!amount || !description || !customer?.name || !customer?.email) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios: amount, description, customer (name, email)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const preference = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount / 100, // convert cents to BRL
          currency_id: "BRL",
        },
      ],
      payer: {
        name: customer.name,
        email: customer.email,
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      back_urls: {
        success: "https://momentodeamor.com/criar?status=approved",
        failure: "https://momentodeamor.com/criar?status=failure",
        pending: "https://momentodeamor.com/criar?status=pending",
      },
      auto_return: "approved",
      notification_url: `https://ymrmbwvdwxtdnxdfraza.supabase.co/functions/v1/mp-webhook`,
      metadata: metadata || {},
      external_reference: metadata?.orderId || metadata?.slug || "",
    };

    const response = await fetch(MP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mercado Pago API error:", JSON.stringify(data));
      throw new Error(`Mercado Pago API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      checkout_url: data.init_point,
      sandbox_url: data.sandbox_init_point,
      preference_id: data.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
