import { Link } from "react-router-dom";
import AccessibilityToggle from "@/components/AccessibilityToggle";
import { Stethoscope } from "lucide-react";
import SignInMyDigitalID from "@/components/auth/SignInMyDigitalID";

const Header = () => {
  return (
    <header className="w-full sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2" aria-label="SentiHealth home">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary grid place-items-center">
            <Stethoscope className="size-5" />
          </div>
          <span className="font-semibold tracking-tight">SentiHealth</span>
        </Link>
        <div className="flex items-center gap-2">
          <SignInMyDigitalID />
          <AccessibilityToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
