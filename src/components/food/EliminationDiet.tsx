
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodCategory {
  id: string;
  name: string;
  foods: Food[];
  expanded: boolean;
}

interface Food {
  id: string;
  name: string;
  introduced: boolean;
  date?: string;
  reaction?: string;
}

const initialCategories: FoodCategory[] = [
  {
    id: "1",
    name: "Grains",
    foods: [
      { id: "g1", name: "Wheat", introduced: false },
      { id: "g2", name: "Rice", introduced: true, date: "2023-04-15", reaction: "No reaction" },
      { id: "g3", name: "Oats", introduced: false },
      { id: "g4", name: "Corn", introduced: false },
    ],
    expanded: true,
  },
  {
    id: "2",
    name: "Dairy",
    foods: [
      { id: "d1", name: "Milk", introduced: false },
      { id: "d2", name: "Cheese", introduced: false },
      { id: "d3", name: "Yogurt", introduced: false },
    ],
    expanded: true,
  },
  {
    id: "3",
    name: "FODMAPs",
    foods: [
      { id: "f1", name: "Onion", introduced: false },
      { id: "f2", name: "Garlic", introduced: false },
      { id: "f3", name: "Apples", introduced: false },
      { id: "f4", name: "Honey", introduced: false },
    ],
    expanded: false,
  },
];

const EliminationDiet = () => {
  const [categories, setCategories] = useState<FoodCategory[]>(initialCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingFood, setIsAddingFood] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newFoodName, setNewFoodName] = useState("");
  
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [reactionText, setReactionText] = useState("");
  
  const toggleCategoryExpand = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };
  
  const handleAddCategory = () => {
    if (!newCategoryName) return;
    
    const newCategory: FoodCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      foods: [],
      expanded: true,
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };
  
  const handleAddFood = (categoryId: string) => {
    if (!newFoodName) return;
    
    const newFood: Food = {
      id: Date.now().toString(),
      name: newFoodName,
      introduced: false,
    };
    
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, foods: [...cat.foods, newFood] } 
          : cat
      )
    );
    
    setNewFoodName("");
    setIsAddingFood(null);
  };
  
  const handleToggleFood = (categoryId: string, foodId: string) => {
    // Find the food
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const food = category.foods.find(f => f.id === foodId);
    if (!food) return;
    
    if (food.introduced) {
      // If already introduced, just toggle it off
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                foods: cat.foods.map(f =>
                  f.id === foodId ? { ...f, introduced: false, reaction: undefined, date: undefined } : f
                )
              } 
            : cat
        )
      );
    } else {
      // If not introduced, show reaction form
      setSelectedFood(food);
    }
  };
  
  const handleSaveReaction = () => {
    if (!selectedFood) return;
    
    const selectedCategoryId = categories.find(cat => 
      cat.foods.some(f => f.id === selectedFood.id)
    )?.id;
    
    if (!selectedCategoryId) return;
    
    setCategories(prev => 
      prev.map(cat => 
        cat.id === selectedCategoryId 
          ? { 
              ...cat, 
              foods: cat.foods.map(f =>
                f.id === selectedFood.id 
                  ? { 
                      ...f, 
                      introduced: true, 
                      date: new Date().toISOString().split('T')[0], 
                      reaction: reactionText || "No specific reaction noted." 
                    } 
                  : f
              )
            } 
          : cat
      )
    );
    
    setSelectedFood(null);
    setReactionText("");
  };

  return (
    <div className="space-y-6">
      {!isAddingCategory && (
        <Button onClick={() => setIsAddingCategory(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add Food Category
        </Button>
      )}
      
      {isAddingCategory && (
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="e.g., Nuts, Fruits, etc."
              className="mt-2"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setNewCategoryName("");
                  setIsAddingCategory(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName}
                className="flex-1"
              >
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {selectedFood && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">How did you react to {selectedFood.name}?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe any symptoms or reactions you experienced..."
              value={reactionText}
              onChange={e => setReactionText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFood(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReaction}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Save Reaction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {categories.map(category => (
          <div key={category.id}>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
              <h3 className="font-medium">{category.name}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleCategoryExpand(category.id)}
                >
                  {category.expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsAddingFood(category.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isAddingFood === category.id && (
              <Card className="mt-2">
                <CardContent className="pt-6">
                  <Label htmlFor="food-name">Food Name</Label>
                  <Input
                    id="food-name"
                    placeholder="e.g., Almond, Spinach, etc."
                    className="mt-2"
                    value={newFoodName}
                    onChange={e => setNewFoodName(e.target.value)}
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewFoodName("");
                        setIsAddingFood(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleAddFood(category.id)}
                      disabled={!newFoodName}
                      className="flex-1"
                    >
                      Add Food
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {category.expanded && (
              <div className="pl-3 pr-1 py-2 space-y-1">
                {category.foods.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-2">No foods added yet</p>
                ) : (
                  category.foods.map(food => (
                    <div
                      key={food.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md",
                        food.introduced ? "bg-muted/50" : "hover:bg-muted/30"
                      )}
                    >
                      <div>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "h-5 w-5 rounded-full border flex items-center justify-center mr-2",
                              food.introduced
                                ? "bg-mint border-mint text-white"
                                : "border-muted-foreground"
                            )}
                            onClick={() => handleToggleFood(category.id, food.id)}
                          >
                            {food.introduced && <Check className="h-3 w-3" />}
                          </div>
                          <span className={food.introduced ? "line-through text-muted-foreground" : ""}>
                            {food.name}
                          </span>
                        </div>
                        {food.introduced && food.reaction && (
                          <p className="text-xs text-muted-foreground ml-7 mt-1">
                            {food.reaction}
                          </p>
                        )}
                      </div>
                      {food.date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(food.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EliminationDiet;
