
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Check, List } from "lucide-react";

interface FoodSummaryProps {
  data?: {
    streak: number;
    lastJunkFood?: { date: string; item: string } | null;
    introducedFoods: Array<{
      id: string;
      name: string;
      date: string;
      reactionLevel: "none" | "mild" | "severe";
      category: string;
    }>;
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
    ]
  };

  const getReactionColor = (reactionLevel: string) => {
    switch (reactionLevel) {
      case "none": return "bg-green-500";
      case "mild": return "bg-yellow-500";
      case "severe": return "bg-red-500";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Healthy Eating Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="text-5xl font-bold mb-2">{summaryData.streak}</div>
              <p className="text-sm text-muted-foreground">consecutive days</p>
            </div>
            {summaryData.lastJunkFood && (
              <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                <p>Last unhealthy meal: {summaryData.lastJunkFood.item}</p>
                <p className="text-xs">
                  {new Date(summaryData.lastJunkFood.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Food Introduction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[200px] overflow-y-auto">
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
                  {summaryData.introducedFoods.map(food => (
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
                            {food.reactionLevel === "none" ? "No reaction" : 
                             food.reactionLevel === "mild" ? "Mild" : "Severe"}
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
    </div>
  );
};

export default FoodSummary;
