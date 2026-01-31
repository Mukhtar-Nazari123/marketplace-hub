import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useAuthTranslations } from "@/lib/auth-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const Login = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useAuthTranslations(language);
  const { signIn, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Localized schema
  const loginSchema = z.object({
    email: z.string().email(t('validation', 'invalidEmail')),
    password: z.string().min(1, t('validation', 'passwordRequired')),
  });

  // Redirect based on role if already logged in
  useEffect(() => {
    if (user && !authLoading && role) {
      redirectBasedOnRole(role);
    }
  }, [user, authLoading, role]);

  const redirectBasedOnRole = (userRole: string) => {
    if (userRole === "admin") {
      navigate("/dashboard/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const isFormValid = email.includes("@") && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      let errorMessage = error.message;

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = t('login', 'invalidCredentials');
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = t('login', 'confirmEmail');
      }

      toast({
        title: t('login', 'loginError'),
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('login', 'loginSuccess'),
        description: t('login', 'welcomeBack'),
      });
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('login', 'back')}
        </Button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('login', 'title')}</h1>
          <p className="text-muted-foreground">{t('login', 'subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('login', 'email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('login', 'password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${errors.password ? "border-destructive" : ""} ${isRTL ? 'pr-10' : 'pl-10'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                {t('login', 'rememberMe')}
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              {t('login', 'forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={!isFormValid || loading}>
            {loading ? (
              <>
                <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('login', 'signingIn')}
              </>
            ) : (
              t('login', 'signIn')
            )}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-muted-foreground">
          {t('login', 'noAccount')}{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            {t('login', 'register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
