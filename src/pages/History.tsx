
import React, { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays } from "date-fns";
import DailySummary from "@/components/dashboard/DailySummary";

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Mock historical data for demonstration
  const getHistoricalData = (date: Date) => {
    // This would normally fetch data from a database based on the date
    // For now, we'll generate some mock data
    const dayOffset = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      weight: 72.5 - (dayOffset * 0.1),
      meals: [
        {
          type: "breakfast",
          description: dayOffset % 2 === 0 ? "Oatmeal with berries" : "Eggs and toast",
          feeling: dayOffset % 3 === 0 ? "great" : "okay"
        },
        {
          type: "lunch",
          description: dayOffset % 2 === 0 ? "Chicken salad" : "Vegetable soup",
          feeling: dayOffset % 4 === 0 ? "not_good" : "okay"
        }
      ],
      activities: [
        { 
          description: dayOffset % 2 === 0 ? "Morning run" : "Strength training", 
          completed: dayOffset % 3 !== 0 
        },
        { 
          description: "Evening yoga", 
          completed: dayOffset % 2 === 0 
        }
      ],
      foodsIntroduced: dayOffset % 4 === 0 ? [
        { name: "Almonds", category: "Nuts", reaction: "No reaction noticed" }
      ] : [],
      scheduleCompletionRate: Math.max(0, 80 - (dayOffset * 5))
    };
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Don't allow going beyond today
    if (selectedDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
      setSelectedDate(prev => new Date(prev.getTime() + 86400000));
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const canGoForward = !isToday(selectedDate);
  const historicalData = getHistoricalData(selectedDate);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">History</h1>
        <p className="text-muted-foreground">Review your health data</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="px-4"
            >
              {format(selectedDate, "MMMM d, yyyy")}
              {isToday(selectedDate) && " (Today)"}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextDay}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {calendarOpen && (
            <div className="mt-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                disabled={(date) => date > new Date()}
                className="rounded-md border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DailySummary 
        weight={historicalData.weight}
        meals={historicalData.meals}
        activities={historicalData.activities}
        foodsIntroduced={historicalData.foodsIntroduced}
        scheduleCompletionRate={historicalData.scheduleCompletionRate}
      />
    </PageContainer>
  );
};

export default History;
