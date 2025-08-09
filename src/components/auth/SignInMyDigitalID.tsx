import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const SignInMyDigitalID = () => {
  const [signedIn, setSignedIn] = useState<boolean>(() => {
    try { return localStorage.getItem('signedIn') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('signedIn', signedIn ? '1' : '0'); } catch {}
  }, [signedIn]);

  const handleClick = () => {
    if (!signedIn) {
      setSignedIn(true);
      toast({ title: 'Signed in', description: 'Authenticated with MyDigital ID (demo).' });
    } else {
      setSignedIn(false);
      toast({ title: 'Signed out', description: 'You have been signed out.' });
    }
  };

  return (
    <Button onClick={handleClick} variant="ghost" aria-pressed={signedIn}>
      <ShieldCheck className="mr-2 size-4" /> {signedIn ? 'MyDigital ID' : 'MyDigital ID'}
    </Button>
  );
};

export default SignInMyDigitalID;
