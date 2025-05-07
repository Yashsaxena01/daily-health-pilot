
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { Plus, Weight } from "lucide-react";

// Mock data for the chart
const generateMockData = () => {
  return Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    return {
      date: format(date, "MMM d"),
      weight: (70 + Math.random() * 2).toFixed(1)
    };
  });
};

const WeightTracker = () => {
  const [weight, setWeight] = useState("");
  const [weightData, setWeightData] = useState(generateMockData());
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");

  const handleAddWeight = () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return;
    
    const today = format(new Date(), "MMM d");
    
    // Check if we already have an entry for today
    const updatedData = [...weightData];
    const todayIndex = updatedData.findIndex(item => item.date === today);
    
    if (todayIndex >= 0) {
      updatedData[todayIndex] = { date: today, weight: numWeight.toFixed(1) };
    } else {
      updatedData.push({ date: today, weight: numWeight.toFixed(1) });
    }
    
    setWeightData(updatedData);
    setWeight("");
  };

  return (
    <div className="space-y-6">
      <Card>
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
      
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center">
            <Weight className="h-5 w-5 mr-1" />
            Weight History
          </h3>
          <div className="flex bg-muted rounded-lg overflow-hidden">
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
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weightData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
                axisLine={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#4ECDC4"
                strokeWidth={2}
                dot={{ r: 4, fill: "#4ECDC4", strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 6, fill: "#4ECDC4", strokeWidth: 2, stroke: "white" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;
