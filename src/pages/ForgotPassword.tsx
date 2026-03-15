import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuthTranslations } from "@/lib/auth-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Mail, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);

const ForgotPassword = () => {
  const { language, isRTL } = useLanguage();
  const { t } = useAuthTranslations(language as 'en' | 'fa' | 'ps');
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      setError("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(t('validation', 'invalidEmail'));
        return;
      }
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);

    if (resetError) {
      toast({
        title: t('forgotPassword', 'error'),
        description: resetError.message,
        variant: "destructive"
      });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
          <CardContent className="pt-10 pb-8 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('forgotPassword', 'successTitle')}
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('forgotPassword', 'successMessage')}
            </p>
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <BackArrow className="w-4 h-4" />
                {t('forgotPassword', 'backToLogin')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
        <CardContent className="pt-10 pb-8 px-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('forgotPassword', 'title')}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('forgotPassword', 'subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('forgotPassword', 'email')}</Label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder={t('forgotPassword', 'emailPlaceholder')}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} ${error ? "border-destructive" : ""}`}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!email.includes('@') || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('forgotPassword', 'sending')}
                </>
              ) : (
                t('forgotPassword', 'sendLink')
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6 pt-5 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">
              {t('forgotPassword', 'rememberPassword')}
            </p>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5">
              <BackArrow className="w-3.5 h-3.5" />
              {t('forgotPassword', 'signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
