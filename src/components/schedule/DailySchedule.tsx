
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Clock, Edit, Plus, Trash2, Bell, BellOff } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { Skeleton } from "@/components/ui/skeleton";

const compareTime = (a: string, b: string) => {
  const timeA = a.split(':').map(Number);
  const timeB = b.split(':').map(Number);
  
  if (timeA[0] !== timeB[0]) {
    return timeA[0] - timeB[0]; // Compare hours
  }
  
  return timeA[1] - timeB[1]; // Compare minutes
};

interface DailyScheduleProps {
  notificationsEnabled?: boolean;
}

const DailySchedule = ({ notificationsEnabled = true }: DailyScheduleProps) => {
  // Use the hook from Supabase
  const { scheduleItems, loading, addScheduleItem, updateScheduleItem, deleteScheduleItem, getTodaysItems } = useScheduleItems();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{id: string; time: string; title: string; description: string; notification: boolean} | null>(null);
  const [newItemTime, setNewItemTime] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemNotification, setNewItemNotification] = useState(true);
  
  const handleAddOrUpdateItem = async () => {
    if (!newItemTime || !newItemTitle) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (editingItem) {
      // Update existing item
      await updateScheduleItem(editingItem.id, { 
        time: newItemTime, 
        title: newItemTitle, 
        description: newItemDesc
      });
      
      toast({
        description: "Schedule item updated successfully",
      });
    } else {
      // Add new item
      await addScheduleItem({
        time: newItemTime,
        title: newItemTitle,
        description: newItemDesc,
        date: today,
        completed: false
      });
      
      toast({
        description: "New schedule item added",
      });
    }
    
    resetAndCloseDialog();
  };
  
  const startEditItem = (item: any) => {
    setEditingItem({
      id: item.id || "",
      time: item.time || "",
      title: item.title,
      description: item.description || "",
      notification: true
    });
    setNewItemTime(item.time || "");
    setNewItemTitle(item.title);
    setNewItemDesc(item.description || "");
    setNewItemNotification(true);
    setDialogOpen(true);
  };
  
  const deleteItem = async (id: string) => {
    await deleteScheduleItem(id);
    toast({
      description: "Schedule item deleted",
    });
  };
  
  const toggleItemCompleted = async (id: string, completed: boolean) => {
    await updateScheduleItem(id, { completed: !completed });
    
    if (!completed) {
      // If marking as completed, show a toast notification
      toast({
        title: "Item completed!",
        description: "Great job staying on track!",
      });
    }
  };
  
  const resetAndCloseDialog = () => {
    setEditingItem(null);
    setNewItemTime("");
    setNewItemTitle("");
    setNewItemDesc("");
    setNewItemNotification(true);
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

  // Get today's items
  const todaysItems = getTodaysItems();
  
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
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Title of this activity"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Additional details about this activity"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="notification" className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Enable Notification
              </label>
              <Switch
                id="notification"
                checked={newItemNotification}
                onCheckedChange={setNewItemNotification}
                disabled={!notificationsEnabled}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetAndCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdateItem}
              disabled={!newItemTime || !newItemTitle}
            >
              {editingItem ? "Save Changes" : "Add to Schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-2 relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-muted" />
        
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 flex">
                  <div className="mr-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : todaysItems.length > 0 ? (
          todaysItems.map(item => (
            <Card key={item.id} className={cn(
              "relative",
              item.completed ? "bg-muted/30" : ""
            )}>
              <CardContent className="p-4 flex">
                <div className="mr-4 relative">
                  <div className={cn(
                    "h-8 w-8 rounded-full border flex items-center justify-center relative z-10 cursor-pointer",
                    item.completed 
                      ? "bg-primary border-primary text-white"
                      : "bg-card border-muted"
                  )}
                  onClick={() => item.id && toggleItemCompleted(item.id, !!item.completed)}
                  >
                    {item.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">
                        {item.time ? formatTimeDisplay(item.time) : "No time set"}
                      </p>
                      <h3 className={cn(
                        "font-medium",
                        item.completed ? "line-through text-muted-foreground" : ""
                      )}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className={cn(
                          "text-sm text-muted-foreground mt-1",
                          item.completed ? "line-through" : ""
                        )}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0",
                          !notificationsEnabled && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!notificationsEnabled}
                        title={notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
                      >
                        {notificationsEnabled ? 
                          <Bell className="h-4 w-4" /> : 
                          <BellOff className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => item.id && startEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => item.id && deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 mt-6">
            <p className="text-muted-foreground">No schedule items for today</p>
            <p className="text-sm mt-2 text-muted-foreground">Add your first schedule item using the button above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySchedule;
