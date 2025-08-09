import AR3DNavigator from "@/components/navigation/AR3DNavigator";
import ARCameraTest from "@/components/navigation/ARCameraTest";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navigate = () => {
  const [showTest, setShowTest] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {showTest ? (
        <div className="p-4">
          <Button 
            onClick={() => setShowTest(false)}
            variant="outline"
            className="mb-4"
          >
            ← Back to AR Navigation
          </Button>
          <ARCameraTest />
        </div>
      ) : (
        <>
          <div className="absolute top-4 right-4 z-50">
            <Button 
              onClick={() => setShowTest(true)}
              variant="outline"
              size="sm"
            >
              Camera Test
            </Button>
          </div>
          <AR3DNavigator autoStart={true} fullscreen={true} />
        </>
      )}
    </div>
  );
};

export default Navigate;
