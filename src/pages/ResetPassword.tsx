import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuthTranslations } from "@/lib/auth-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";

const ResetPassword = () => {
  const { language, isRTL } = useLanguage();
  const { t } = useAuthTranslations(language as 'en' | 'fa' | 'ps');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      setIsValidSession(true);
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t('validation', 'passwordMin'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('validation', 'passwordsNoMatch'));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      toast({
        title: t('resetPassword', 'error'),
        description: updateError.message,
        variant: "destructive"
      });
    } else {
      setSuccess(true);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
          <CardContent className="pt-10 pb-8 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('resetPassword', 'invalidLink')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t('resetPassword', 'invalidLinkDesc')}
            </p>
            <Link to="/forgot-password">
              <Button variant="outline" className="gap-2">
                <BackArrow className="w-4 h-4" />
                {t('resetPassword', 'requestAgain')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
          <CardContent className="pt-10 pb-8 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('resetPassword', 'successTitle')}
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('resetPassword', 'successMessage')}
            </p>
            <Link to="/login">
              <Button className="gap-2">
                {t('resetPassword', 'goToLogin')}
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
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('resetPassword', 'title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('resetPassword', 'subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('resetPassword', 'newPassword')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={error ? "border-destructive" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={password} language={language as 'en' | 'fa' | 'ps'} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('resetPassword', 'confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className={error ? "border-destructive" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!password || !confirmPassword || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('resetPassword', 'updating')}
                </>
              ) : (
                t('resetPassword', 'updatePassword')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
