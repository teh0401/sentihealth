import AR3DNavigator from "@/components/navigation/AR3DNavigator";
import EnhancedARNavigator from "@/components/navigation/EnhancedARNavigator";
import ARCameraTest from "@/components/navigation/ARCameraTest";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera, Navigation } from "lucide-react";

const Navigate = () => {
  const [showTest, setShowTest] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(true);
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {showTest ? (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-28 sm:pb-24">
          {/* Header */}
          <div className="bg-card border rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">Camera Diagnostics</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Testing facility navigation camera systems</p>
              </div>
              <Button 
                onClick={() => setShowTest(false)}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Navigation</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </div>
          
          {/* Camera Test Component */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                Camera System Test
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Verify your device camera is functioning properly for AR navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ARCameraTest />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Main AR Navigation - Fullscreen */}
          <div className="fixed inset-0 overflow-hidden">
            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 z-40 bg-primary text-primary-foreground">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">
                    <span className="hidden sm:inline">Facility Navigation Active</span>
                    <span className="sm:hidden">Navigation Active</span>
                  </span>
                  <span className="ml-auto text-xs opacity-80 hidden sm:inline">Government Health Portal</span>
                </div>
              </div>
            </div>
            
            {useEnhanced ? (
              <EnhancedARNavigator autoStart={true} fullscreen={true} />
            ) : (
              <AR3DNavigator autoStart={true} fullscreen={true} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Navigate;
