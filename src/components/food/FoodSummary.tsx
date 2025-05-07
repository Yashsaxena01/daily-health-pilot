
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Check, Filter, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const FoodSummary = ({ data }: FoodSummaryProps) => {
  // If no data provided, use mock data
  const summaryData = data || {
    streak: 5,
    lastJunkFood: { date: "2025-05-01", item: "Chocolate cake" },
    introducedFoods: [
      { id: "1", name: "Rice", date: "2025-04-30", reactionLevel: "none", category: "Grains" },
      { id: "2", name: "Yogurt", date: "2025-04-28", reactionLevel: "mild", category: "Dairy" },
      { id: "3", name: "Almonds", date: "2025-04-25", reactionLevel: "none", category: "Nuts" },
      { id: "4", name: "Garlic", date: "2025-04-22", reactionLevel: "severe", category: "FODMAPs" },
      { id: "5", name: "Wheat", date: "2025-04-20", reactionLevel: "severe", category: "Grains" },
      { id: "6", name: "Eggs", date: "2025-04-18", reactionLevel: "mild", category: "Protein" },
    ],
    todaysFood: {
      name: "Oats",
      category: "Grains"
    },
    nextMeal: {
      type: "lunch",
      time: "12:30 PM",
      food: "Grilled chicken with vegetables"
    }
  };

  const [filterReaction, setFilterReaction] = useState<"all" | "mild" | "severe">("all");

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

  const intolerances = summaryData.introducedFoods.filter(
    food => food.reactionLevel === "mild" || food.reactionLevel === "severe"
  );

  const filteredFoods = filterReaction === "all" 
    ? summaryData.introducedFoods
    : summaryData.introducedFoods.filter(food => food.reactionLevel === filterReaction);

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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Your Intolerances
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {intolerances.length > 0 ? (
              <div className="px-6 pb-4">
                <ul className="space-y-2">
                  {intolerances.map(food => (
                    <li key={food.id} className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "h-3 w-3 rounded-full",
                          getReactionColor(food.reactionLevel)
                        )}
                      />
                      <span>{food.name}</span>
                      <span className="text-xs text-muted-foreground">({food.category})</span>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodSummary;
