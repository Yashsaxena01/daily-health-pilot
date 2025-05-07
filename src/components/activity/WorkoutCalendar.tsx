
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const WorkoutCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  
  // Mock data for workout days
  const [workoutDays] = useState(() => {
    // Generate some random workout days for the current month
    const days = [];
    let day = startOfMonth(today);
    
    while (isSameMonth(day, today)) {
      // Only add days in the past
      if (day < today && Math.random() > 0.3) { // 70% chance of a workout
        days.push(new Date(day));
      }
      day = addDays(day, 1);
    }
    
    return days;
  });
  
  // Get days in current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Get current streak
  const getCurrentStreak = () => {
    let streak = 0;
    let checkDate = new Date(today);
    
    // Check backwards from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (workoutDays.some(d => isSameDay(d, checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  };

  const [streak] = useState(getCurrentStreak());
  
  // Calculate weekly labels
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Card className="border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Workout Streaks
        </CardTitle>
        <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">{streak} day streak</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="text-sm font-medium text-center mb-2">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-muted-foreground font-medium py-1">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day, i) => {
              // Add empty cells for days of the week before the first of the month
              const startingDayOfWeek = daysInMonth[0].getDay();
              if (i === 0 && startingDayOfWeek !== 0) {
                return [...Array(startingDayOfWeek)].map((_, index) => (
                  <div key={`empty-${index}`} className="h-8 rounded-full" />
                ));
              }
              
              const isWorkoutDay = workoutDays.some(d => isSameDay(d, day));
              const isToday = isSameDay(day, today);
              const isFuture = day > today;
              
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium",
                    isWorkoutDay && "bg-primary text-white",
                    isToday && "ring-2 ring-primary",
                    isFuture && "text-muted-foreground opacity-50",
                    !isWorkoutDay && !isToday && "hover:bg-muted"
                  )}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span className="text-xs">Workout completed</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-3 w-3 rounded-full border"></div>
              <span className="text-xs">No workout</span>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-muted-foreground">Best streak: </span>
            <span className="font-medium">7 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCalendar;
