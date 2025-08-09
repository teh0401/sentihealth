import { NavLink } from "react-router-dom";
import { Calendar, Map, HeartPulse, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import SignInMyDigitalID from "@/components/auth/SignInMyDigitalID";

const itemBase =
  "flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground transition-all duration-200 hover:text-primary";

const FooterNav = () => {
  return (
    <nav
      aria-label="Primary footer navigation"
      className="fixed inset-x-0 bottom-0 z-30 bg-background border-t border-border shadow-formal"
    >
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
        <div className="max-w-screen-sm mx-auto px-4 py-1">
          <div className="text-center text-xs text-muted-foreground">
            MOH Digital Portal Navigation
          </div>
        </div>
      </div>
      <ul className="max-w-screen-sm mx-auto grid grid-cols-4 px-4 py-2">
        <li>
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              cn(
                itemBase,
                isActive && "text-primary bg-primary/5 rounded-lg font-medium"
              )
            }
            aria-label="Medical Appointments"
          >
            <Calendar className="size-5" />
            <span>Appointments</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/navigate"
            className={({ isActive }) =>
              cn(
                itemBase,
                isActive && "text-primary bg-primary/5 rounded-lg font-medium"
              )
            }
            aria-label="Facility Navigation"
          >
            <Map className="size-5" />
            <span>Navigate</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/recovery"
            className={({ isActive }) =>
              cn(
                itemBase,
                isActive && "text-primary bg-primary/5 rounded-lg font-medium"
              )
            }
            aria-label="Recovery Programs"
          >
            <HeartPulse className="size-5" />
            <span>Recovery</span>
          </NavLink>
        </li>
        <li className="md:hidden">
          <div className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary transition-all duration-200">
            <SignInMyDigitalID iconOnly />
            <span>MyID</span>
          </div>
        </li>
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default FooterNav;
