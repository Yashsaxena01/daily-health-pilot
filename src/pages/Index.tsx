
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import { ArrowRight, Activity, Weight, Utensils, Calendar, Plus, Check } from "lucide-react";
import WeightGraph from "@/components/weight/WeightGraph";
import { format, parse, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import useLocalStorage from "@/hooks/useLocalStorage";

const Index = () => {
  // Share the same localStorage key as the Weight page for consistency
  const [weightData, setWeightData] = useLocalStorage<{date: string, weight: number}[]>("weightData", []);
  const [scheduleItems, setScheduleItems] = useLocalStorage<any[]>("scheduleItems", []);
  const [mealPlans, setMealPlans] = useLocalStorage<any[]>("mealPlans", []);
  
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

  // Get today's schedule items
  const todaysSchedule = scheduleItems.filter(item => !item.completed).slice(0, 3);
  
  // Get today's meal plan
  const today = format(new Date(), "yyyy-MM-dd");
  const todayMealPlan = mealPlans.find(plan => plan.date === today);
  const upcomingMeals = todayMealPlan?.meals?.filter(meal => !meal.completed).slice(0, 2) || [];

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hey Yash,</h1>
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
                {false ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">Food item</p>
                      <p className="text-xs text-muted-foreground">Category</p>
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
                <h3 className="font-medium mb-2">Upcoming Meals</h3>
                {upcomingMeals.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingMeals.map((meal, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium capitalize">{meal.title} ({meal.time})</p>
                        {meal.description && (
                          <p className="text-xs text-muted-foreground">{meal.description}</p>
                        )}
                      </div>
                    ))}
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
              {todaysSchedule.length > 0 ? (
                <div className="space-y-1">
                  {todaysSchedule.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <p className="text-sm flex-1">{item.title} <span className="text-xs text-muted-foreground">({item.time})</span></p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No activities scheduled for today. Add some in the Schedule section.
                </p>
              )}
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
              {todaysSchedule.length > 0 ? (
                <div className="space-y-1">
                  {todaysSchedule.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <p className="text-xs whitespace-nowrap text-muted-foreground">{item.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No schedule items for today. Add some in the Schedule section.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Index;
