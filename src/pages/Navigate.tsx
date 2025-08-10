import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CameraView from "@/components/navigation/CameraView";
import { MapPin, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Navigate = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [destination, setDestination] = useState("");
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

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

  const handleStartNavigation = () => {
    setShowConfirmDialog(false);
    setShowFloorPlan(false);
    toast({
      title: "Navigation Started",
      description: `AR navigation to ${destination} is now active`,
    });
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setShowFloorPlan(false);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-primary text-primary-foreground">
        <div className="px-3 sm:px-4 py-1.5 sm:py-2">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-medium">
              <span className="hidden sm:inline">Facility Navigation Camera</span>
              <span className="sm:hidden">Navigation Camera</span>
            </span>
            <span className="ml-auto text-xs opacity-80 hidden sm:inline">Government Health Portal</span>
          </div>
        </div>
      </div>
      
      {/* Floor plan overlay */}
      {showFloorPlan && (
        <div className="absolute inset-0 top-10 z-40 bg-white flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <img 
              src="/lovable-uploads/9c4d3b77-3f3b-4e70-9928-8256513b019d.png"
              alt="Hospital Floor Plan"
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close button for floor plan */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/90"
              onClick={() => setShowFloorPlan(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Camera view - fullscreen */}
      <div className="absolute inset-0 top-10">
        <CameraView className="w-full h-full" />
      </div>

      {/* Navigation Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Start Navigation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to start AR navigation to <span className="font-semibold text-foreground">{destination}</span>?
            </p>
            
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              📍 The floor plan shows your route. AR overlays will guide you step by step once you start.
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleStartNavigation}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancelNavigation}
                className="flex-1"
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
