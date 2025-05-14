
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Edit, Plus, Trash2, Clock, Calendar } from "lucide-react";
import { useActivityData } from "@/hooks/useActivityData";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parse } from "date-fns";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const ActivityTracker = () => {
  const { activities, loading, addActivity, updateActivity, toggleActivityCompleted, deleteActivity, refreshActivities } = useActivityData();
  const { addScheduleItem } = useScheduleItems();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState<"none" | "daily" | "alternate" | "weekly" | "monthly">("none");
  
  const handleAddActivity = async () => {
    if (!inputValue.trim()) return;
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    try {
      // Add to activities table
      const newActivity = await addActivity(inputValue.trim(), formattedDate);
      console.log("New activity added:", newActivity);
      
      // If time or repeat is selected, also add to schedule_items
      if (selectedTime || repeatFrequency !== "none") {
        const scheduleItem = await addScheduleItem({
          title: inputValue.trim(),
          description: `Activity scheduled for ${format(selectedDate, "PPP")}${selectedTime ? ` at ${selectedTime}` : ''}`,
          time: selectedTime,
          date: formattedDate,
          completed: false,
          repeatFrequency: repeatFrequency === "none" ? undefined : repeatFrequency
        });
        
        console.log("Added schedule item:", scheduleItem);
      }
      
      // Reset form
      setInputValue("");
      setSelectedTime("");
      setRepeatFrequency("none");
      setIsAdding(false);
      
      // Refresh activities list
      await refreshActivities();
      
      toast({
        description: "Activity added successfully",
      });
    } catch (error) {
      console.error("Error in handleAddActivity:", error);
      toast({
        description: "Failed to add activity",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateActivity = async () => {
    if (!inputValue.trim() || !editingActivityId) return;
    
    try {
      await updateActivity(editingActivityId, inputValue.trim());
      setInputValue("");
      setEditingActivityId(null);
      await refreshActivities();
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };
  
  const startEditActivity = (id: string, description: string) => {
    setInputValue(description);
    setEditingActivityId(id);
    setIsAdding(false);
  };
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysActivities = activities.filter(activity => activity.date === today);

  return (
    <div className="space-y-6">
      {!isAdding && !editingActivityId && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add Activity
        </Button>
      )}
      
      {(isAdding || editingActivityId) && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Description of your activity"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              
              {isAdding && (
                <>
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal w-full",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                      placeholder="Time (optional)"
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <Select value={repeatFrequency} onValueChange={(value) => setRepeatFrequency(value as any)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Repeat frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No repeat</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="alternate">Alternate days</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={editingActivityId ? handleUpdateActivity : handleAddActivity}
                disabled={!inputValue.trim()}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                {editingActivityId ? "Update" : "Add"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setInputValue("");
                  setIsAdding(false);
                  setEditingActivityId(null);
                  setSelectedDate(new Date());
                  setSelectedTime("");
                  setRepeatFrequency("none");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-3 flex items-center">
                <Skeleton className="h-5 w-5 rounded mr-3" />
                <Skeleton className="h-5 flex-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : todaysActivities.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Today's Activities</h3>
          {todaysActivities.map(activity => (
            <Card key={activity.id} className="overflow-hidden">
              <div 
                className={`h-1 ${activity.completed ? "bg-mint" : "bg-muted"}`}
                style={{ width: "100%" }}
              />
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div
                    className={`h-5 w-5 rounded border mr-3 flex items-center justify-center cursor-pointer ${
                      activity.completed ? "bg-mint border-mint" : "border-muted-foreground"
                    }`}
                    onClick={() => activity.id && toggleActivityCompleted(activity.id)}
                  >
                    {activity.completed && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={activity.completed ? "line-through text-muted-foreground" : ""}>
                    {activity.description}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => activity.id && startEditActivity(activity.id, activity.description)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    onClick={() => activity.id && deleteActivity(activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No activities added yet</p>
        </div>
      )}
      
      <div className="space-y-2 mt-8">
        <h3 className="font-medium text-lg">Planned Activities</h3>
        {activities.filter(activity => activity.date > today).length > 0 ? (
          <div className="space-y-2">
            {activities
              .filter(activity => activity.date > today)
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(activity => (
                <Card key={activity.id}>
                  <CardContent className="pt-3 pb-3 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="mr-3 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p>{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.date), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => activity.id && startEditActivity(activity.id, activity.description)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => activity.id && deleteActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No planned activities</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTracker;
