import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");

const ForgotPassword = () => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      setError("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);

    if (error) {
      toast({
        title: isRTL ? "خطا" : "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSuccess(true);
    }
  };

  const texts = {
    title: isRTL ? "بازیابی رمز عبور" : "Reset Password",
    subtitle: isRTL ? "ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود" : "Enter your email to receive a password reset link",
    email: isRTL ? "ایمیل" : "Email",
    submit: isRTL ? "ارسال لینک بازیابی" : "Send Reset Link",
    backToLogin: isRTL ? "بازگشت به صفحه ورود" : "Back to Login",
    successTitle: isRTL ? "ایمیل ارسال شد" : "Email Sent",
    successMessage: isRTL ? "لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفا صندوق ورودی خود را بررسی کنید." : "A password reset link has been sent to your email. Please check your inbox."
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{texts.successTitle}</h1>
          <p className="text-muted-foreground mb-6">{texts.successMessage}</p>
          <Link to="/login">
            <Button variant="outline" className="gap-2">
              <ArrowRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
              {texts.backToLogin}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{texts.title}</h1>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{texts.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!email.includes('@') || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isRTL ? "در حال ارسال..." : "Sending..."}
              </>
            ) : (
              texts.submit
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
            {texts.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
