
import { Link } from "react-router-dom";
import { Activity, Home, Utensils, Calendar, Weight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AppNavbar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Weight, label: "Weight", path: "/weight" },
    { icon: Utensils, label: "Food", path: "/food" },
    { icon: Activity, label: "Schedule", path: "/schedule" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl border-t border-muted z-10">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "fill-primary/10" : "")} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppNavbar;
