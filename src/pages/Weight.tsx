import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WeightGraph from "@/components/weight/WeightGraph";
import { Plus, ArrowLeft, ArrowRight, Weight as WeightIcon, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parse, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWeightData } from "@/hooks/useWeightData";

const Weight = () => {
  const { weightData, addWeightEntry, refreshWeightData } = useWeightData();
  const [weight, setWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [editingEntry, setEditingEntry] = useState<{index: number, id?: string, date: string, weight: number} | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Refresh data when component mounts
  useEffect(() => {
    refreshWeightData();
    window.scrollTo(0, 0);
  }, []);

  const handleAddWeight = () => {
    if (!weight) return;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) {
      toast({
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }
    
    addWeightEntry(selectedDate || new Date(), numWeight);
    setWeight("");
  };

  const handleEditEntry = (index: number) => {
    const entry = weightData[index];
    setEditingEntry({
      index,
      id: entry.id,
      date: entry.date,
      weight: entry.weight
    });
    setDialogOpen(true);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !editingEntry.id) return;

    try {
      // Get the date object from the display string format
      let dateObj: Date;
      try {
        // Try to parse the date display string
        dateObj = parse(editingEntry.date, "MMM d", new Date());
        if (!isValid(dateObj)) {
          dateObj = new Date(); // Fallback to today if parsing fails
        }
      } catch (e) {
        dateObj = new Date(); // Fallback to today if parsing fails
      }

      // Update the entry with a direct call to Supabase
      const { data: supabaseClient } = await import('@/integrations/supabase/client');
      const { supabase } = supabaseClient;
      
      const { error } = await supabase
        .from('weight_entries')
        .update({ weight: editingEntry.weight })
        .eq('id', editingEntry.id);
        
      if (error) throw error;

      // Refresh data from the server
      refreshWeightData();
      
      setDialogOpen(false);
      setEditingEntry(null);
      
      toast({
        description: `Weight updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating weight entry:', error);
      toast({
        description: "Failed to update weight entry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (index: number) => {
    const entry = weightData[index];
    
    if (!entry.id) {
      toast({
        description: "Cannot delete entry without ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Delete the entry with a direct call to Supabase
      const { data: supabaseClient } = await import('@/integrations/supabase/client');
      const { supabase } = supabaseClient;
      
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', entry.id);
        
      if (error) throw error;

      // Refresh data from the server
      refreshWeightData();
      
      toast({
        description: "Weight entry deleted.",
      });
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      toast({
        description: "Failed to delete weight entry",
        variant: "destructive",
      });
    }
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
      
      <Card className="border-primary/10 mb-6">
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

      <Card className="border-primary/10 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Weight History Table</CardTitle>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weightData.map((entry, index) => (
                  <TableRow key={entry.id || index}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.weight}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditEntry(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => handleDeleteEntry(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No weight entries recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Weight Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <p className="mt-1">{editingEntry?.date}</p>
            </div>
            <div>
              <label htmlFor="edit-weight" className="text-sm font-medium">Weight</label>
              <Input
                id="edit-weight"
                type="number"
                step="0.1"
                value={editingEntry?.weight || ""}
                onChange={e => {
                  if (editingEntry) {
                    setEditingEntry({
                      ...editingEntry,
                      weight: parseFloat(e.target.value) || 0
                    });
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateEntry}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Weight;
