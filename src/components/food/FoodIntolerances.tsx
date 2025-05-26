
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFoodIntolerances, FoodIntolerance } from "@/hooks/useFoodIntolerances";
import { cn } from "@/lib/utils";

const FoodIntolerances = () => {
  const { intolerances, loading, addIntolerance, deleteIntolerance } = useFoodIntolerances();
  const [isAdding, setIsAdding] = useState(false);
  const [newIntolerance, setNewIntolerance] = useState({
    food_name: "",
    category: "",
    reaction_level: "mild" as "mild" | "severe",
    reaction_notes: "",
    discovered_date: new Date().toISOString().split('T')[0]
  });

  const handleAddIntolerance = async () => {
    if (!newIntolerance.food_name || !newIntolerance.category) {
      toast({
        description: "Please fill in food name and category",
        variant: "destructive"
      });
      return;
    }

    const result = await addIntolerance(newIntolerance);
    if (result) {
      setNewIntolerance({
        food_name: "",
        category: "",
        reaction_level: "mild",
        reaction_notes: "",
        discovered_date: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      toast({
        description: "Food intolerance added successfully",
      });
    }
  };

  const getReactionColor = (level: string) => {
    switch (level) {
      case "mild": return "bg-yellow-500";
      case "severe": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Food Intolerances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading intolerances...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Food Intolerances
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? "Cancel" : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="food-name">Food Name</Label>
                <Input 
                  id="food-name"
                  value={newIntolerance.food_name}
                  onChange={(e) => setNewIntolerance(prev => ({ ...prev, food_name: e.target.value }))}
                  placeholder="e.g., Milk"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category"
                  value={newIntolerance.category}
                  onChange={(e) => setNewIntolerance(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Dairy"
                />
              </div>
            </div>
            
            <div>
              <Label>Reaction Level</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                  type="button"
                  variant={newIntolerance.reaction_level === "mild" ? "default" : "outline"}
                  className={cn(
                    newIntolerance.reaction_level === "mild" ? "bg-yellow-500 hover:bg-yellow-600" : ""
                  )}
                  onClick={() => setNewIntolerance(prev => ({ ...prev, reaction_level: "mild" }))}
                >
                  Mild
                </Button>
                <Button 
                  type="button"
                  variant={newIntolerance.reaction_level === "severe" ? "default" : "outline"}
                  className={cn(
                    newIntolerance.reaction_level === "severe" ? "bg-red-500 hover:bg-red-600" : ""
                  )}
                  onClick={() => setNewIntolerance(prev => ({ ...prev, reaction_level: "severe" }))}
                >
                  Severe
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="reaction-notes">Reaction Notes (Optional)</Label>
              <Textarea 
                id="reaction-notes"
                value={newIntolerance.reaction_notes}
                onChange={(e) => setNewIntolerance(prev => ({ ...prev, reaction_notes: e.target.value }))}
                placeholder="Describe your reaction..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="discovered-date">Discovered Date</Label>
              <Input 
                id="discovered-date"
                type="date"
                value={newIntolerance.discovered_date}
                onChange={(e) => setNewIntolerance(prev => ({ ...prev, discovered_date: e.target.value }))}
              />
            </div>

            <Button onClick={handleAddIntolerance} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Intolerance
            </Button>
          </div>
        )}

        {intolerances.length > 0 ? (
          <div className="space-y-3">
            {intolerances.map((intolerance) => (
              <div key={intolerance.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "h-3 w-3 rounded-full",
                      getReactionColor(intolerance.reaction_level)
                    )}
                  />
                  <div>
                    <p className="font-medium">{intolerance.food_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{intolerance.category}</Badge>
                      <span>•</span>
                      <span className="capitalize">{intolerance.reaction_level}</span>
                      <span>•</span>
                      <span>{new Date(intolerance.discovered_date).toLocaleDateString()}</span>
                    </div>
                    {intolerance.reaction_notes && (
                      <p className="text-xs text-muted-foreground mt-1">{intolerance.reaction_notes}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteIntolerance(intolerance.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No food intolerances recorded yet</p>
            <p className="text-sm">Add foods that cause you reactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FoodIntolerances;
