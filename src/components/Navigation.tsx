
import { Link, useLocation } from "react-router-dom";
import { Home, Weight, Utensils, Calendar } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive("/")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          to="/weight"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive("/weight")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Weight className="h-5 w-5" />
          <span className="text-xs mt-1">Weight</span>
        </Link>
        
        <Link
          to="/food"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive("/food")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span className="text-xs mt-1">Food</span>
        </Link>
        
        <Link
          to="/schedule"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive("/schedule")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Schedule</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
