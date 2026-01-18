import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import RoleCard from "@/components/auth/RoleCard";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const Register = () => {
  const { isRTL } = useLanguage();
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    try {
      registerSchema.parse({ fullName, email, password, confirmPassword, agreeTerms });
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

  const isFormValid = fullName.length >= 2 && 
    email.includes('@') && 
    password.length >= 8 && 
    password === confirmPassword && 
    agreeTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signUp(email, password, fullName, selectedRole);
    setLoading(false);

    if (error) {
      toast({
        title: isRTL ? "خطا در ثبت‌نام" : "Registration Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSuccess(true);
      toast({
        title: isRTL ? "ثبت‌نام موفق" : "Registration Successful",
        description: isRTL ? "ایمیل تایید برای شما ارسال شد" : "A confirmation email has been sent to you"
      });
      // Redirect sellers to profile choice, buyers to login
      const redirectPath = selectedRole === 'seller' ? '/seller/profile-choice' : '/login';
      setTimeout(() => navigate(redirectPath), 2000);
    }
  };

  const texts = {
    title: isRTL ? "ایجاد حساب کاربری" : "Create Account",
    subtitle: isRTL ? "نوع حساب خود را انتخاب کنید" : "Choose your account type",
    fullName: isRTL ? "نام کامل" : "Full Name",
    email: isRTL ? "ایمیل" : "Email",
    password: isRTL ? "رمز عبور" : "Password",
    confirmPassword: isRTL ? "تکرار رمز عبور" : "Confirm Password",
    agreeTerms: isRTL ? "با قوانین و شرایط موافقم" : "I agree to the Terms and Conditions",
    register: isRTL ? "ثبت‌نام" : "Register",
    haveAccount: isRTL ? "حساب کاربری دارید؟" : "Already have an account?",
    login: isRTL ? "ورود" : "Login",
    successMessage: isRTL ? "ثبت‌نام با موفقیت انجام شد!" : "Registration successful!"
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{texts.successMessage}</h1>
          <p className="text-muted-foreground">
            {isRTL ? "در حال انتقال به صفحه ورود..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

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
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              role="buyer"
              selected={selectedRole === 'buyer'}
              onSelect={() => setSelectedRole('buyer')}
              isRTL={isRTL}
            />
            <RoleCard
              role="seller"
              selected={selectedRole === 'seller'}
              onSelect={() => setSelectedRole('seller')}
              isRTL={isRTL}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">{texts.fullName}</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isRTL ? "نام و نام خانوادگی" : "John Doe"}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

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
            <PasswordStrengthIndicator password={password} isRTL={isRTL} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.confirmPassword ? "border-destructive pl-10" : "pl-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="agreeTerms" className="text-sm cursor-pointer">
              {texts.agreeTerms}
            </Label>
          </div>
          {errors.agreeTerms && <p className="text-sm text-destructive">{errors.agreeTerms}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isRTL ? "در حال ثبت‌نام..." : "Registering..."}
              </>
            ) : (
              texts.register
            )}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-muted-foreground">
          {texts.haveAccount}{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {texts.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
