
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import { useActivityData } from "@/hooks/useActivityData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const ActivityTracker = () => {
  const { activities, loading, addActivity, updateActivity, toggleActivityCompleted, deleteActivity } = useActivityData();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  
  const handleAddActivity = async () => {
    if (!inputValue.trim()) return;
    
    await addActivity(inputValue.trim());
    setInputValue("");
    setIsAdding(false);
  };
  
  const handleUpdateActivity = async () => {
    if (!inputValue.trim() || !editingActivityId) return;
    
    await updateActivity(editingActivityId, inputValue.trim());
    setInputValue("");
    setEditingActivityId(null);
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
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Description of your activity"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={editingActivityId ? handleUpdateActivity : handleAddActivity}
                disabled={!inputValue.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setInputValue("");
                  setIsAdding(false);
                  setEditingActivityId(null);
                }}
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
    </div>
  );
};

export default ActivityTracker;
