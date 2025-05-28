
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Weight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format, subDays } from "date-fns";

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  displayDate: string;
}

const WeightPage = () => {
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);

      if (error) throw error;

      const formattedEntries = (data || []).map(entry => ({
        id: entry.id,
        date: entry.date,
        weight: Number(entry.weight),
        displayDate: format(new Date(entry.date), "MMM d")
      }));

      setEntries(formattedEntries);
    } catch (error: any) {
      console.error("Error fetching weight entries:", error);
      toast({
        title: "Error",
        description: "Failed to load weight data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addWeight = async () => {
    if (!weight || isNaN(Number(weight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("weight_entries")
        .insert({
          date: today,
          weight: Number(weight),
        });

      if (error) throw error;

      setWeight("");
      fetchEntries();
      
      toast({
        title: "Success",
        description: "Weight added successfully",
      });
    } catch (error: any) {
      console.error("Error adding weight:", error);
      toast({
        title: "Error",
        description: "Failed to add weight",
        variant: "destructive",
      });
    }
  };

  const chartData = entries.slice(0, 14).reverse();

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="flex items-center mb-6">
        <Weight className="h-6 w-6 mr-2 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Weight Tracker</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Today's Weight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="Enter weight (lbs)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addWeight} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weight Trend (Last 14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{format(new Date(entry.date), "MMM d, yyyy")}</span>
                  <span className="font-semibold text-gray-900">{entry.weight} lbs</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightPage;
