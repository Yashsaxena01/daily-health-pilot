
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import DailySchedule from "@/components/schedule/DailySchedule";
import ActivityTracker from "@/components/activity/ActivityTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Schedule = () => {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Daily Schedule</h1>
        <p className="text-muted-foreground">Manage your daily routine and activities</p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="schedule">Daily Timeline</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <DailySchedule />
        </TabsContent>
        
        <TabsContent value="activities">
          <ActivityTracker />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Schedule;
