
import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import ActivityTracker from "@/components/activity/ActivityTracker";
import WorkoutCalendar from "@/components/activity/WorkoutCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar } from "lucide-react";
import { useActivityData } from "@/hooks/useActivityData";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const Schedule = () => {
  // Get data from hooks to ensure they're fresh when switching tabs
  const { refreshActivities } = useActivityData();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("activities");
  
  // Force scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Show welcome toast for today
  useEffect(() => {
    const today = format(new Date(), "EEEE, MMMM d");
    toast({
      title: `Schedule for ${today}`,
      description: "Plan your day and track your activities!",
    });
  }, []);
  
  // Refresh data when tab changes
  useEffect(() => {
    if (activeTab === "activities") {
      refreshActivities();
    }
  }, [activeTab, refreshActivities]);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Activities</h1>
        <p className="text-muted-foreground">Manage your activities and workouts</p>
      </div>

      <Tabs defaultValue="activities" className="pb-20" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Workouts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities">
          <ActivityTracker />
        </TabsContent>
        
        <TabsContent value="workouts">
          <WorkoutCalendar />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Schedule;
