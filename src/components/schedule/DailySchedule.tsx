
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Clock, Edit, Plus, Trash2, X } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  time: string; // Format: "HH:mm"
  description: string;
  completed: boolean;
}

const compareTime = (a: ScheduleItem, b: ScheduleItem) => {
  const timeA = a.time.split(':').map(Number);
  const timeB = b.time.split(':').map(Number);
  
  if (timeA[0] !== timeB[0]) {
    return timeA[0] - timeB[0]; // Compare hours
  }
  
  return timeA[1] - timeB[1]; // Compare minutes
};

const DailySchedule = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "1", time: "06:00", description: "Wake up", completed: true },
    { id: "2", time: "07:00", description: "Morning workout", completed: false },
    { id: "3", time: "08:00", description: "Breakfast", completed: false },
    { id: "4", time: "12:00", description: "Lunch", completed: false },
    { id: "5", time: "15:00", description: "Take supplements", completed: false },
    { id: "6", time: "18:00", description: "Dinner", completed: false },
    { id: "7", time: "22:00", description: "Sleep", completed: false },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [newItemTime, setNewItemTime] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  
  const handleAddOrUpdateItem = () => {
    if (!newItemTime || !newItemDesc) return;
    
    if (editingItem) {
      // Update existing item
      setScheduleItems(prev => 
        prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, time: newItemTime, description: newItemDesc }
            : item
        ).sort(compareTime)
      );
    } else {
      // Add new item
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        time: newItemTime,
        description: newItemDesc,
        completed: false,
      };
      
      setScheduleItems(prev => [...prev, newItem].sort(compareTime));
    }
    
    resetAndCloseDialog();
  };
  
  const startEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setNewItemTime(item.time);
    setNewItemDesc(item.description);
    setDialogOpen(true);
  };
  
  const deleteItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };
  
  const toggleItemCompleted = (id: string) => {
    setScheduleItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const resetAndCloseDialog = () => {
    setEditingItem(null);
    setNewItemTime("");
    setNewItemDesc("");
    setDialogOpen(false);
  };
  
  const formatTimeDisplay = (time: string) => {
    try {
      // Parse the 24-hour format time
      const parsedTime = parse(time, "HH:mm", new Date());
      // Format it as 12-hour with AM/PM
      return format(parsedTime, "h:mm a");
    } catch (e) {
      return time; // Fallback to the original format if parsing fails
    }
  };
  
  return (
    <div className="space-y-6">
      <Button onClick={() => setDialogOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        Add Schedule Item
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Schedule Item" : "Add Schedule Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                value={newItemTime}
                onChange={(e) => setNewItemTime(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                placeholder="What's happening at this time?"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetAndCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdateItem}
              disabled={!newItemTime || !newItemDesc}
            >
              {editingItem ? "Save Changes" : "Add to Schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-2 relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-muted" />
        
        {scheduleItems.map(item => (
          <Card key={item.id} className={cn(
            "relative",
            item.completed ? "bg-muted/30" : ""
          )}>
            <CardContent className="p-4 flex">
              <div className="mr-4 relative">
                <div className={cn(
                  "h-8 w-8 rounded-full border flex items-center justify-center relative z-10",
                  item.completed 
                    ? "bg-mint border-mint text-white"
                    : "bg-card border-muted"
                )}
                onClick={() => toggleItemCompleted(item.id)}
                >
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">
                      {formatTimeDisplay(item.time)}
                    </p>
                    <h3 className={cn(
                      "font-medium",
                      item.completed ? "line-through text-muted-foreground" : ""
                    )}>
                      {item.description}
                    </h3>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => startEditItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailySchedule;
