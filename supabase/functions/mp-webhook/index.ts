import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const APP_URL = "https://ola-nice-chat.lovable.app";
const FROM_EMAIL = "noreply@momentodeamor.com";

async function sendConfirmationEmail(
  resendKey: string,
  email: string,
  nomeCliente: string,
  nomeParceiro: string,
  slug: string,
  tituloPagina: string
) {
  const pageUrl = `${APP_URL}/p/${slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#fff8f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#e91e8c,#ff6b6b);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">💕</div>
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Sua página está pronta!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">${tituloPagina}</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#333;font-size:16px;">Olá, <strong>${nomeCliente}</strong>! 🥰</p>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
        Seu pagamento foi confirmado e a página especial para você e <strong>${nomeParceiro}</strong> já está disponível!
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:24px 0;">
        <a href="${pageUrl}" 
           style="display:inline-block;background:linear-gradient(135deg,#e91e8c,#ff6b6b);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
          💖 Ver minha página
        </a>
      </div>

      <!-- Link text -->
      <p style="text-align:center;margin:16px 0;color:#888;font-size:13px;">
        Ou acesse: <a href="${pageUrl}" style="color:#e91e8c;">${pageUrl}</a>
      </p>

      <!-- QR Code -->
      <div style="background:#fff8f8;border-radius:12px;padding:24px;text-align:center;margin:24px 0;border:1px solid #fde8f0;">
        <p style="margin:0 0 16px;color:#444;font-size:14px;font-weight:600;">📱 QR Code da sua página</p>
        <img src="${qrCodeUrl}" alt="QR Code" width="160" height="160" style="border-radius:8px;display:block;margin:0 auto;" />
        <p style="margin:12px 0 0;color:#888;font-size:12px;">Escaneie para abrir no celular</p>
      </div>

      <p style="margin:0;color:#888;font-size:13px;text-align:center;line-height:1.6;">
        Compartilhe este link com quem você ama 💝<br/>
        Guarde este email para acessar sua página sempre que quiser.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#fef6f9;padding:20px 32px;text-align:center;border-top:1px solid #fde8f0;">
      <p style="margin:0;color:#bbb;font-size:12px;">
        Love Pages · Sua história de amor merece ser contada 💕
      </p>
    </div>
  </div>
</body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: `💕 Sua página "${tituloPagina}" está pronta!`,
      html,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Resend error:", JSON.stringify(result));
    throw new Error(`Resend error: ${JSON.stringify(result)}`);
  }
  console.log("✅ Email sent:", result.id);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MERCADOPAGO_ACCESS_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const topicParam = url.searchParams.get("topic");
    const idParam = url.searchParams.get("id");

    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      // body might be empty for IPN
    }

    console.log("Webhook received - params:", { topicParam, idParam }, "body:", JSON.stringify(body));

    let paymentId: string | null = null;

    if (topicParam === "payment" && idParam) {
      paymentId = idParam;
    } else if (body.type === "payment" && body.data) {
      paymentId = String((body.data as Record<string, unknown>).id);
    } else if (
      (body.action === "payment.updated" || body.action === "payment.created") && body.data
    ) {
      paymentId = String((body.data as Record<string, unknown>).id);
    } else if (body.payment_id) {
      paymentId = String(body.payment_id);
    }

    if (!paymentId) {
      console.log("No payment ID found. Body:", JSON.stringify(body));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing payment ID:", paymentId);

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const payment = await mpResponse.json();
    console.log("Payment:", { id: payment.id, status: payment.status, preference_id: payment.preference_id });

    if (payment.status === "approved") {
      const preferenceId = payment.preference_id;
      let order: { id: string; email: string; nome_cliente: string; nome_parceiro: string; slug: string; titulo_pagina: string; page_active: boolean } | null = null;

      if (preferenceId) {
        const { data } = await supabase
          .from("orders")
          .select("id, email, nome_cliente, nome_parceiro, slug, titulo_pagina, page_active")
          .eq("payment_preference_id", preferenceId)
          .single();
        if (data) order = data;
      }

      if (!order && payment.external_reference) {
        const { data } = await supabase
          .from("orders")
          .select("id, email, nome_cliente, nome_parceiro, slug, titulo_pagina, page_active")
          .eq("id", payment.external_reference)
          .single();
        if (data) order = data;
      }

      if (!order) {
        console.error("Order not found for preference:", preferenceId);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Only activate and send email if not already active (avoid duplicate emails)
      if (!order.page_active) {
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
          console.log("✅ Order activated:", order.id);

          // Send confirmation email with QR code
          if (RESEND_API_KEY) {
            try {
              await sendConfirmationEmail(
                RESEND_API_KEY,
                order.email,
                order.nome_cliente,
                order.nome_parceiro,
                order.slug,
                order.titulo_pagina
              );
            } catch (emailError) {
              console.error("Email send error (non-fatal):", emailError);
            }
          } else {
            console.warn("RESEND_API_KEY not set - skipping email");
          }
        }
      } else {
        console.log("Order already active, skipping:", order.id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
