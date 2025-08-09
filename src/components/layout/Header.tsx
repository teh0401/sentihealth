import { Link } from "react-router-dom";
import AccessibilityToggle from "@/components/AccessibilityToggle";
import { Building2, Shield, Globe } from "lucide-react";
import SignInMyDigitalID from "@/components/auth/SignInMyDigitalID";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const Header = () => {
  const { language, toggleLanguage, getText } = useLanguage();

  return (
    <header className="w-full sticky top-0 z-40 bg-white shadow-md border-b border-blue-100">
      {/* Official Government Header Bar */}
      <div className="bg-gradient-to-r from-primary via-primary to-blue-700 text-white">
        <div className="max-w-screen-xl mx-auto px-3 py-1.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium truncate">
              {getText("Portal Kesihatan Rasmi", "Official Health Portal")}
            </span>
            <div className="flex items-center gap-1.5">
              <Shield className="size-3 sm:size-4 flex-shrink-0" />
              <span className="hidden xs:inline">
                {getText("Selamat", "Secure")}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="bg-white">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-3 h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1" aria-label="Hospital home">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white grid place-items-center shadow-md flex-shrink-0">
              <Building2 className="size-5 sm:size-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-lg text-gray-800 truncate">
                {getText("Hospital Malaysia", "Malaysian Hospital")}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 font-medium truncate hidden sm:block">
                {getText("Sistem Pesakit", "Patient System")}
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1.5 border-primary/20 hover:bg-primary/5 h-8 px-2.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{language.toUpperCase()}</span>
            </Button>
            <div className="hidden md:block">
              <SignInMyDigitalID />
            </div>
            <AccessibilityToggle />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
