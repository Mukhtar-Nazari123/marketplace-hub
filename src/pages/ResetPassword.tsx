import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const ResetPassword = () => {
  const { isRTL, language } = useLanguage();
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

  const texts = {
    title: language === 'fa' ? 'تنظیم رمز عبور جدید' : language === 'ps' ? 'نوی پټنوم ټاکل' : 'Set New Password',
    subtitle: language === 'fa' ? 'رمز عبور جدید خود را وارد کنید' : language === 'ps' ? 'خپل نوی پټنوم دننه کړئ' : 'Enter your new password',
    password: language === 'fa' ? 'رمز عبور جدید' : language === 'ps' ? 'نوی پټنوم' : 'New Password',
    confirmPassword: language === 'fa' ? 'تکرار رمز عبور' : language === 'ps' ? 'پټنوم تایید کړئ' : 'Confirm Password',
    submit: language === 'fa' ? 'تغییر رمز عبور' : language === 'ps' ? 'پټنوم بدل کړئ' : 'Update Password',
    submitting: language === 'fa' ? 'در حال تغییر...' : language === 'ps' ? 'بدلول روان دي...' : 'Updating...',
    successTitle: language === 'fa' ? 'رمز عبور تغییر کرد' : language === 'ps' ? 'پټنوم بدل شو' : 'Password Updated',
    successMessage: language === 'fa' ? 'رمز عبور شما با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.' : language === 'ps' ? 'ستاسو پټنوم په بریالیتوب سره بدل شو.' : 'Your password has been updated successfully.',
    goToLogin: language === 'fa' ? 'ورود به حساب' : language === 'ps' ? 'حساب ته ننوتل' : 'Go to Login',
    invalidLink: language === 'fa' ? 'لینک نامعتبر است' : language === 'ps' ? 'ناسم لینک' : 'Invalid Link',
    invalidLinkDesc: language === 'fa' ? 'این لینک بازیابی نامعتبر یا منقضی شده است.' : language === 'ps' ? 'دا د بیا رغولو لینک ناسم یا ختم شوی دی.' : 'This reset link is invalid or has expired.',
    backToForgot: language === 'fa' ? 'درخواست مجدد' : language === 'ps' ? 'بیا غوښتنه' : 'Request Again',
    passwordMin: language === 'fa' ? 'رمز عبور باید حداقل ۸ کاراکتر باشد' : language === 'ps' ? 'پټنوم باید لږ تر لږه ۸ توري ولري' : 'Password must be at least 8 characters',
    passwordsNoMatch: language === 'fa' ? 'رمزهای عبور مطابقت ندارند' : language === 'ps' ? 'پټنومونه سره سمون نه لري' : 'Passwords do not match',
  };

  useEffect(() => {
    // Check for recovery session from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsValidSession(true);
      setChecking(false);
      return;
    }

    // Also check if user already has an active session from recovery
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
      setError(texts.passwordMin);
      return;
    }

    if (password !== confirmPassword) {
      setError(texts.passwordsNoMatch);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        title: language === 'fa' ? 'خطا' : language === 'ps' ? 'تېروتنه' : 'Error',
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSuccess(true);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2">{texts.invalidLink}</h1>
          <p className="text-muted-foreground mb-6">{texts.invalidLinkDesc}</p>
          <Link to="/forgot-password">
            <Button variant="outline" className="gap-2">
              <ArrowRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
              {texts.backToForgot}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <Button className="gap-2">
              {texts.goToLogin}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{texts.title}</h1>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">{texts.password}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-destructive" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={error ? "border-destructive" : ""}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!password || !confirmPassword || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {texts.submitting}
              </>
            ) : (
              texts.submit
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
