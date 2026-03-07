import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CODE_EXPIRY_MINUTES = 10;
const MAX_RESEND_IN_WINDOW = 3;
const RESEND_WINDOW_MINUTES = 10;

function generateSecureCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

function getEmailHtml(code: string, language: string): { subject: string; html: string } {
  const subjects: Record<string, string> = {
    en: "Verify your account",
    fa: "تأیید حساب کاربری شما",
    ps: "خپل حساب تایید کړئ",
  };

  const translations: Record<string, { welcome: string; message: string; expires: string; ignore: string }> = {
    en: {
      welcome: "Welcome to BrightFlow Store",
      message: "Your verification code is:",
      expires: "This code expires in 10 minutes.",
      ignore: "If you did not create this account, please ignore this email.",
    },
    fa: {
      welcome: "به فروشگاه BrightFlow خوش آمدید",
      message: "کد تأیید شما:",
      expires: "این کد تا ۱۰ دقیقه معتبر است.",
      ignore: "اگر این حساب را ایجاد نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.",
    },
    ps: {
      welcome: "BrightFlow پلورنځي ته ښه راغلاست",
      message: "ستاسو د تایید کوډ:",
      expires: "دا کوډ تر ۱۰ دقیقو پورې اعتبار لري.",
      ignore: "که تاسو دا حساب نه دی جوړ کړی، مهرباني وکړئ دا بریښنالیک بې پامه پریږدئ.",
    },
  };

  const t = translations[language] || translations.en;
  const subject = subjects[language] || subjects.en;

  const html = `<!DOCTYPE html>
<html dir="${language === 'en' ? 'ltr' : 'rtl'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:#eb1d31;padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${t.welcome}</h1>
  </td></tr>
  <tr><td style="padding:36px 32px;text-align:center;">
    <p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6;">${t.message}</p>
    <div style="background:#f4f4f5;border-radius:10px;padding:20px;margin:0 auto;display:inline-block;">
      <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#1a1a1a;font-family:monospace;">${code}</span>
    </div>
    <p style="margin:24px 0 0;color:#999;font-size:14px;line-height:1.5;">${t.expires}</p>
    <p style="margin:12px 0 0;color:#bbb;font-size:13px;">${t.ignore}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return { subject, html };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, language = "en" } = await req.json();

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: "Missing userId or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 3 codes in 10 minutes
    const windowStart = new Date(Date.now() - RESEND_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("email_verification_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= MAX_RESEND_IN_WINDOW) {
      return new Response(JSON.stringify({ error: "too_many_requests", message: "Too many verification codes sent. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invalidate any existing unused codes for this user
    await supabaseAdmin
      .from("email_verification_codes")
      .update({ is_used: true })
      .eq("user_id", userId)
      .eq("is_used", false);

    // Generate and store new code
    const code = generateSecureCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("email_verification_codes")
      .insert({
        user_id: userId,
        email,
        verification_code: code,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create verification code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Supabase Auth admin (uses built-in email provider)
    const { subject, html } = getEmailHtml(code, language);

    // Use Resend if API key available, otherwise log for dev
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "BrightFlow Store <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("Resend email error:", errText);
      }
    } else {
      console.log(`[DEV] Verification code for ${email}: ${code}`);
    }

    // Cleanup expired codes opportunistically
    try {
      await supabaseAdmin.rpc("cleanup_expired_verification_codes");
    } catch (_e) {
      // ignore cleanup errors
    }

    return new Response(JSON.stringify({ success: true, expiresAt }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-verification-code error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
