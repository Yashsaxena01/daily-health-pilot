
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WeightGraph from "@/components/weight/WeightGraph";
import { Plus, ArrowLeft, ArrowRight, Weight as WeightIcon, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parse, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const Weight = () => {
  const [weight, setWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [weightData, setWeightData] = useState<Array<{date: string, weight: number}>>([]);
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Force scroll to top when the component mounts
  useState(() => {
    window.scrollTo(0, 0);
  });

  const handleAddWeight = () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return;
    
    const dateStr = selectedDate ? format(selectedDate, "MMM d") : format(new Date(), "MMM d");
    
    // Check if we already have an entry for this date
    const updatedData = [...weightData];
    const dateIndex = updatedData.findIndex(item => item.date === dateStr);
    
    if (dateIndex >= 0) {
      updatedData[dateIndex] = { date: dateStr, weight: numWeight };
    } else {
      updatedData.push({ date: dateStr, weight: numWeight });
    }
    
    // Sort the data by date
    updatedData.sort((a, b) => {
      const dateA = parse(a.date, "MMM d", new Date());
      const dateB = parse(b.date, "MMM d", new Date());
      return dateA.getTime() - dateB.getTime();
    });
    
    setWeightData(updatedData);
    setWeight("");
    
    toast({
      description: `Weight recorded for ${dateStr}.`,
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                type="number"
                step="0.1"
                placeholder="Enter your weight"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
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
            <Button onClick={handleAddWeight} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" />
              Add Weight
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
          {weightData.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <WeightGraph data={weightData} view={view} />
              </div>
              
              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Previous</span>
                </div>
                <div className="font-medium">
                  {view === "daily" && "Daily view"}
                  {view === "weekly" && "Weekly view"}
                  {view === "monthly" && "Monthly view"}
                </div>
                <div className="flex items-center">
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No weight data recorded yet.</p>
              <p className="text-sm mt-2">Add your first weight entry above to see your progress.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Weight;
