import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = 'https://bwdsswkrlomfwhwpkwww.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/[<>]/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { email, locale = 'en' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      const message = locale === 'fa' 
        ? 'ایمیل الزامی است' 
        : 'Email is required';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedEmail = sanitizeInput(email);

    if (!isValidEmail(sanitizedEmail)) {
      const message = locale === 'fa' 
        ? 'فرمت ایمیل نامعتبر است' 
        : 'Invalid email format';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing subscriber:', checkError);
      throw new Error('Database error');
    }

    if (existing) {
      if (existing.status === 'active') {
        const message = locale === 'fa' 
          ? 'این ایمیل قبلاً عضو شده است' 
          : 'This email is already subscribed';
        return new Response(
          JSON.stringify({ error: message, code: 'ALREADY_SUBSCRIBED' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Reactivate unsubscribed email
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            status: 'active', 
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error reactivating subscriber:', updateError);
          throw new Error('Failed to reactivate subscription');
        }

        const message = locale === 'fa' 
          ? 'با موفقیت مجدداً عضو شدید' 
          : 'You have been resubscribed successfully';
        return new Response(
          JSON.stringify({ success: true, message }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: sanitizedEmail });

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      throw new Error('Failed to subscribe');
    }

    const message = locale === 'fa' 
      ? 'با موفقیت عضو خبرنامه شدید' 
      : 'You have successfully subscribed';

    return new Response(
      JSON.stringify({ success: true, message }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
