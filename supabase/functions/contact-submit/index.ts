import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting store (in-memory, resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // Per hour

interface ContactFormData {
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  user_id?: string;
  user_role?: string;
  locale?: string;
}

function sanitizeInput(input: string): string {
  if (!input) return "";
  // Remove potential XSS vectors
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Get client IP for rate limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfter),
            ...corsHeaders 
          } 
        }
      );
    }

    const formData: ContactFormData = await req.json();
    console.log("Received contact form submission:", { 
      email: formData.email, 
      subject: formData.subject,
      user_role: formData.user_role,
      locale: formData.locale 
    });

    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.subject || !formData.message) {
      console.log("Validation failed: missing required fields");
      return new Response(
        JSON.stringify({ success: false, error: "Please fill in all required fields." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      console.log("Validation failed: invalid email format");
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid email address." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate message length
    if (formData.message.length < 10) {
      console.log("Validation failed: message too short");
      return new Response(
        JSON.stringify({ success: false, error: "Message must be at least 10 characters long." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (formData.message.length > 5000) {
      console.log("Validation failed: message too long");
      return new Response(
        JSON.stringify({ success: false, error: "Message must be less than 5000 characters." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate name length
    if (formData.full_name.length > 100) {
      console.log("Validation failed: name too long");
      return new Response(
        JSON.stringify({ success: false, error: "Name must be less than 100 characters." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate subject length
    if (formData.subject.length > 200) {
      console.log("Validation failed: subject too long");
      return new Response(
        JSON.stringify({ success: false, error: "Subject must be less than 200 characters." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      full_name: sanitizeInput(formData.full_name),
      email: sanitizeInput(formData.email.toLowerCase()),
      phone: formData.phone ? sanitizeInput(formData.phone) : null,
      subject: sanitizeInput(formData.subject),
      message: sanitizeInput(formData.message),
      user_id: formData.user_id || null,
      user_role: formData.user_role || "guest",
      locale: formData.locale || "en",
      ip_address: clientIp,
      status: "new",
    };

    // Validate user_role
    const validRoles = ["guest", "buyer", "seller", "admin"];
    if (!validRoles.includes(sanitizedData.user_role)) {
      sanitizedData.user_role = "guest";
    }

    // Validate locale
    const validLocales = ["en", "fa"];
    if (!validLocales.includes(sanitizedData.locale)) {
      sanitizedData.locale = "en";
    }

    // Create Supabase client with service role key for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into database
    const { data, error } = await supabase
      .from("contact_messages")
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to submit message. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Contact message saved successfully:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been sent successfully.",
        id: data.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in contact-submit function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
