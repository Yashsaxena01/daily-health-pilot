import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, ChevronUp, Plus, Trash, Edit, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useEliminationDiet } from "@/hooks/useEliminationDiet";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export interface EliminationDietProps {
  colorCoding?: boolean;
}

const EliminationDiet = ({ colorCoding = false }: EliminationDietProps) => {
  const { 
    categories, 
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryExpanded,
    addFood,
    updateFood,
    deleteFood,
    markFoodIntroduced,
    reorderCategories,
    reorderFoods,
    getTodaysFood
  } = useEliminationDiet();
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingFood, setIsAddingFood] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newFoodName, setNewFoodName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingFoodId, setEditingFoodId] = useState<{categoryId: string, foodId: string} | null>(null);
  const [editingFoodName, setEditingFoodName] = useState("");
  
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [reactionText, setReactionText] = useState("");
  const [reactionLevel, setReactionLevel] = useState<"none" | "mild" | "severe">("none");
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{type: 'category' | 'food', id: string, categoryId?: string} | null>(null);
  const dragOverItemRef = useRef<{type: 'category' | 'food', id: string, categoryId?: string} | null>(null);
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    console.log("Adding category:", newCategoryName);
    const success = await addCategory(newCategoryName.trim());
    if (success) {
      setNewCategoryName("");
      setIsAddingCategory(false);
      toast({
        description: "Category added successfully",
      });
    }
  };

  const handleEditCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) return;
    
    console.log("Updating category:", { categoryId, name: editingCategoryName });
    const success = await updateCategory(categoryId, editingCategoryName.trim());
    if (success) {
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast({
        description: "Category updated successfully",
      });
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    console.log("Deleting category:", categoryId);
    const success = await deleteCategory(categoryId);
    if (success) {
      toast({
        description: "Category deleted successfully",
      });
    }
  };
  
  const handleAddFood = async (categoryId: string) => {
    if (!newFoodName.trim()) return;
    
    console.log("Adding food:", { categoryId, name: newFoodName });
    const success = await addFood(categoryId, newFoodName.trim());
    if (success) {
      setNewFoodName("");
      setIsAddingFood(null);
      toast({
        description: "Food item added successfully",
      });
    }
  };
  
  const handleEditFood = async (categoryId: string, foodId: string) => {
    if (!editingFoodName.trim()) return;
    
    console.log("Updating food:", { categoryId, foodId, name: editingFoodName });
    const success = await updateFood(categoryId, foodId, { name: editingFoodName.trim() });
    if (success) {
      setEditingFoodId(null);
      setEditingFoodName("");
      toast({
        description: "Food item updated successfully",
      });
    }
  };
  
  const handleDeleteFood = async (categoryId: string, foodId: string) => {
    console.log("Deleting food:", { categoryId, foodId });
    const success = await deleteFood(categoryId, foodId);
    if (success) {
      toast({
        description: "Food item deleted successfully",
      });
    }
  };
  
  const handleToggleFood = (categoryId: string, foodId: string, food: any) => {
    console.log("Toggling food:", { categoryId, foodId, introduced: food.introduced });
    
    if (food.introduced) {
      // If already introduced, toggle it off
      updateFood(categoryId, foodId, { 
        introduced: false, 
        reaction: undefined, 
        introduction_date: undefined, 
        reaction_level: undefined 
      });
    } else {
      // If not introduced, show reaction form
      setSelectedFood({...food, categoryId, foodId});
    }
  };
  
  const handleSaveReaction = async () => {
    if (!selectedFood) return;
    
    console.log("Saving reaction:", {
      categoryId: selectedFood.categoryId,
      foodId: selectedFood.foodId,
      reactionLevel,
      reaction: reactionText
    });
    
    const success = await markFoodIntroduced(
      selectedFood.categoryId, 
      selectedFood.foodId, 
      reactionLevel, 
      reactionText || "No specific reaction noted."
    );
    
    if (success) {
      setSelectedFood(null);
      setReactionText("");
      setReactionLevel("none");
      toast({
        description: "Food reaction recorded successfully",
      });
    }
  };

  const getReactionColor = (reactionLevel?: string) => {
    if (!reactionLevel || !colorCoding) return "";
    switch (reactionLevel) {
      case "none": return "bg-green-500";
      case "mild": return "bg-yellow-500";
      case "severe": return "bg-red-500";
      default: return "";
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'category' | 'food', id: string, categoryId?: string) => {
    setDraggedItem({type, id, categoryId});
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (e: React.DragEvent, type: 'category' | 'food', id: string, categoryId?: string) => {
    e.preventDefault();
    dragOverItemRef.current = {type, id, categoryId};
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItem || !dragOverItemRef.current) return;
    
    const draggedType = draggedItem.type;
    const dragOverType = dragOverItemRef.current.type;
    
    if (draggedType === 'category' && dragOverType === 'food') return;
    
    if (draggedType === 'food' && dragOverType === 'food' &&
        draggedItem.categoryId !== dragOverItemRef.current.categoryId) return;
    
    if (draggedType === 'category' && dragOverType === 'category') {
      const categoryIds = categories.map(cat => cat.id!);
      const fromIndex = categoryIds.indexOf(draggedItem.id);
      const toIndex = categoryIds.indexOf(dragOverItemRef.current.id);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        const newCategoryIds = [...categoryIds];
        newCategoryIds.splice(fromIndex, 1);
        newCategoryIds.splice(toIndex, 0, draggedItem.id);
        
        reorderCategories(newCategoryIds);
      }
    } else if (draggedType === 'food' && dragOverType === 'food' && 
               draggedItem.categoryId === dragOverItemRef.current.categoryId) {
      const categoryId = draggedItem.categoryId!;
      const category = categories.find(c => c.id === categoryId);
      
      if (category) {
        const foodIds = category.foods.map(f => f.id!);
        const fromIndex = foodIds.indexOf(draggedItem.id);
        const toIndex = foodIds.indexOf(dragOverItemRef.current.id);
        
        if (fromIndex !== -1 && toIndex !== -1) {
          const newFoodIds = [...foodIds];
          newFoodIds.splice(fromIndex, 1);
          newFoodIds.splice(toIndex, 0, draggedItem.id);
          
          reorderFoods(categoryId, newFoodIds);
        }
      }
    }
    
    setDraggedItem(null);
    dragOverItemRef.current = null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
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
                disabled={!newCategoryName.trim()}
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
            <div className="space-y-2">
              <Label>Reaction Level:</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button" 
                  variant={reactionLevel === "none" ? "default" : "outline"}
                  className={reactionLevel === "none" ? "bg-green-500 hover:bg-green-600" : ""}
                  onClick={() => setReactionLevel("none")}
                >
                  No Reaction
                </Button>
                <Button 
                  type="button" 
                  variant={reactionLevel === "mild" ? "default" : "outline"}
                  className={reactionLevel === "mild" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                  onClick={() => setReactionLevel("mild")}
                >
                  Mild Reaction
                </Button>
                <Button 
                  type="button" 
                  variant={reactionLevel === "severe" ? "default" : "outline"}
                  className={reactionLevel === "severe" ? "bg-red-500 hover:bg-red-600" : ""}
                  onClick={() => setReactionLevel("severe")}
                >
                  Severe Reaction
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="reaction-details">Details (Optional)</Label>
              <Textarea
                id="reaction-details"
                placeholder="Describe any symptoms or reactions you experienced..."
                value={reactionText}
                onChange={e => setReactionText(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFood(null);
                  setReactionText("");
                  setReactionLevel("none");
                }}
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
        {categories.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No food categories yet. Add your first category to get started!</p>
          </div>
        )}
        
        {categories.map(category => (
          <div 
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, 'category', category.id!)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'category', category.id!)}
            onDrop={handleDrop}
            className={cn(
              "border rounded-lg",
              draggedItem?.type === 'category' && draggedItem.id === category.id ? 
                "opacity-50 border-dashed" : ""
            )}
          >
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
                
                {editingCategoryId === category.id ? (
                  <Input 
                    value={editingCategoryName}
                    onChange={e => setEditingCategoryName(e.target.value)}
                    className="max-w-[60%]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditCategory(category.id!);
                      }
                      if (e.key === 'Escape') {
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
                      }
                    }}
                  />
                ) : (
                  <h3 className="font-medium">{category.name}</h3>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {editingCategoryId === category.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => handleEditCategory(category.id!)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleCategoryExpanded(category.id!)}
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
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingCategoryName(category.name);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCategory(category.id!)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsAddingFood(category.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isAddingFood === category.id && (
              <Card className="mt-2 mx-2 mb-2">
                <CardContent className="pt-6">
                  <Label htmlFor="food-name">Food Name</Label>
                  <Input
                    id="food-name"
                    placeholder="e.g., Almond, Spinach, etc."
                    className="mt-2"
                    value={newFoodName}
                    onChange={e => setNewFoodName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFood(category.id!);
                      }
                      if (e.key === 'Escape') {
                        setNewFoodName("");
                        setIsAddingFood(null);
                      }
                    }}
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
                      onClick={() => handleAddFood(category.id!)}
                      disabled={!newFoodName.trim()}
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'food', food.id!, category.id)}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, 'food', food.id!, category.id)}
                      onDrop={handleDrop}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md",
                        food.introduced ? "bg-muted/50" : "hover:bg-muted/30",
                        draggedItem?.type === 'food' && draggedItem.id === food.id ? 
                          "opacity-50 border-dashed border" : ""
                      )}
                    >
                      <div className="flex-1">
                        {editingFoodId?.categoryId === category.id && editingFoodId?.foodId === food.id ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              value={editingFoodName}
                              onChange={e => setEditingFoodName(e.target.value)}
                              className="max-w-[60%]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditFood(category.id!, food.id!);
                                }
                                if (e.key === 'Escape') {
                                  setEditingFoodId(null);
                                  setEditingFoodName("");
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingFoodId(null);
                                setEditingFoodName("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditFood(category.id!, food.id!)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="cursor-move text-muted-foreground mr-1">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div
                              className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center mr-2 cursor-pointer transition-colors",
                                food.introduced
                                  ? "border-muted-foreground text-white"
                                  : "border-muted-foreground hover:border-primary",
                                getReactionColor(food.reaction_level)
                              )}
                              onClick={() => food.id && handleToggleFood(category.id!, food.id, food)}
                            >
                              {food.introduced && <Check className="h-3 w-3" />}
                            </div>
                            <span className={food.introduced ? "line-through text-muted-foreground" : ""}>
                              {food.name}
                            </span>
                            {!food.introduced && food.scheduled_date && (
                              <span className="text-xs ml-2 text-muted-foreground">
                                ({format(new Date(food.scheduled_date), "MMM d")})
                              </span>
                            )}
                          </div>
                        )}
                        
                        {food.introduced && food.reaction && !editingFoodId && (
                          <p className="text-xs text-muted-foreground ml-7 mt-1">
                            {food.reaction}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!(editingFoodId?.categoryId === category.id && editingFoodId?.foodId === food.id) && (
                          <>
                            {food.introduction_date && (
                              <span className="text-xs text-muted-foreground mr-2">
                                {format(new Date(food.introduction_date), "MMM d")}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingFoodId({categoryId: category.id!, foodId: food.id!});
                                setEditingFoodName(food.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteFood(category.id!, food.id!)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
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
