import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const { isRTL } = useLanguage();
  const { signIn, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect based on role if already logged in
  useEffect(() => {
    if (user && !authLoading && role) {
      redirectBasedOnRole(role);
    }
  }, [user, authLoading, role]);

  const redirectBasedOnRole = (userRole: string) => {
    // Admins go to dashboard, buyers and sellers go to home page
    if (userRole === "admin") {
      navigate("/dashboard/admin", { replace: true });
    } else {
      // Buyers and sellers redirect to home page
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

      // User-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = isRTL ? "ایمیل یا رمز عبور اشتباه است" : "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = isRTL ? "لطفا ایمیل خود را تایید کنید" : "Please confirm your email first";
      }

      toast({
        title: isRTL ? "خطا در ورود" : "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: isRTL ? "ورود موفق" : "Login Successful",
        description: isRTL ? "خوش آمدید!" : "Welcome back!",
      });
      // Navigate to home for buyers/sellers, dashboard resolver will handle admins
      navigate('/', { replace: true });
    }
  };

  const texts = {
    title: isRTL ? "ورود به حساب کاربری" : "Welcome Back",
    subtitle: isRTL ? "برای ادامه وارد حساب خود شوید" : "Sign in to your account to continue",
    email: isRTL ? "ایمیل" : "Email",
    password: isRTL ? "رمز عبور" : "Password",
    rememberMe: isRTL ? "مرا به خاطر بسپار" : "Remember me",
    forgotPassword: isRTL ? "فراموشی رمز عبور؟" : "Forgot password?",
    login: isRTL ? "ورود" : "Sign In",
    noAccount: isRTL ? "حساب کاربری ندارید؟" : "Don't have an account?",
    register: isRTL ? "ثبت‌نام" : "Register",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {isRTL ? "بازگشت" : "Back"}
        </Button>

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
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{texts.password}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? "border-destructive pl-10" : "pl-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                {texts.rememberMe}
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              {texts.forgotPassword}
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={!isFormValid || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isRTL ? "در حال ورود..." : "Signing in..."}
              </>
            ) : (
              texts.login
            )}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-muted-foreground">
          {texts.noAccount}{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            {texts.register}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
