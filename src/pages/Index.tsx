
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import { ArrowRight, Activity, Weight, Utensils, Calendar, Plus, Check } from "lucide-react";
import WeightGraph from "@/components/weight/WeightGraph";
import { format, subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  // Mock weight data for the chart
  const [weightData, setWeightData] = useState([
    { date: "May 1", weight: 72.5 },
    { date: "May 2", weight: 72.3 },
    { date: "May 3", weight: 72.1 },
    { date: "May 4", weight: 72.4 },
    { date: "May 5", weight: 72.0 },
    { date: "May 6", weight: 71.8 },
    { date: "May 7", weight: 71.6 },
  ]);

  const [weight, setWeight] = useState("");

  const handleAddWeight = () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return;
    
    const today = format(new Date(), "MMM d");
    const newWeightData = [...weightData];
    
    // Check if we already have an entry for today
    const todayIndex = newWeightData.findIndex(item => item.date === today);
    
    if (todayIndex >= 0) {
      newWeightData[todayIndex] = { date: today, weight: numWeight };
    } else {
      newWeightData.push({ date: today, weight: numWeight });
    }
    
    setWeightData(newWeightData);
    setWeight("");
    
    toast({
      description: "Weight added successfully.",
    });
  };

  // Mock data for upcoming meal and food to introduce
  const todaysFood = {
    name: "Oats",
    category: "Grains"
  };

  const nextMeal = {
    type: "lunch",
    time: "12:30 PM",
    food: "Grilled chicken with vegetables"
  };

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
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter your weight"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddWeight} className="flex-shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="h-44">
                <WeightGraph data={weightData} />
              </div>
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
                <h3 className="font-medium mb-2">Food to Introduce Today</h3>
                {todaysFood ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">{todaysFood.name}</p>
                      <p className="text-xs text-muted-foreground">{todaysFood.category}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No food scheduled for introduction today</p>
                )}
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Next Meal</h3>
                {nextMeal ? (
                  <div>
                    <p className="text-sm font-medium capitalize">{nextMeal.type} ({nextMeal.time})</p>
                    <p className="text-sm">{nextMeal.food}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming meals planned</p>
                )}
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
