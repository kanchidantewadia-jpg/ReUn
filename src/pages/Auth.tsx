import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SimpleCaptcha from "@/components/SimpleCaptcha";
import { Users, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type SignupStep = "form" | "otp" | "complete";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [otpCode, setOtpCode] = useState("");
  const [pendingSignup, setPendingSignup] = useState<{
    email: string;
    password: string;
    fullName: string;
    displayName: string;
  } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleCaptchaVerify = useCallback((verified: boolean) => {
    setCaptchaVerified(verified);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/");
    }
    setIsLoading(false);
  };

  const requestOTP = async (email: string) => {
    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { action: "request", email, purpose: "signup" },
    });
    
    if (error || data?.error) {
      throw new Error(data?.error || error?.message || "Failed to send OTP");
    }
    return data;
  };

  const verifyOTP = async (email: string, code: string) => {
    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { action: "verify", email, code, purpose: "signup" },
    });
    
    if (error || data?.error) {
      throw new Error(data?.error || error?.message || "Invalid code");
    }
    return data;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      toast({
        title: "Verification required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm") as string;

    // Password validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase) {
      toast({
        title: "Weak password",
        description: "Password must contain at least one uppercase letter.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (!hasNumberOrSpecial) {
      toast({
        title: "Weak password",
        description: "Password must contain at least one number or special character.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Generate random display name for anonymity
    const randomDisplayName = `User${Math.floor(Math.random() * 10000)}`;

    try {
      // Request OTP first
      await requestOTP(email);
      
      // Store pending signup data
      setPendingSignup({
        email,
        password,
        fullName,
        displayName: randomDisplayName,
      });
      
      setSignupStep("otp");
      setResendCooldown(60);
      
      toast({
        title: "Verification code sent",
        description: `We've sent a 6-digit code to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!pendingSignup || otpCode.length !== 6) return;
    
    setIsLoading(true);
    
    try {
      // Verify OTP
      await verifyOTP(pendingSignup.email, otpCode);
      
      // Complete signup
      const { error } = await supabase.auth.signUp({
        email: pendingSignup.email,
        password: pendingSignup.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: pendingSignup.fullName,
            display_name: pendingSignup.displayName,
            show_real_name: false,
          },
        },
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to ReUn.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (!pendingSignup || resendCooldown > 0) return;
    
    setIsLoading(true);
    
    try {
      await requestOTP(pendingSignup.email);
      setResendCooldown(60);
      setOtpCode("");
      toast({
        title: "Code resent",
        description: `New verification code sent to ${pendingSignup.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleBackToForm = () => {
    setSignupStep("form");
    setOtpCode("");
    setPendingSignup(null);
  };


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="w-full max-w-md shadow-2xl border-2 relative z-10 backdrop-blur-sm bg-card/95 animate-fade-in-up">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <div className="p-4 bg-gradient-to-br from-primary to-primary-glow rounded-2xl shadow-lg">
                <Users className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to ReUn
            </CardTitle>
            <CardDescription className="text-base">Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      OR
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                       Continue with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {signupStep === "form" ? (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Must contain: 1 uppercase letter, 1 number or special character
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        name="confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <SimpleCaptcha onVerify={handleCaptchaVerify} />
                    
                    <Button 
                      type="submit" 
                      className="w-full shadow-lg hover:shadow-xl transition-all" 
                      disabled={isLoading || !captchaVerified}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                       Continue with Google
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToForm}
                      className="mb-2 -ml-2"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Check your email</h3>
                      <p className="text-sm text-muted-foreground">
                        We sent a 6-digit code to<br />
                        <span className="font-medium text-foreground">{pendingSignup?.email}</span>
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={(value) => setOtpCode(value)}
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

                    <Button
                      onClick={handleVerifyOTP}
                      className="w-full"
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Create Account"
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Didn't receive the code?
                      </p>
                      <Button
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-primary"
                      >
                        {resendCooldown > 0 
                          ? `Resend in ${resendCooldown}s` 
                          : "Resend code"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
