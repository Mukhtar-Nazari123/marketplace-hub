import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useVerificationTranslations } from "@/lib/verification-translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle, ArrowLeft, Loader2, ShieldCheck, RefreshCw } from "lucide-react";

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useVerificationTranslations(language);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);

  // Get stored verification data from sessionStorage
  const verificationData = JSON.parse(sessionStorage.getItem("verification_data") || "{}");
  const { email, role } = verificationData;

  // Redirect if no verification data
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async (otpCode: string) => {
    if (otpCode.length !== 6 || loading) return;
    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup',
      });

      if (verifyError) {
        setError(verifyError.message || t("invalidCode"));
        setCode("");
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      sessionStorage.removeItem("verification_data");

      toast({ title: t("success") });

      setTimeout(() => {
        const redirectPath = role === "seller" ? "/seller/profile-choice" : "/";
        navigate(redirectPath);
      }, 2000);
    } catch {
      setError("An unexpected error occurred");
      setCode("");
    } finally {
      setLoading(false);
    }
  }, [email, loading, navigate, role, t, toast]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6) {
      handleVerify(code);
    }
  }, [code, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(resendError.message || "Failed to resend");
      } else {
        toast({ title: t("codeSent"), description: t("checkEmail") });
        setResendCooldown(RESEND_COOLDOWN);
        setCode("");
      }
    } catch {
      setError("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("success")}</h1>
          <p className="text-muted-foreground">{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Back Button */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          {t("back")}
        </Link>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("subtitle")}{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <Button
          onClick={() => handleVerify(code)}
          disabled={code.length !== 6 || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("verifying")}
            </>
          ) : (
            t("verify")
          )}
        </Button>

        {/* Resend */}
        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("resendIn")} {resendCooldown} {t("seconds")}
            </p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resending}
              className="text-primary"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              {t("resend")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
