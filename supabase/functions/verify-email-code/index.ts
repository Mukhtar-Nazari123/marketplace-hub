import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return new Response(JSON.stringify({ error: "Missing userId or code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the latest unused code for this user
    const { data: codeRecord, error: fetchError } = await supabaseAdmin
      .from("email_verification_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !codeRecord) {
      return new Response(JSON.stringify({ error: "no_code", message: "No verification code found. Please request a new one." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if locked out (too many attempts)
    if (codeRecord.attempt_count >= MAX_ATTEMPTS) {
      return new Response(JSON.stringify({ error: "too_many_attempts", message: "Too many failed attempts. Please request a new code." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if expired
    if (new Date(codeRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "code_expired", message: "Verification code has expired. Please request a new one." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment attempt count
    await supabaseAdmin
      .from("email_verification_codes")
      .update({ attempt_count: codeRecord.attempt_count + 1 })
      .eq("id", codeRecord.id);

    // Verify code
    if (codeRecord.verification_code !== code.trim()) {
      const remaining = MAX_ATTEMPTS - (codeRecord.attempt_count + 1);
      return new Response(JSON.stringify({ 
        error: "invalid_code", 
        message: "Invalid verification code.",
        remainingAttempts: remaining 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Code is valid! Mark as used
    await supabaseAdmin
      .from("email_verification_codes")
      .update({ is_used: true })
      .eq("id", codeRecord.id);

    // Update user metadata to mark email as verified
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: { email_verified_at: new Date().toISOString() }
    });

    if (updateError) {
      console.error("Failed to update user verification status:", updateError);
      return new Response(JSON.stringify({ error: "verification_update_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, verified: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-email-code error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
