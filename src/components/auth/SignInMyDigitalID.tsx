import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, IdCard, QrCode, User, Lock, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

interface SignInMyDigitalIDProps {
  iconOnly?: boolean;
}

const SignInMyDigitalID = ({ iconOnly = false }: SignInMyDigitalIDProps) => {
  const [signedIn, setSignedIn] = useState<boolean>(() => {
    try { return localStorage.getItem('digitalId_signedIn') === '1'; } catch { return false; }
  });
  
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'biometric'>('login');
  const [credentials, setCredentials] = useState({ icNumber: '' });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('digitalId_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try { 
      localStorage.setItem('digitalId_signedIn', signedIn ? '1' : '0'); 
      if (userProfile) {
        localStorage.setItem('digitalId_profile', JSON.stringify(userProfile));
      }
    } catch {}
  }, [signedIn, userProfile]);

  const mockLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock user profile
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
    setSignedIn(true);

    // Establish Supabase session so Storage policies allow uploads
    await ensureSupabaseSession();

    setShowDialog(false);
    setStep('login');
    setCredentials({ icNumber: '' });
    
    toast({ 
      title: 'Login Successful', 
      description: `Welcome back, ${profile.name}! You are now authenticated with MyDigital ID.`,
      duration: 4000
    });
    setIsLoading(false);
  };

  const handleSignOut = () => {
    setSignedIn(false);
    setUserProfile(null);
    try {
      localStorage.removeItem('digitalId_profile');
    } catch {}
    toast({ 
      title: 'Signed Out', 
      description: 'You have been successfully signed out of MyDigital ID.' 
    });
  };

  const resetDialog = () => {
    setStep('login');
    setCredentials({ icNumber: '' });
  };

  const getVerificationBadge = (level: string) => {
    const config = {
      basic: { color: 'bg-yellow-100 text-yellow-800', text: 'Basic' },
      enhanced: { color: 'bg-blue-100 text-blue-800', text: 'Enhanced' },
      premium: { color: 'bg-green-100 text-green-800', text: 'Premium' }
    };
    return config[level as keyof typeof config] || config.basic;
  };

  if (signedIn && userProfile) {
    if (iconOnly) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <button className="p-0 border-0 bg-transparent">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                MyDigital ID Profile
              </DialogTitle>
            </DialogHeader>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{userProfile.name}</CardTitle>
                  <Badge className={getVerificationBadge(userProfile.verificationLevel).color}>
                    {getVerificationBadge(userProfile.verificationLevel).text}
                  </Badge>
                </div>
                <CardDescription>ID: {userProfile.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="pt-3 border-t">
                  <Button onClick={handleSignOut} variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      );
    }
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="hidden md:inline">MyDigital ID</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              MyDigital ID Profile
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{userProfile.name}</CardTitle>
                <Badge className={getVerificationBadge(userProfile.verificationLevel).color}>
                  {getVerificationBadge(userProfile.verificationLevel).text}
                </Badge>
              </div>
              <CardDescription>ID: {userProfile.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <div className="pt-3 border-t">
                <Button onClick={handleSignOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  if (iconOnly) {
    return (
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetDialog();
      }}>
        <DialogTrigger asChild>
          <button className="p-0 border-0 bg-transparent">
            <ShieldCheck className="size-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <IdCard className="h-4 w-4 text-white" />
              </div>
              MyDigital ID Login
            </DialogTitle>
            <DialogDescription>
              Secure authentication with your Malaysian Digital Identity
            </DialogDescription>
          </DialogHeader>

          {step === 'login' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ic">IC Number / Passport</Label>
                <Input
                  id="ic"
                  placeholder="123456-78-9012"
                  value={credentials.icNumber}
                  onChange={(e) => setCredentials(prev => ({ ...prev, icNumber: e.target.value }))}
                />
              </div>
              
              <Button onClick={mockLogin} disabled={isLoading || !credentials.icNumber} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Login with MyDigital ID
                  </>
                )}
              </Button>
              <div className="text-center space-y-2">
                <div className="text-sm text-gray-500">
                  Demo: Use any IC number (8+ digits)
                </div>
                <Link 
                  to="/signin" 
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Full Sign-In Experience
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {step === 'biometric' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Biometric Verification</h3>
                <p className="text-sm text-gray-500">
                  Complete your login with biometric authentication
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Facial Recognition</p>
                    <p className="text-xs text-gray-600">Scanning biometric data...</p>
                  </div>
                  <div className="ml-auto">
                    <div className="h-6 w-6 rounded-full bg-green-100 animate-pulse" />
                  </div>
                </div>
              </div>
              <Button onClick={completeBiometric} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Authentication
                  </>
                )}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Demo: Click to complete the authentication process
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={(open) => {
      setShowDialog(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden md:inline">MyDigital ID</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <IdCard className="h-4 w-4 text-white" />
            </div>
            MyDigital ID Login
          </DialogTitle>
          <DialogDescription>
            Secure authentication with your Malaysian Digital Identity
          </DialogDescription>
        </DialogHeader>

        {step === 'login' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ic">IC Number / Passport</Label>
              <Input
                id="ic"
                placeholder="123456-78-9012"
                value={credentials.icNumber}
                onChange={(e) => setCredentials(prev => ({ ...prev, icNumber: e.target.value }))}
              />
            </div>
            
            <Button onClick={mockLogin} disabled={isLoading || !credentials.icNumber} className="w-full">
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Login with MyDigital ID
                </>
              )}
            </Button>
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-500">
                Demo: Use any IC number (8+ digits)
              </div>
              <Link 
                to="/signin" 
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Full Sign-In Experience
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {step === 'biometric' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Biometric Verification</h3>
              <p className="text-sm text-gray-500">
                Complete your login with biometric authentication
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Facial Recognition</p>
                  <p className="text-xs text-gray-600">Scanning biometric data...</p>
                </div>
                <div className="ml-auto">
                  <div className="h-6 w-6 rounded-full bg-green-100 animate-pulse" />
                </div>
              </div>
            </div>
            <Button onClick={completeBiometric} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Authentication
                </>
              )}
            </Button>
            <div className="text-center text-sm text-gray-500">
              Demo: Click to complete the authentication process
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignInMyDigitalID;
