import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FLASHPAY_URL = "https://api.appflashpay.com/v1/payments";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FLASHPAY_API_KEY = Deno.env.get("FLASHPAY_API_KEY");
    if (!FLASHPAY_API_KEY) {
      throw new Error("FLASHPAY_API_KEY is not configured");
    }

    const body = await req.json();
    const { amount, description, customer, metadata } = body;

    // Validate required fields
    if (!amount || !description || !customer?.name || !customer?.email || !customer?.document) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios: amount, description, customer (name, email, document)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(FLASHPAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FLASHPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        description,
        customer,
        metadata: metadata || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Flashpay API error:", JSON.stringify(data));
      throw new Error(`Flashpay API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error creating PIX payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
