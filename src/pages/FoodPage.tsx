
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, BookOpen, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FoodRepository from "@/components/food/FoodRepository";

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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("food_intolerances")
        .insert({
          food_name: foodName.trim(),
          discovered_date: today,
          reaction_level: reactionLevel,
          reaction_notes: reactionNotes.trim(),
          category: "elimination_diet",
          user_id: user?.id || null
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
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center mb-8">
        <Utensils className="h-8 w-8 mr-3 text-emerald-600" />
        <h1 className="text-3xl font-bold text-gray-900">Elimination Diet</h1>
      </div>

      <Tabs defaultValue="repository" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="repository" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Food Repository
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Track Introduction
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="repository" className="mt-6">
          <FoodRepository />
        </TabsContent>
        
        <TabsContent value="tracking" className="mt-6">
          <Card className="border border-emerald-100">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-800">Add Food Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                placeholder="Food name (e.g., Eggs, Dairy, Wheat)"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="text-lg"
              />
              
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">Reaction Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {["none", "mild", "severe"].map((level) => (
                    <Button
                      key={level}
                      variant={reactionLevel === level ? "default" : "outline"}
                      size="lg"
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
                className="text-lg"
              />
              
              <Button onClick={addFoodEntry} className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-3">
                <Plus className="h-5 w-5 mr-2" />
                Add Food Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodPage;
