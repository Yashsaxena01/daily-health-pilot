import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Check, Filter, List, Plus, Trash, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";

interface FoodItem {
  id: string;
  name: string;
  date: string;
  reactionLevel: "none" | "mild" | "severe";
  category: string;
}

interface FoodSummaryProps {
  data?: {
    streak: number;
    lastJunkFood?: { date: string; item: string } | null;
    introducedFoods: FoodItem[];
    todaysFood?: {
      name: string;
      category: string;
    };
    nextMeal?: {
      type: string;
      time: string;
      food: string;
    };
  }
}

const defaultData = {
  streak: 0,
  lastJunkFood: null,
  introducedFoods: [],
  todaysFood: undefined,
  nextMeal: undefined
};

const FoodSummary = ({ data }: FoodSummaryProps) => {
  // If no data provided, use empty state from localStorage
  const [summaryData, setSummaryData] = useLocalStorage("foodSummaryData", data || defaultData);
  
  const [filterReaction, setFilterReaction] = useState<"all" | "mild" | "severe">("all");
  const [isAddingIntolerance, setIsAddingIntolerance] = useState(false);
  const [newIntolerance, setNewIntolerance] = useState({ name: "", category: "", reactionLevel: "mild" as "mild" | "severe" });
  
  // State to track manual intolerances (those not from introduced foods)
  const [manualIntolerances, setManualIntolerances] = useLocalStorage<FoodItem[]>("foodIntolerances", []);

  const getReactionColor = (reactionLevel: string) => {
    switch (reactionLevel) {
      case "none": return "bg-green-500";
      case "mild": return "bg-yellow-500";
      case "severe": return "bg-red-500";
      default: return "";
    }
  };

  const getReactionText = (reactionLevel: string) => {
    switch (reactionLevel) {
      case "none": return "No reaction";
      case "mild": return "Mild";
      case "severe": return "Severe";
      default: return "";
    }
  };

  // Combine introduced foods with manual intolerances
  const allIntolerances = [...summaryData.introducedFoods.filter(
    food => food.reactionLevel === "mild" || food.reactionLevel === "severe"
  ), ...manualIntolerances];

  const filteredFoods = filterReaction === "all" 
    ? [...summaryData.introducedFoods, ...manualIntolerances]
    : [...summaryData.introducedFoods, ...manualIntolerances].filter(food => food.reactionLevel === filterReaction);

  const handleAddIntolerance = () => {
    if (!newIntolerance.name || !newIntolerance.category) {
      toast({
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: newIntolerance.name,
      category: newIntolerance.category,
      reactionLevel: newIntolerance.reactionLevel,
      date: new Date().toISOString().split('T')[0]
    };

    setManualIntolerances(prev => [...prev, newItem]);
    setNewIntolerance({ name: "", category: "", reactionLevel: "mild" });
    setIsAddingIntolerance(false);

    toast({
      description: `${newItem.name} added to your intolerances.`,
    });
  };

  const handleRemoveIntolerance = (id: string) => {
    // Check if it's a manual intolerance
    const isManual = manualIntolerances.some(item => item.id === id);
    
    if (isManual) {
      setManualIntolerances(prev => prev.filter(item => item.id !== id));
      toast({
        description: "Intolerance removed successfully.",
      });
    } else {
      toast({
        description: "Cannot remove an intolerance discovered through food introduction.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-accent text-accent-foreground">Introduction</Badge>
                <h3 className="font-medium">Food to introduce today</h3>
              </div>
              {summaryData.todaysFood ? (
                <div className="bg-secondary p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{summaryData.todaysFood.name}</p>
                      <p className="text-xs text-muted-foreground">{summaryData.todaysFood.category}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No food scheduled for introduction today</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-secondary">Next Meal</Badge>
                <h3 className="font-medium">Upcoming meal</h3>
              </div>
              {summaryData.nextMeal ? (
                <div className="bg-secondary p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{summaryData.nextMeal.type}</p>
                      <p className="text-sm">{summaryData.nextMeal.food}</p>
                      <p className="text-xs text-muted-foreground">{summaryData.nextMeal.time}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming meals planned</p>
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{summaryData.streak}</div>
                <div className="text-sm">
                  <p className="font-medium">Day Streak</p>
                  <p className="text-muted-foreground">of healthy eating</p>
                </div>
              </div>
              
              {summaryData.lastJunkFood && (
                <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                  <p>Last unhealthy meal: {summaryData.lastJunkFood.item}</p>
                  <p className="text-xs">
                    {new Date(summaryData.lastJunkFood.date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-accent/10">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Your Intolerances
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setIsAddingIntolerance(!isAddingIntolerance)}
            >
              {isAddingIntolerance ? "Cancel" : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isAddingIntolerance && (
              <div className="px-6 pt-4 pb-2 border-b">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="intolerance-name">Food Name</Label>
                    <Input 
                      id="intolerance-name" 
                      value={newIntolerance.name}
                      onChange={(e) => setNewIntolerance(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="intolerance-category">Category</Label>
                    <Input 
                      id="intolerance-category"
                      value={newIntolerance.category}
                      onChange={(e) => setNewIntolerance(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Reaction Level</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button 
                        type="button"
                        variant={newIntolerance.reactionLevel === "mild" ? "default" : "outline"}
                        className={cn(
                          newIntolerance.reactionLevel === "mild" ? "bg-yellow-500 hover:bg-yellow-600" : ""
                        )}
                        onClick={() => setNewIntolerance(prev => ({ ...prev, reactionLevel: "mild" }))}
                      >
                        Mild
                      </Button>
                      <Button 
                        type="button"
                        variant={newIntolerance.reactionLevel === "severe" ? "default" : "outline"}
                        className={cn(
                          newIntolerance.reactionLevel === "severe" ? "bg-red-500 hover:bg-red-600" : ""
                        )}
                        onClick={() => setNewIntolerance(prev => ({ ...prev, reactionLevel: "severe" }))}
                      >
                        Severe
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleAddIntolerance}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Intolerance
                  </Button>
                </div>
              </div>
            )}
            
            {allIntolerances.length > 0 ? (
              <div className="px-6 py-4">
                <ul className="space-y-2">
                  {allIntolerances.map(food => (
                    <li key={food.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            "h-3 w-3 rounded-full",
                            getReactionColor(food.reactionLevel)
                          )}
                        />
                        <span>{food.name}</span>
                        <span className="text-xs text-muted-foreground">({food.category})</span>
                      </div>
                      
                      {/* Show delete button only for manual intolerances */}
                      {manualIntolerances.some(item => item.id === food.id) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveIntolerance(food.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="px-6 py-4 text-sm text-muted-foreground">No food intolerances detected yet</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-accent/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Food Introduction History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterReaction("all")}
                className={cn(
                  "text-xs h-8",
                  filterReaction === "all" && "bg-secondary"
                )}
              >
                All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterReaction("mild")}
                className={cn(
                  "text-xs h-8",
                  filterReaction === "mild" && "bg-secondary"
                )}
              >
                Mild
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterReaction("severe")}
                className={cn(
                  "text-xs h-8",
                  filterReaction === "severe" && "bg-secondary"
                )}
              >
                Severe
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFoods.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-muted-foreground text-xs">
                    <th className="p-3">Food</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map(food => (
                    <tr key={food.id} className="border-t">
                      <td className="p-3">{food.name}</td>
                      <td className="p-3 text-xs text-muted-foreground">{food.category}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(food.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className={cn(
                              "h-3 w-3 rounded-full",
                              getReactionColor(food.reactionLevel)
                            )}
                          />
                          <span className="text-xs">
                            {getReactionText(food.reactionLevel)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 px-3 text-center text-muted-foreground">
              <p>No food introduction history yet</p>
              <p className="text-sm mt-1">Start introducing foods to track your reactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodSummary;
