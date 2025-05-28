
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Utensils, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface FoodEntry {
  id: string;
  food_name: string;
  date: string;
  reaction_level: string;
  reaction_notes: string;
}

const FoodPage = () => {
  const [foodName, setFoodName] = useState("");
  const [reactionLevel, setReactionLevel] = useState("none");
  const [reactionNotes, setReactionNotes] = useState("");
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("food_intolerances")
        .select("*")
        .order("discovered_date", { ascending: false });

      if (error) throw error;
      
      const formattedEntries = (data || []).map(entry => ({
        id: entry.id,
        food_name: entry.food_name,
        date: entry.discovered_date,
        reaction_level: entry.reaction_level,
        reaction_notes: entry.reaction_notes || ""
      }));

      setEntries(formattedEntries);
    } catch (error: any) {
      console.error("Error fetching food entries:", error);
      toast({
        title: "Error",
        description: "Failed to load food data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFoodEntry = async () => {
    if (!foodName.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a food name",
        variant: "destructive",
      });
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("food_intolerances")
        .insert({
          food_name: foodName.trim(),
          discovered_date: today,
          reaction_level: reactionLevel,
          reaction_notes: reactionNotes.trim(),
          category: "elimination_diet"
        });

      if (error) throw error;

      setFoodName("");
      setReactionLevel("none");
      setReactionNotes("");
      fetchEntries();
      
      toast({
        title: "Success",
        description: "Food entry added successfully",
      });
    } catch (error: any) {
      console.error("Error adding food entry:", error);
      toast({
        title: "Error",
        description: "Failed to add food entry",
        variant: "destructive",
      });
    }
  };

  const getReactionColor = (level: string) => {
    switch (level) {
      case "none": return "bg-green-100 text-green-800";
      case "mild": return "bg-yellow-100 text-yellow-800";
      case "severe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="flex items-center mb-6">
        <Utensils className="h-6 w-6 mr-2 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Elimination Diet</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Food Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Food name (e.g., Eggs, Dairy, Wheat)"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Reaction Level</label>
            <div className="grid grid-cols-3 gap-2">
              {["none", "mild", "severe"].map((level) => (
                <Button
                  key={level}
                  variant={reactionLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReactionLevel(level)}
                  className={reactionLevel === level ? getReactionColor(level) : ""}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <Textarea
            placeholder="How did you feel? (optional)"
            value={reactionNotes}
            onChange={(e) => setReactionNotes(e.target.value)}
            rows={3}
          />
          
          <Button onClick={addFoodEntry} className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Food Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Food History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No food entries yet</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{entry.food_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReactionColor(entry.reaction_level)}`}>
                      {entry.reaction_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </p>
                  {entry.reaction_notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {entry.reaction_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodPage;
