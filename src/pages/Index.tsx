
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import { ArrowRight, Activity, Weight, Utensils, Calendar } from "lucide-react";
import WeightGraph from "@/components/weight/WeightGraph";

const Index = () => {
  // Mock weight data for the chart
  const [weightData] = useState([
    { date: "May 1", weight: 72.5 },
    { date: "May 2", weight: 72.3 },
    { date: "May 3", weight: 72.1 },
    { date: "May 4", weight: 72.4 },
    { date: "May 5", weight: 72.0 },
    { date: "May 6", weight: 71.8 },
    { date: "May 7", weight: 71.6 },
  ]);

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hi Yash,</h1>
        <p className="text-muted-foreground mt-2 italic">
          "One cheat meal will set you back to 5 days of hard work."
        </p>
      </div>

      <div className="grid gap-6 pb-24">
        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium flex items-center">
              <Weight className="mr-2 h-5 w-5" />
              Weight Tracking
            </CardTitle>
            <Link to="/weight">
              <Button variant="ghost" size="sm" className="gap-1">
                Details <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <WeightGraph data={weightData} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium flex items-center">
              <Utensils className="mr-2 h-5 w-5" />
              Food Tracking
            </CardTitle>
            <Link to="/food">
              <Button variant="ghost" size="sm" className="gap-1">
                Go to page <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Today's Meals</h3>
                <p className="text-sm text-muted-foreground">
                  Log your meals and track your nutrition
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Elimination Diet</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your food reintroduction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Activity & Exercise
            </CardTitle>
            <Link to="/schedule">
              <Button variant="ghost" size="sm" className="gap-1">
                Go to page <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="font-medium mb-2">Today's Activities</h3>
              <p className="text-sm text-muted-foreground">
                Track your workouts and physical activities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Daily Schedule
            </CardTitle>
            <Link to="/schedule">
              <Button variant="ghost" size="sm" className="gap-1">
                Go to page <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="font-medium mb-2">Today's Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Manage your daily routine and reminders
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Index;
