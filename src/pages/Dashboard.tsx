
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Weight, Utensils, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Good morning! 👋
        </h1>
        <p className="text-gray-600">{today}</p>
      </div>

      <div className="space-y-4">
        <Link to="/weight">
          <Card className="border-0 shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Weight className="h-5 w-5 mr-2" />
                Weight Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100">Track your daily weight progress</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">View trends & add entries</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/food">
          <Card className="border-0 shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Utensils className="h-5 w-5 mr-2" />
                Elimination Diet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100">Track food introductions & reactions</p>
              <div className="flex items-center mt-2">
                <span className="text-sm">Today's food plan & reactions</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/schedule">
          <Card className="border-0 shadow-md bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Daily Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100">Plan and track your daily activities</p>
              <div className="flex items-center mt-2">
                <span className="text-sm">Create habits & stay consistent</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
