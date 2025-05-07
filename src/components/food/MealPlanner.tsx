
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Plus, Save, X } from "lucide-react";

interface MealPlan {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const initialMealPlans: MealPlan[] = daysOfWeek.map((day, index) => ({
  id: (index + 1).toString(),
  day,
  breakfast: "",
  lunch: "",
  dinner: "",
  snacks: ""
}));

const MealPlanner = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(initialMealPlans);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const handleEdit = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };
  
  const handleSave = () => {
    if (!editingCell) return;
    
    const { id, field } = editingCell;
    
    setMealPlans(prev => 
      prev.map(plan => 
        plan.id === id 
          ? { ...plan, [field]: editValue } 
          : plan
      )
    );
    
    setEditingCell(null);
    setEditValue("");
  };
  
  const handleCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weekly Meal Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Day</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                  <TableHead>Snacks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mealPlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.day}</TableCell>
                    {["breakfast", "lunch", "dinner", "snacks"].map(field => (
                      <TableCell key={`${plan.id}-${field}`}>
                        {editingCell?.id === plan.id && editingCell?.field === field ? (
                          <div className="flex flex-col gap-2">
                            <Textarea 
                              value={editValue} 
                              onChange={e => setEditValue(e.target.value)} 
                              className="min-h-[80px]"
                              placeholder={`Enter ${field} foods...`}
                            />
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0" 
                                onClick={handleCancel}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={handleSave}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleEdit(plan.id, field, plan[field as keyof MealPlan] as string)} 
                            className="flex items-center justify-between min-h-[40px] cursor-pointer hover:bg-muted/20 p-1 rounded"
                          >
                            {plan[field as keyof MealPlan] || (
                              <span className="text-muted-foreground text-sm italic">Click to add</span>
                            )}
                            <Edit className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanner;
