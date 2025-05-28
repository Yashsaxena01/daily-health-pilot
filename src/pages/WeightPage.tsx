
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Weight, Plus, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWeightData } from "@/hooks/useWeightData";
import WeightGraph from "@/components/weight/WeightGraph";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const WeightPage = () => {
  const { weightData, addWeightEntry, loading } = useWeightData();
  const [weight, setWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [weightView, setWeightView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currentGraphDate, setCurrentGraphDate] = useState<Date>(new Date());

  const handleAddWeight = async () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) {
      toast({
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }
    
    await addWeightEntry(selectedDate || new Date(), numWeight);
    setWeight("");
    toast({
      description: "Weight added successfully",
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const latestWeight = weightData.length > 0 ? weightData[0].weight : null;
  const previousWeight = weightData.length > 1 ? weightData[1].weight : null;
  const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center mb-8">
        <Weight className="h-8 w-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {latestWeight ? `${latestWeight} kg` : "No data"}
            </p>
            {weightChange && (
              <p className={`text-sm flex items-center mt-2 ${
                weightChange > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  weightChange > 0 ? 'rotate-0' : 'rotate-180'
                }`} />
                {Math.abs(weightChange).toFixed(1)} kg
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{weightData.length}</p>
            <p className="text-sm text-gray-600 mt-2">Weight measurements</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">On Track</p>
            <p className="text-sm text-gray-600 mt-2">Keep up the good work!</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Weight Entry */}
      <Card className="border border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">Add Weight Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:flex-1">
              <Input
                type="number"
                step="0.1"
                placeholder="Enter your weight in kg"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddWeight();
                  }
                }}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleAddWeight} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg py-3">
              <Plus className="h-5 w-5 mr-2" />
              Add Weight
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Graph */}
      <Card className="border border-blue-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-xl text-blue-800">Weight Progress</CardTitle>
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            {(["daily", "weekly", "monthly"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setWeightView(v)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  weightView === v 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <div className="h-80">
              <WeightGraph 
                data={weightData} 
                view={weightView}
                currentDate={currentGraphDate}
                onDateChange={setCurrentGraphDate}
                showNavigation={true}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 flex-col">
              <Weight className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg mb-2">No weight data recorded yet</p>
              <p className="text-sm">Add your first entry to see your progress graph</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightPage;
