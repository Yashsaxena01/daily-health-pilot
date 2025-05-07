
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WeightGraph from "@/components/weight/WeightGraph";
import { Plus, ArrowLeft, ArrowRight, Weight as WeightIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";

const Weight = () => {
  const [weight, setWeight] = useState("");
  
  // Generate mock data
  const generateMockData = () => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = format(subDays(new Date(), 13 - i), "MMM d");
      const weightValue = (70 + Math.random() * 2).toFixed(1);
      return {
        date,
        weight: parseFloat(weightValue) // Convert to number
      };
    });
  };
  
  const [weightData, setWeightData] = useState(generateMockData());
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Force scroll to top when the component mounts
  useState(() => {
    window.scrollTo(0, 0);
  });

  const handleAddWeight = () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return;
    
    const today = format(new Date(), "MMM d");
    
    // Check if we already have an entry for today
    const updatedData = [...weightData];
    const todayIndex = updatedData.findIndex(item => item.date === today);
    
    if (todayIndex >= 0) {
      updatedData[todayIndex] = { date: today, weight: numWeight };
    } else {
      updatedData.push({ date: today, weight: numWeight });
    }
    
    setWeightData(updatedData);
    setWeight("");
    
    toast({
      description: "Weight recorded successfully.",
    });
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center">
          <WeightIcon className="mr-2 h-6 w-6" /> 
          Weight Tracker
        </h1>
        <p className="text-muted-foreground">Monitor your weight journey</p>
      </div>

      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              step="0.1"
              placeholder="Enter your weight"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddWeight} className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium">Weight History</CardTitle>
          <div className="flex bg-secondary rounded-lg overflow-hidden">
            {(["daily", "weekly", "monthly"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-medium ${
                  view === v ? "bg-primary text-white" : "text-muted-foreground"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <WeightGraph data={weightData} />
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Previous</span>
            </div>
            <div className="font-medium">
              Last 14 days
            </div>
            <div className="flex items-center">
              <span>Next</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Weight;
