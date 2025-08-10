import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { EmailSignInForm } from "@/components/auth/EmailSignInForm";
import { 
  ShieldCheck, 
  IdCard, 
  QrCode, 
  User, 
  Lock, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Building2,
  Fingerprint,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StandardVoiceButton from "@/components/voice/StandardVoiceButton";

interface UserProfile {
  id: string;
  name: string;
  icNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
}

const SignIn = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'login' | 'biometric' | 'success' | 'signup'>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ icNumber: '' });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Check if already signed in
  useEffect(() => {
    try {
      const signedIn = localStorage.getItem('digitalId_signedIn') === '1';
      const profile = localStorage.getItem('digitalId_profile');
      
      if (signedIn && profile) {
        setUserProfile(JSON.parse(profile));
        setStep('success');
      }
    } catch {}
  }, []);

  const mockLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (credentials.icNumber.length >= 8) {
      setStep('biometric');
      toast({ 
        title: 'IC Verified', 
        description: 'Please complete biometric verification to secure your login.' 
      });
    } else {
      toast({ 
        title: 'Invalid IC Number', 
        description: 'Please enter a valid IC number.', 
        variant: 'destructive' 
      });
    }
    setIsLoading(false);
  };

  async function ensureSupabaseSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return;
      const maybeAnon = (supabase.auth as unknown as { signInAnonymously?: () => Promise<any> }).signInAnonymously;
      if (typeof maybeAnon === 'function') {
        const { error } = await maybeAnon();
        if (error) throw error;
      }
    } catch (e: any) {
      console.error('Supabase session error:', e);
      toast({ title: 'Session warning', description: 'Could not establish a secure session for uploads.', variant: 'destructive' });
    }
  }

  const completeBiometric = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const profile: UserProfile = {
      id: 'MY' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: 'Ahmad Bin Abdullah',
      icNumber: credentials.icNumber || '123456-78-9012',
      email: 'ahmad.abdullah@email.com',
      phone: '+60123456789',
      dateOfBirth: '1985-05-15',
      nationality: 'Malaysian',
      verificationLevel: 'enhanced'
    };
    
    setUserProfile(profile);
    
    try {
      localStorage.setItem('digitalId_signedIn', '1');
      localStorage.setItem('digitalId_profile', JSON.stringify(profile));
    } catch {}

    // Ensure Supabase session available for Storage policies
    await ensureSupabaseSession();
    
    setStep('success');
    
    toast({ 
      title: 'Login Successful', 
      description: `Welcome ${profile.name}! You are now authenticated with MyDigital ID.`,
      duration: 5000
    });
    setIsLoading(false);
  };

  const resetFlow = () => {
    setStep('welcome');
    setCredentials({ icNumber: '' });
  };

  const getVerificationBadge = (level: string) => {
    const config = {
      basic: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Basic Verified' },
      enhanced: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Enhanced Verified' },
      premium: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Premium Verified' }
    };
    return config[level as keyof typeof config] || config.basic;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-24">
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white grid place-items-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">Hospital Malaysia</h1>
              <p className="text-xs text-gray-600">Patient Authentication</p>
            </div>
          </div>
        </div>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="space-y-6">
            <EmailSignInForm 
              onSuccess={() => {
                toast({
                  title: "Sign in successful",
                  description: "Welcome back!",
                });
                navigate('/');
              }}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Card className="border-2 border-blue-100">
              <CardContent className="pt-6">
                <Button 
                  onClick={() => setStep('login')} 
                  className="w-full h-12"
                  variant="outline"
                >
                  <IdCard className="mr-2 h-5 w-5" />
                  MyDigital ID (Demo)
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="px-0"
                  onClick={() => setStep('signup')}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </div>
        )}

        {/* Login Step */}
        {step === 'login' && (
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-blue-600" />
                Enter Your Credentials
              </CardTitle>
              <CardDescription>
                Use your IC number to authenticate with MyDigital ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ic">IC Number / Passport</Label>
                <Input
                  id="ic"
                  placeholder="123456-78-9012"
                  value={credentials.icNumber}
                  onChange={(e) => setCredentials(prev => ({ ...prev, icNumber: e.target.value }))}
                  className="h-12"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={mockLogin} 
                  disabled={isLoading || !credentials.icNumber} 
                  className="w-full h-12"
                >
                  {isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={resetFlow} 
                  variant="outline" 
                  className="w-full"
                >
                  Back
                </Button>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Demo Mode:</strong> Use any IC number (8+ digits) to continue
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Biometric Step */}
        {step === 'biometric' && (
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <QrCode className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>
                Complete your secure login with biometric verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">Facial Recognition</p>
                    <p className="text-sm text-green-600">Analyzing biometric patterns...</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-green-200 animate-pulse" />
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={completeBiometric} 
                  disabled={isLoading} 
                  className="w-full h-12"
                >
                  {isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing Biometrics...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Authentication
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => setStep('login')} 
                  variant="outline" 
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  <strong>Demo:</strong> Click "Complete Authentication" to finish the login process
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign Up Step */}
        {step === 'signup' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('welcome')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">Create Account</h2>
            </div>

            <SignUpForm 
              onSuccess={() => {
                toast({
                  title: "Account created",
                  description: "Please check your email to verify your account.",
                });
                setStep('welcome');
              }}
              onCancel={() => setStep('welcome')}
            />
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && userProfile && (
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-green-800">Login Successful!</CardTitle>
              <CardDescription>
                You are now authenticated with MyDigital ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{userProfile.name}</CardTitle>
                    <Badge className={getVerificationBadge(userProfile.verificationLevel).color}>
                      {getVerificationBadge(userProfile.verificationLevel).text}
                    </Badge>
                  </div>
                  <CardDescription>Digital ID: {userProfile.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">IC Number</Label>
                      <p className="font-medium">{userProfile.icNumber}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Date of Birth</Label>
                      <p className="font-medium">{userProfile.dateOfBirth}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="font-medium text-xs">{userProfile.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Phone</Label>
                      <p className="font-medium">{userProfile.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/appointments')} 
                  className="w-full h-12"
                >
                  Continue to Appointments
                </Button>
                
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="w-full"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Standard Voice Button */}
      <StandardVoiceButton />
    </div>
  );
};

export default SignIn;
