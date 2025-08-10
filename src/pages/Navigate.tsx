
import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CameraView from "@/components/navigation/CameraView";
import { MapPin, Navigation, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Navigate = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [isFloorPlanExpanded, setIsFloorPlanExpanded] = useState(false);
  const [destination, setDestination] = useState("");
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Navigation steps with voice guidance
  const navigationSteps = [
    { instruction: "Go straight", duration: 5000, arrow: "↑", voice: "Go straight ahead for 50 meters" },
    { instruction: "Turn right", duration: 5000, arrow: "→", voice: "Turn right at the information desk" },
    { instruction: "Turn left", duration: 5000, arrow: "←", voice: "Turn left towards the elevator" },
    { instruction: "You have arrived at your destination", duration: 0, arrow: "🎯", voice: "You have arrived at your destination" }
  ];

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Check if we came from voice navigation
    const fromVoice = searchParams.get('fromVoice');
    const dest = searchParams.get('destination');
    
    if (fromVoice === 'true') {
      setDestination(dest || 'your destination');
      setShowFloorPlan(true);
      setShowConfirmDialog(true);
    }
  }, [searchParams]);

  // Handle navigation step progression
  useEffect(() => {
    if (!navigationStarted || currentStep >= navigationSteps.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      // Speak the next instruction
      if (currentStep + 1 < navigationSteps.length) {
        speak(navigationSteps[currentStep + 1].voice);
      }
    }, navigationSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [navigationStarted, currentStep]);

  const handleStartNavigation = () => {
    setShowConfirmDialog(false);
    setNavigationStarted(true);
    setCurrentStep(0);
    // Speak the first instruction
    speak(navigationSteps[0].voice);
    toast({
      title: "Navigation Started",
      description: `AR navigation to ${destination} is now active`,
    });
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setShowFloorPlan(false);
    window.speechSynthesis.cancel();
  };

  const toggleFloorPlanSize = () => {
    setIsFloorPlanExpanded(!isFloorPlanExpanded);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Header overlay - mobile optimized */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-primary text-primary-foreground">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Navigation Camera</span>
            <span className="ml-auto text-xs opacity-80 hidden sm:inline">Gov Health Portal</span>
          </div>
        </div>
      </div>
      
      {/* Camera view - fullscreen with mobile padding */}
      <div className="absolute inset-0 top-12">
        <CameraView className="w-full h-full" />
      </div>

      {/* Direction Arrow Overlay - Mobile optimized center display */}
      {navigationStarted && currentStep < navigationSteps.length && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="text-6xl sm:text-8xl md:text-9xl text-blue-400 drop-shadow-2xl animate-pulse">
            {navigationSteps[currentStep].arrow}
          </div>
        </div>
      )}

      {/* Navigation Instructions Overlay - Mobile optimized bottom center */}
      {navigationStarted && currentStep < navigationSteps.length && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-md text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 max-w-xs sm:max-w-sm mx-3 sm:mx-4">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-bold mb-1">Step {currentStep + 1} of {navigationSteps.length}</div>
            <div className="text-base sm:text-lg font-semibold text-blue-300 mb-2">
              {navigationSteps[currentStep].instruction}
            </div>
            {currentStep < navigationSteps.length - 1 && (
              <div className="text-xs text-gray-300 mb-2 sm:mb-3">
                Next: {Math.ceil(navigationSteps[currentStep].duration / 1000)}s
              </div>
            )}
            
            {/* Progress indicator */}
            <div className="flex justify-center gap-1.5">
              {navigationSteps.slice(0, -1).map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floor plan overlay - mobile optimized positioning */}
      {showFloorPlan && (
        <div className={`absolute top-16 right-3 z-45 bg-white/95 backdrop-blur border rounded-lg shadow-lg transition-all duration-300 ${
          isFloorPlanExpanded ? 'w-72 h-52 sm:w-80 sm:h-64' : 'w-40 h-28 sm:w-48 sm:h-36'
        }`}>
          <div className="relative w-full h-full p-2">
            <img 
              src="/lovable-uploads/9c4d3b77-3f3b-4e70-9928-8256513b019d.png"
              alt="Hospital Floor Plan"
              className="w-full h-full object-contain rounded"
            />
            
            {/* Floor plan controls */}
            <div className="absolute top-4 right-1 flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5 bg-white/90 hover:bg-white text-xs p-0"
                onClick={toggleFloorPlanSize}
              >
                <Maximize2 className="h-2.5 w-2.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5 bg-white/90 hover:bg-white text-xs p-0"
                onClick={() => setShowFloorPlan(false)}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>

            {/* Floor plan label */}
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Floor Plan
            </div>

            {/* Current step indicator on floor plan */}
            {navigationStarted && (
              <div className="absolute top-1 left-1 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
                Step {currentStep + 1}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Confirmation Dialog - centered and compact */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-primary" />
              Start Navigation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ready to start AR navigation to <span className="font-semibold text-foreground">{destination}</span>?
            </p>
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
              📍 Voice guidance and visual arrows will guide you step by step.
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleStartNavigation}
                className="flex-1 text-sm"
                size="sm"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Start
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancelNavigation}
                className="flex-1 text-sm"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navigate;
