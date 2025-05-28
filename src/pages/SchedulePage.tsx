
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Check, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  date: string;
}

const SchedulePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTodayItems();
  }, []);

  const fetchTodayItems = async () => {
    try {
      const { data, error } = await supabase
        .from("schedule_items")
        .select("*")
        .eq("date", today)
        .order("time", { ascending: true });

      if (error) throw error;
      
      const formattedItems = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        time: item.time || "",
        completed: item.completed || false,
        date: item.date
      }));

      setItems(formattedItems);
    } catch (error: any) {
      console.error("Error fetching schedule items:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addScheduleItem = async () => {
    if (!title.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("schedule_items")
        .insert({
          title: title.trim(),
          description: description.trim(),
          time: time,
          date: today,
          completed: false
        });

      if (error) throw error;

      setTitle("");
      setDescription("");
      setTime("");
      fetchTodayItems();
      
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (error: any) {
      console.error("Error adding schedule item:", error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("schedule_items")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === id ? { ...item, completed: !completed } : item
      ));
      
      toast({
        title: !completed ? "Task completed!" : "Task unmarked",
        description: !completed ? "Great job!" : "Task marked as incomplete",
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 mr-2 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
          <p className="text-gray-600">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
      </div>

      {items.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-800">{completedCount}/{items.length}</p>
              <p className="text-purple-600">Tasks completed</p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          
          <Button onClick={addScheduleItem} className="w-full bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks for today</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-3 transition-all duration-200 ${
                    item.completed 
                      ? "bg-green-50 border-green-200" 
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleComplete(item.id, item.completed)}
                      className={`mt-0.5 p-1 h-6 w-6 rounded-full ${
                        item.completed 
                          ? "bg-green-100 hover:bg-green-200 text-green-600" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {item.completed ? <Check className="h-4 w-4" /> : null}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${
                          item.completed ? "line-through text-gray-500" : "text-gray-900"
                        }`}>
                          {item.title}
                        </h3>
                        {item.time && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.time}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-sm ${
                          item.completed ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;
