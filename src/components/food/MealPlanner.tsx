
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Plus, Save, Calendar, Clock, Utensils, X, Check } from "lucide-react";
import { format } from "date-fns";

interface Meal {
  id: string;
  time: string;
  description: string;
  completed: boolean;
}

interface DayPlan {
  id: string;
  day: string;
  date: string;
  meals: Meal[];
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const createInitialMealPlans = (): DayPlan[] => {
  const today = new Date();
  return daysOfWeek.map((day, index) => {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - today.getDay() + 1 + index);
    
    return {
      id: (index + 1).toString(),
      day,
      date: format(currentDate, "yyyy-MM-dd"),
      meals: []
    };
  });
};

const MealPlanner = () => {
  const [mealPlans, setMealPlans] = useState<DayPlan[]>(createInitialMealPlans);
  const [editingMeal, setEditingMeal] = useState<{ dayId: string; mealId: string | null } | null>(null);
  const [newMealTime, setNewMealTime] = useState("");
  const [newMealDescription, setNewMealDescription] = useState("");
  
  const handleAddMeal = (dayId: string) => {
    if (!newMealTime || !newMealDescription) return;
    
    setMealPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === dayId 
          ? {
              ...plan, 
              meals: [
                ...plan.meals, 
                {
                  id: Date.now().toString(),
                  time: newMealTime,
                  description: newMealDescription,
                  completed: false
                }
              ].sort((a, b) => a.time.localeCompare(b.time))
            } 
          : plan
      )
    );
    
    setNewMealTime("");
    setNewMealDescription("");
  };
  
  const handleEditMeal = (dayId: string, mealId: string) => {
    const day = mealPlans.find(plan => plan.id === dayId);
    const meal = day?.meals.find(m => m.id === mealId);
    
    if (meal) {
      setNewMealTime(meal.time);
      setNewMealDescription(meal.description);
      setEditingMeal({ dayId, mealId });
    }
  };
  
  const handleUpdateMeal = () => {
    if (!editingMeal || !newMealTime || !newMealDescription) return;
    
    setMealPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === editingMeal.dayId 
          ? {
              ...plan, 
              meals: plan.meals.map(meal => 
                meal.id === editingMeal.mealId
                  ? { ...meal, time: newMealTime, description: newMealDescription }
                  : meal
              ).sort((a, b) => a.time.localeCompare(b.time))
            } 
          : plan
      )
    );
    
    setEditingMeal(null);
    setNewMealTime("");
    setNewMealDescription("");
  };
  
  const handleDeleteMeal = (dayId: string, mealId: string) => {
    setMealPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === dayId 
          ? {
              ...plan, 
              meals: plan.meals.filter(meal => meal.id !== mealId)
            } 
          : plan
      )
    );
  };
  
  const handleToggleCompleted = (dayId: string, mealId: string) => {
    setMealPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === dayId 
          ? {
              ...plan, 
              meals: plan.meals.map(meal => 
                meal.id === mealId
                  ? { ...meal, completed: !meal.completed }
                  : meal
              )
            } 
          : plan
      )
    );
  };
  
  const isToday = (date: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return date === today;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealPlans.map(plan => (
          <Card 
            key={plan.id} 
            className={`border-l-4 ${isToday(plan.date) ? "border-l-accent" : "border-l-transparent"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{plan.day}</span>
                </div>
                {isToday(plan.date) && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">Today</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.meals.length > 0 ? (
                <div className="space-y-3">
                  {plan.meals.map(meal => (
                    <div 
                      key={meal.id} 
                      className={`p-3 rounded-md border flex items-start justify-between ${
                        meal.completed ? "bg-muted/30" : "bg-white"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{meal.time}</span>
                        </div>
                        <p className={`mt-1 ${meal.completed ? "line-through text-muted-foreground" : ""}`}>
                          {meal.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleToggleCompleted(plan.id, meal.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleEditMeal(plan.id, meal.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
                          onClick={() => handleDeleteMeal(plan.id, meal.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-3">
                  No meals planned for this day
                </p>
              )}
              
              {editingMeal?.dayId === plan.id ? (
                <div className="border rounded-md p-3 mt-4 bg-muted/10">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Meal
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`edit-time-${plan.id}`}>Time</Label>
                      <Input
                        id={`edit-time-${plan.id}`}
                        type="time"
                        value={newMealTime}
                        onChange={e => setNewMealTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-description-${plan.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${plan.id}`}
                        value={newMealDescription}
                        onChange={e => setNewMealDescription(e.target.value)}
                        placeholder="What's on the menu?"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingMeal(null);
                          setNewMealTime("");
                          setNewMealDescription("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleUpdateMeal}>
                        <Save className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-3 mt-4 bg-muted/10">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Add Meal
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`time-${plan.id}`}>Time</Label>
                      <Input
                        id={`time-${plan.id}`}
                        type="time"
                        value={newMealTime}
                        onChange={e => setNewMealTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`description-${plan.id}`}>Description</Label>
                      <Textarea
                        id={`description-${plan.id}`}
                        value={newMealDescription}
                        onChange={e => setNewMealDescription(e.target.value)}
                        placeholder="What's on the menu?"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddMeal(plan.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Meal
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;
