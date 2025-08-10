import CameraView from "@/components/navigation/CameraView";
import { MapPin } from "lucide-react";

const Navigate = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-primary text-primary-foreground">
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
      
      {/* Camera view - fullscreen with header offset */}
      <div className="pt-10 h-full">
        <CameraView className="h-full" />
      </div>
    </div>
  );
};

export default Navigate;
