// SEO: Single H1 and accessible structure
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, MapPin, HeartHandshake, UserPlus, Info, MessageCircle, X, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import StandardVoiceButton from "@/components/voice/StandardVoiceButton";

const Index = () => {
  const { getText } = useLanguage();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    try {
      setIsSignedIn(localStorage.getItem('digitalId_signedIn') === '1');
    } catch {}
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Info Banner */}
      <section className="bg-gradient-to-r from-amber-100 to-amber-50 border-b border-amber-200">
        <div className="max-w-screen-xl mx-auto px-3 py-2">
          <div className="text-center overflow-hidden">
            <div className="animate-pulse">
              <span className="text-xs sm:text-sm font-medium text-amber-800 block">
                {getText(
                  "🏥 Waktu: Isnin-Jumaat 8PG-5PTG | Kecemasan 24/7",
                  "🏥 Hours: Mon-Fri 8AM-5PM | Emergency 24/7"
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="relative">
        <div className="max-w-screen-xl mx-auto px-3 py-8 sm:py-12">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Hospital Logo */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-lg border-2 border-white overflow-hidden">
                <img 
                  src="/lovable-uploads/67edb71a-1786-42fd-962d-e050d5f59e49.png" 
                  alt="Hospital Malaysia Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight px-2">
                {getText(
                  "Selamat Datang ke Hospital Malaysia",
                  "Welcome to Malaysian Hospital"
                )}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                {getText(
                  "Panduan Pendaftaran Pesakit",
                  "Patient Registration Guide"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MyDigital ID Section - Only show if not signed in */}
      {!isSignedIn && (
        <section className="max-w-screen-xl mx-auto px-3 py-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {getText("Masuk dengan MyDigital ID", "Sign In with MyDigital ID")}
                </h2>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                  {getText(
                    "Akses selamat ke perkhidmatan kesihatan dengan identiti digital rasmi Malaysia",
                    "Secure access to healthcare services with your official Malaysian digital identity"
                  )}
                </p>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {getText("Disahkan Kerajaan", "Government Verified")}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {getText("Selamat & Peribadi", "Secure & Private")}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {getText("Biometrik", "Biometric")}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link to="/signin">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    {getText("Masuk Sekarang", "Sign In Now")}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Cards */}
      <section className="max-w-screen-xl mx-auto px-3 py-6 sm:py-8">        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* New Patient Registration */}
          <Link to="/appointments" className="group touch-manipulation">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-100 hover:border-blue-200 active:scale-95">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                    {getText("Pesakit Baharu", "New Patient")}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {getText(
                      "Pendaftaran mudah dan pantas",
                      "Easy and quick registration"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Check Appointment */}
          <Link to="/navigate" className="group touch-manipulation">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-100 hover:border-blue-200 active:scale-95">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                    {getText("Semak Temujanji", "Check Appointment")}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {getText(
                      "Urus temujanji anda",
                      "Manage your appointments"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Guides & Information */}
          <Link to="/recovery" className="group touch-manipulation sm:col-span-2 lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-100 hover:border-blue-200 active:scale-95">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Info className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                    {getText("Panduan & Maklumat", "Guides & Info")}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {getText(
                      "Maklumat penting hospital",
                      "Important hospital information"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="bg-gradient-to-r from-red-50 to-red-100 border-t border-red-200 pb-24">
        <div className="max-w-screen-xl mx-auto px-3 py-8 sm:py-12 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6">
            {getText("Kecemasan?", "Emergency?")}
          </h2>
          <Button 
            size="lg" 
            className="w-full max-w-xs h-14 sm:h-16 px-6 sm:px-8 text-lg sm:text-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg active:scale-95 transition-all"
          >
            {getText("Panggil 999", "Call 999")}
          </Button>
        </div>
      </section>

      {/* Standard Voice Button */}
      <StandardVoiceButton />
    </main>
  );
};

export default Index;
