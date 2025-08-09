import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

const AccessibilityToggle = () => {
  const { enabled, toggle } = useAccessibility();
  return (
    <Button
      aria-pressed={enabled}
      aria-label={enabled ? "Disable accessibility mode" : "Enable accessibility mode"}
      onClick={toggle}
      variant="access"
      size="sm"
      className="rounded-full px-3"
    >
      {enabled ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      <span className="sr-only">Accessibility</span>
    </Button>
  );
};

export default AccessibilityToggle;
