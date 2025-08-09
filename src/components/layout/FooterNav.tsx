import { NavLink } from "react-router-dom";
import { Calendar, Map, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

const itemBase =
  "flex flex-col items-center gap-1 py-1 text-xs text-muted-foreground transition-transform duration-200 hover:scale-105";

const FooterNav = () => {
  return (
    <nav
      aria-label="Primary footer navigation"
      className="fixed inset-x-0 bottom-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow"
    >
      <ul className="max-w-screen-sm mx-auto grid grid-cols-3 px-4 py-2">
        <li>
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              cn(itemBase, isActive && "text-primary")
            }
            aria-label="Appointments"
          >
            <Calendar className="size-5" />
            <span>Appointments</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/navigate"
            className={({ isActive }) =>
              cn(itemBase, isActive && "text-primary")
            }
            aria-label="Navigate"
          >
            <Map className="size-5" />
            <span>Navigate</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/recovery"
            className={({ isActive }) =>
              cn(itemBase, isActive && "text-primary")
            }
            aria-label="Recovery"
          >
            <HeartPulse className="size-5" />
            <span>Recovery</span>
          </NavLink>
        </li>
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default FooterNav;
