
import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import DailySchedule from "@/components/schedule/DailySchedule";
import ActivityTracker from "@/components/activity/ActivityTracker";
import WorkoutCalendar from "@/components/activity/WorkoutCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Bell, Calendar, Clock, BellOff, Utensils } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { useActivityData } from "@/hooks/useActivityData";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const Schedule = () => {
  // Use localStorage to persist notification settings
  const [notifications, setNotifications] = useLocalStorage("scheduleNotifications", {
    schedule: true,
    meals: true,
    medications: true,
    workouts: false
  });
  
  // Get data from hooks to ensure they're fresh when switching tabs
  const { refreshScheduleItems } = useScheduleItems();
  const { refreshActivities } = useActivityData();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("schedule");
  
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
    if (activeTab === "schedule") {
      refreshScheduleItems();
    } else if (activeTab === "activities") {
      refreshActivities();
    }
  }, [activeTab, refreshScheduleItems, refreshActivities]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${!notifications[key] ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Daily Schedule</h1>
        <p className="text-muted-foreground">Manage your daily routine and activities</p>
      </div>

      <Card className="mb-6 border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Schedule Reminders</span>
            </div>
            <Switch 
              checked={notifications.schedule} 
              onCheckedChange={() => toggleNotification('schedule')}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              <span>Meal Reminders</span>
            </div>
            <Switch 
              checked={notifications.meals} 
              onCheckedChange={() => toggleNotification('meals')}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span>Workout Reminders</span>
            </div>
            <Switch 
              checked={notifications.workouts} 
              onCheckedChange={() => toggleNotification('workouts')}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Medication Reminders</span>
            </div>
            <Switch 
              checked={notifications.medications} 
              onCheckedChange={() => toggleNotification('medications')}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schedule" className="pb-20" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Timeline
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <DailySchedule notificationsEnabled={notifications.schedule} />
        </TabsContent>
        
        <TabsContent value="activities">
          <div className="space-y-6">
            <ActivityTracker />
            <WorkoutCalendar />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Schedule;
