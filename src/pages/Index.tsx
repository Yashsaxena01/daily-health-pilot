
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import { ArrowRight, Activity, Weight, Utensils, Calendar, Plus, Check } from "lucide-react";
import WeightGraph from "@/components/weight/WeightGraph";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const Index = () => {
  const [weightData, setWeightData] = useState<{date: string, weight: number}[]>([]);
  const [weight, setWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleAddWeight = () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return;
    
    const dateStr = selectedDate ? format(selectedDate, "MMM d") : format(new Date(), "MMM d");
    const newWeightData = [...weightData];
    
    // Check if we already have an entry for today
    const dateIndex = newWeightData.findIndex(item => item.date === dateStr);
    
    if (dateIndex >= 0) {
      newWeightData[dateIndex] = { date: dateStr, weight: numWeight };
    } else {
      newWeightData.push({ date: dateStr, weight: numWeight });
    }
    
    setWeightData(newWeightData);
    setWeight("");
    
    toast({
      description: "Weight added successfully.",
    });
  };

  // Empty states for a new user
  const todaysFood = undefined;
  const nextMeal = undefined;

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hi there,</h1>
        <p className="text-muted-foreground mt-2 italic">
          "Track your diet and weight to improve your health journey."
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-full sm:flex-1">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter your weight"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleAddWeight} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Weight
                </Button>
              </div>
              
              {weightData.length > 0 ? (
                <div className="h-44">
                  <WeightGraph data={weightData} />
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-muted-foreground flex-col">
                  <p>No weight data recorded yet</p>
                  <p className="text-sm">Add your first entry to see your progress graph</p>
                </div>
              )}
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
                  <p className="text-sm text-muted-foreground">
                    No food scheduled for introduction today. Start your elimination diet in the Food section.
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    No upcoming meals planned. Create your meal plan in the Food section.
                  </p>
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
                Track your workouts and physical activities in the Schedule section
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
                Manage your daily routine and reminders in the Schedule section
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Index;
