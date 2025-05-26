
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, Apple, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEliminationDiet } from "@/hooks/useEliminationDiet";
import { useFoodIntolerances } from "@/hooks/useFoodIntolerances";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TodaysFoodIntroduction = () => {
  const { getTodaysFood, markFoodAsIntroduced } = useEliminationDiet();
  const { addIntolerance } = useFoodIntolerances();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reaction, setReaction] = useState<"none" | "mild" | "severe">("none");
  const [reactionNotes, setReactionNotes] = useState("");

  const todaysFood = getTodaysFood();

  const handleMarkCompleted = async () => {
    if (!todaysFood) return;

    try {
      // Mark food as introduced
      await markFoodAsIntroduced(todaysFood.food.id, reaction, reactionNotes);

      // If there's a reaction, add to intolerances
      if (reaction !== "none") {
        await addIntolerance({
          food_name: todaysFood.food.name,
          category: todaysFood.category.name,
          reaction_level: reaction as "mild" | "severe",
          reaction_notes: reactionNotes,
          discovered_date: new Date().toISOString().split('T')[0]
        });
      }

      setIsDialogOpen(false);
      setReaction("none");
      setReactionNotes("");
      
      toast({
        description: `${todaysFood.food.name} introduction recorded successfully`,
      });
    } catch (error) {
      console.error('Error recording food introduction:', error);
      toast({
        description: "Failed to record food introduction",
        variant: "destructive",
      });
    }
  };

  const getReactionColor = (level: string) => {
    switch (level) {
      case "none": return "bg-orange-500";
      case "mild": return "bg-yellow-500";
      case "severe": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (!todaysFood) {
    return null;
  }

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Apple className="h-5 w-5" />
          Today's Food Introduction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-lg">{todaysFood.food.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{todaysFood.category.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  Scheduled for today
                </span>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                  <Check className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Food Introduction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Food: {todaysFood.food.name}</p>
                    <p className="text-sm text-muted-foreground">Category: {todaysFood.category.name}</p>
                  </div>

                  <div>
                    <Label>How did you react to this food?</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button 
                        type="button"
                        variant={reaction === "none" ? "default" : "outline"}
                        className={cn(
                          "flex flex-col h-auto py-3",
                          reaction === "none" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""
                        )}
                        onClick={() => setReaction("none")}
                      >
                        <div className={cn("h-3 w-3 rounded-full mb-1", getReactionColor("none"))} />
                        <span className="text-xs">No Reaction</span>
                      </Button>
                      <Button 
                        type="button"
                        variant={reaction === "mild" ? "default" : "outline"}
                        className={cn(
                          "flex flex-col h-auto py-3",
                          reaction === "mild" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""
                        )}
                        onClick={() => setReaction("mild")}
                      >
                        <div className={cn("h-3 w-3 rounded-full mb-1", getReactionColor("mild"))} />
                        <span className="text-xs">Mild</span>
                      </Button>
                      <Button 
                        type="button"
                        variant={reaction === "severe" ? "default" : "outline"}
                        className={cn(
                          "flex flex-col h-auto py-3",
                          reaction === "severe" ? "bg-red-500 hover:bg-red-600 text-white" : ""
                        )}
                        onClick={() => setReaction("severe")}
                      >
                        <div className={cn("h-3 w-3 rounded-full mb-1", getReactionColor("severe"))} />
                        <span className="text-xs">Severe</span>
                      </Button>
                    </div>
                  </div>

                  {reaction !== "none" && (
                    <div>
                      <Label htmlFor="reaction-notes">Describe your reaction</Label>
                      <Textarea 
                        id="reaction-notes"
                        value={reactionNotes}
                        onChange={(e) => setReactionNotes(e.target.value)}
                        placeholder="Describe how you felt after eating this food..."
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      onClick={handleMarkCompleted}
                    >
                      Record Introduction
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysFoodIntroduction;
