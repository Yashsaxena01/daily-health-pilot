
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { Camera, Check, Edit, Plus } from "lucide-react";

interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  photo?: string;
  description: string;
  time: string;
  feeling?: "great" | "okay" | "not_good";
  notes?: string;
}

const MealTracker = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [description, setDescription] = useState("");
  const [feeling, setFeeling] = useState<"great" | "okay" | "not_good" | undefined>();
  const [notes, setNotes] = useState("");
  
  const resetForm = () => {
    setMealType("breakfast");
    setDescription("");
    setFeeling(undefined);
    setNotes("");
  };
  
  const handleAddMeal = () => {
    if (!description) return;
    
    const newMeal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      description,
      time: format(new Date(), "h:mm a"),
      feeling,
      notes: notes || undefined,
    };
    
    setMeals([...meals, newMeal]);
    resetForm();
    setIsAddingMeal(false);
  };
  
  const handleSaveMeal = () => {
    if (!description || !editingMealId) return;
    
    const updatedMeals = meals.map(meal => 
      meal.id === editingMealId 
        ? { ...meal, type: mealType, description, feeling, notes: notes || undefined }
        : meal
    );
    
    setMeals(updatedMeals);
    resetForm();
    setEditingMealId(null);
  };
  
  const startEditingMeal = (meal: Meal) => {
    setMealType(meal.type);
    setDescription(meal.description);
    setFeeling(meal.feeling);
    setNotes(meal.notes || "");
    setEditingMealId(meal.id);
  };
  
  const cancelEditing = () => {
    resetForm();
    setEditingMealId(null);
    setIsAddingMeal(false);
  };

  return (
    <div className="space-y-6">
      {!isAddingMeal && !editingMealId && (
        <Button onClick={() => setIsAddingMeal(true)} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add Meal
        </Button>
      )}
      
      {(isAddingMeal || editingMealId) && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Meal Type</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={mealType === type ? "default" : "outline"}
                    onClick={() => setMealType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="meal-description">Description</Label>
              <Textarea
                id="meal-description"
                placeholder="What did you eat?"
                className="mt-2"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <Label className="mb-2 block">Add Photo</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center">
                <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Tap to add a photo</p>
              </div>
            </div>
            
            <div>
              <Label>How do you feel after eating?</Label>
              <RadioGroup 
                value={feeling} 
                onValueChange={(value) => setFeeling(value as any)} 
                className="flex justify-between mt-2"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <RadioGroupItem value="great" id="feeling-great" />
                    <Label htmlFor="feeling-great" className="cursor-pointer">Great</Label>
                  </div>
                  <span className="text-xl">😊</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <RadioGroupItem value="okay" id="feeling-okay" />
                    <Label htmlFor="feeling-okay" className="cursor-pointer">Okay</Label>
                  </div>
                  <span className="text-xl">😐</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <RadioGroupItem value="not_good" id="feeling-not-good" />
                    <Label htmlFor="feeling-not-good" className="cursor-pointer">Not Good</Label>
                  </div>
                  <span className="text-xl">😣</span>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="meal-notes">Additional Notes</Label>
              <Textarea
                id="meal-notes"
                placeholder="Any symptoms or reactions? (Optional)"
                className="mt-2"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline"
                onClick={cancelEditing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={editingMealId ? handleSaveMeal : handleAddMeal}
                className="flex-1"
                disabled={!description}
              >
                <Check className="h-4 w-4 mr-1" />
                {editingMealId ? "Save" : "Add"} Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        {meals.map(meal => (
          <Card key={meal.id} className="overflow-hidden">
            <div className="bg-muted h-2">
              <div 
                className={`h-full ${
                  meal.type === "breakfast" ? "bg-warning"
                  : meal.type === "lunch" ? "bg-primary"
                  : meal.type === "dinner" ? "bg-teal"
                  : "bg-accent"
                }`}
                style={{ width: "100%" }}
              />
            </div>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium capitalize">{meal.type}</h3>
                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => startEditingMeal(meal)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm">{meal.description}</p>
              
              {meal.feeling && (
                <div className="mt-2 flex items-center">
                  <p className="text-xs text-muted-foreground mr-1">Feeling:</p>
                  <span className="text-sm">
                    {meal.feeling === "great" ? "😊 Great"
                    : meal.feeling === "okay" ? "😐 Okay"
                    : "😣 Not Good"}
                  </span>
                </div>
              )}
              
              {meal.notes && (
                <p className="text-xs text-muted-foreground mt-2">{meal.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealTracker;
