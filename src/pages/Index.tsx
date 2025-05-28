
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import TodaysFoodIntroduction from "@/components/food/TodaysFoodIntroduction";
import { ArrowRight, Activity, Weight, Plus, Check } from "lucide-react";
import WeightGraph from "@/components/weight/WeightGraph";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useWeightData } from "@/hooks/useWeightData";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { useEliminationDiet } from "@/hooks/useEliminationDiet";

const Index = () => {
  const { weightData, addWeightEntry, refreshWeightData } = useWeightData();
  const { getTodaysItems, refreshScheduleItems, updateScheduleItem } = useScheduleItems();
  const { getTodaysFood, refreshEliminationDiet } = useEliminationDiet();
  
  const [weight, setWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [weightView, setWeightView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currentGraphDate, setCurrentGraphDate] = useState<Date>(new Date());

  // Refresh data on page load and set up periodic refresh
  useEffect(() => {
    const refreshAllData = async () => {
      console.log("Refreshing all data...");
      await Promise.all([
        refreshWeightData(),
        refreshScheduleItems(),
        refreshEliminationDiet()
      ]);
    };
    
    refreshAllData();
    
    // Set up periodic refresh every 10 seconds
    const interval = setInterval(refreshAllData, 10000);
    
    return () => clearInterval(interval);
  }, [refreshWeightData, refreshScheduleItems, refreshEliminationDiet]);
  
  const handleAddWeight = async () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) {
      toast({
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }
    
    await addWeightEntry(selectedDate || new Date(), numWeight);
    setWeight("");
    toast({
      description: "Weight added successfully",
    });
  };

  const handleToggleActivity = async (item: any) => {
    if (!item.id) return;
    
    console.log("Toggling activity:", item.id, "from", item.completed, "to", !item.completed);
    
    const success = await updateScheduleItem(item.id, { 
      completed: !item.completed 
    });
    
    if (success) {
      toast({
        description: item.completed ? "Activity marked as incomplete" : "Activity completed!",
      });
      // Force refresh after a short delay to ensure data is updated
      setTimeout(() => {
        refreshScheduleItems();
      }, 500);
    }
  };

  // Get today's data - force refresh to get latest data
  const todaysSchedule = getTodaysItems();
  const todaysFood = getTodaysFood();
  
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
            <div className="flex items-center gap-2">
              <div className="flex bg-secondary rounded-lg overflow-hidden">
                {(["daily", "weekly", "monthly"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setWeightView(v)}
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                      weightView === v 
                        ? "bg-orange-500 text-white" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <Link to="/weight">
                <Button variant="ghost" size="sm" className="gap-1">
                  Details <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddWeight();
                      }
                    }}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
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
                <Button onClick={handleAddWeight} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Weight
                </Button>
              </div>
              
              {weightData.length > 0 ? (
                <div className="h-44">
                  <WeightGraph 
                    data={weightData} 
                    view={weightView}
                    currentDate={currentGraphDate}
                    onDateChange={setCurrentGraphDate}
                    showNavigation={true}
                  />
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

        <TodaysFoodIntroduction />

        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Today's Activities
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
                <div className="space-y-2">
                  {todaysSchedule.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center gap-2 group">
                      <button
                        onClick={() => handleToggleActivity(item)}
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.completed 
                            ? 'bg-orange-500 border-orange-500' 
                            : 'border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        {item.completed && <Check className="h-2 w-2 text-white" />}
                      </button>
                      <p className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title} 
                        <span className="text-xs text-muted-foreground">
                          {item.time ? ` (${item.time})` : ''}
                          {item.repeatFrequency && item.repeatFrequency !== 'none' ? ` • ${item.repeatFrequency}` : ''}
                        </span>
                      </p>
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
      </div>
    </PageContainer>
  );
};

export default Index;
