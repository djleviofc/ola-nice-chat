import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const APP_URL = "https://momentodeamor.com";
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pageUrl)}&color=f0f0f0&bgcolor=1a1a2e&format=png`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Poppins',Arial,sans-serif;">

  <div style="max-width:580px;margin:32px auto;border-radius:24px;overflow:hidden;background:#13131f;box-shadow:0 0 60px rgba(220,38,127,0.15);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#dc267f 0%,#e85d3a 100%);padding:48px 32px 40px;text-align:center;position:relative;">
      <!-- Decorative dots -->
      <div style="position:absolute;top:16px;left:24px;width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%;"></div>
      <div style="position:absolute;top:28px;left:36px;width:4px;height:4px;background:rgba(255,255,255,0.2);border-radius:50%;"></div>
      <div style="position:absolute;top:16px;right:24px;width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%;"></div>
      <div style="position:absolute;top:28px;right:36px;width:4px;height:4px;background:rgba(255,255,255,0.2);border-radius:50%;"></div>

      <div style="font-size:44px;margin-bottom:12px;line-height:1;">💕</div>
      <p style="margin:0 0 4px;font-family:'Poppins',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.35em;color:rgba(255,255,255,0.75);text-transform:uppercase;">NOSSO</p>
      <h1 style="margin:4px 0 8px;font-family:'Dancing Script',cursive;font-size:38px;font-weight:700;color:#ffffff;line-height:1.1;">Momentos de Amor</h1>
      <p style="margin:0;font-family:'Poppins',sans-serif;font-size:13px;color:rgba(255,255,255,0.8);">${tituloPagina}</p>
    </div>

    <!-- Glowing divider -->
    <div style="height:2px;background:linear-gradient(90deg,transparent,rgba(220,38,127,0.6),transparent);"></div>

    <!-- Body -->
    <div style="padding:40px 36px;">

      <p style="margin:0 0 8px;font-family:'Poppins',sans-serif;font-size:15px;color:#f0f0f0;">
        Olá, <strong style="color:#e8608a;">${nomeCliente}</strong>! 🥰
      </p>
      <p style="margin:0 0 32px;font-family:'Poppins',sans-serif;font-size:14px;color:#8888aa;line-height:1.7;">
        Seu pagamento foi confirmado! A página especial para você e <strong style="color:#f0f0f0;">${nomeParceiro}</strong> já está disponível e pronta para ser compartilhada.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${pageUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#dc267f,#e85d3a);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:50px;font-family:'Poppins',sans-serif;font-size:15px;font-weight:600;letter-spacing:0.3px;box-shadow:0 0 30px rgba(220,38,127,0.4);">
          💖 Ver minha página
        </a>
      </div>

      <!-- Link -->
      <p style="text-align:center;margin:0 0 36px;font-family:'Poppins',sans-serif;font-size:12px;color:#555577;">
        Link direto: <a href="${pageUrl}" style="color:#dc267f;text-decoration:none;">${pageUrl}</a>
      </p>

      <!-- QR Code Card -->
      <div style="background:#0d0d1a;border:1px solid rgba(220,38,127,0.25);border-radius:16px;padding:28px;text-align:center;box-shadow:0 0 40px rgba(220,38,127,0.08);">
        <p style="margin:0 0 6px;font-family:'Dancing Script',cursive;font-size:22px;color:#e8608a;">QR Code da sua página</p>
        <p style="margin:0 0 20px;font-family:'Poppins',sans-serif;font-size:12px;color:#555577;">Aponte a câmera do celular para escanear</p>

        <!-- QR wrapper with glow -->
        <div style="display:inline-block;padding:12px;background:#1a1a2e;border-radius:12px;border:1px solid rgba(220,38,127,0.2);box-shadow:0 0 24px rgba(220,38,127,0.15);">
          <img src="${qrCodeUrl}" alt="QR Code" width="180" height="180" style="display:block;border-radius:6px;" />
        </div>

        <p style="margin:20px 0 0;font-family:'Poppins',sans-serif;font-size:12px;color:#555577;line-height:1.6;">
          📱 Salve o QR Code e imprima em papel fotográfico<br/>para um presente ainda mais especial!
        </p>
      </div>

      <!-- Tip box -->
      <div style="margin-top:28px;background:linear-gradient(135deg,rgba(220,38,127,0.08),rgba(232,93,58,0.08));border:1px solid rgba(220,38,127,0.15);border-radius:12px;padding:16px 20px;">
        <p style="margin:0;font-family:'Poppins',sans-serif;font-size:12px;color:#8888aa;line-height:1.7;">
          💡 <strong style="color:#e8608a;">Dica:</strong> Compartilhe o link ou QR Code com quem você ama. Sua página fica disponível para sempre, sem custos adicionais. 🌹
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0d0d1a;padding:24px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="margin:0 0 4px;font-family:'Dancing Script',cursive;font-size:20px;color:#dc267f;">Momentos de Amor</p>
      <p style="margin:0;font-family:'Poppins',sans-serif;font-size:11px;color:#444466;">
        Sua história de amor merece ser contada 💕<br/>
        <a href="${APP_URL}" style="color:#555577;text-decoration:none;">${APP_URL}</a>
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

    // ── Manual resend route: POST /mp-webhook?action=resend&order_id=xxx ──
    if (url.searchParams.get("action") === "resend") {
      const orderId = url.searchParams.get("order_id");
      if (!orderId) {
        return new Response(JSON.stringify({ error: "order_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: order } = await supabase
        .from("orders")
        .select("id, email, nome_cliente, nome_parceiro, slug, titulo_pagina, page_active")
        .eq("id", orderId)
        .single();
      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (RESEND_API_KEY) {
        await sendConfirmationEmail(RESEND_API_KEY, order.email, order.nome_cliente, order.nome_parceiro, order.slug, order.titulo_pagina);
        console.log("✅ Email resent for order:", orderId);
        return new Response(JSON.stringify({ ok: true, message: "Email reenviado!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Normal webhook flow ──
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
    } else if (typeof body.id === "number" || typeof body.id === "string") {
      paymentId = String(body.id);
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
    console.log("Payment:", { id: payment.id, status: payment.status, preference_id: payment.preference_id, external_reference: payment.external_reference });

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
        console.error("Order not found for preference:", preferenceId, "external_reference:", payment.external_reference);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Always save payment_id even if already active
      await supabase
        .from("orders")
        .update({ payment_id: String(paymentId) })
        .eq("id", order.id);

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
        console.log("Order already active, skipping activation:", order.id);
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
