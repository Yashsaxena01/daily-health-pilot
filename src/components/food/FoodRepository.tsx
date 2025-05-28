
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  scheduled_date?: string;
  introduced: boolean;
}

interface Category {
  id: string;
  name: string;
}

const FoodRepository = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newFoodName, setNewFoodName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("food_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Fetch foods with categories
      const { data: foodsData, error: foodsError } = await supabase
        .from("foods")
        .select(`
          *,
          food_categories (
            name
          )
        `)
        .order("name");

      if (foodsError) throw foodsError;

      setCategories(categoriesData || []);
      
      const formattedFoods = (foodsData || []).map(food => ({
        id: food.id,
        name: food.name,
        category: food.food_categories?.name || "Uncategorized",
        image_url: `https://images.unsplash.com/400x300/?${encodeURIComponent(food.name)}`,
        scheduled_date: food.scheduled_date,
        introduced: food.introduced || false
      }));
      
      setFoods(formattedFoods);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load food repository",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUnsplashImage = (foodName: string) => {
    const searchQuery = encodeURIComponent(foodName);
    return `https://images.unsplash.com/400x300/?${searchQuery}`;
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("food_categories")
        .insert({
          name: newCategoryName.trim(),
          user_id: user?.id || null
        });

      if (error) throw error;

      setNewCategoryName("");
      fetchData();
      
      toast({
        description: "Category added successfully",
      });
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const addFood = async () => {
    if (!newFoodName.trim() || !selectedCategory) {
      toast({
        title: "Missing information",
        description: "Please enter food name and select category",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("foods")
        .insert({
          name: newFoodName.trim(),
          category_id: selectedCategory,
          introduced: false
        });

      if (error) throw error;

      setNewFoodName("");
      setSelectedCategory("");
      fetchData();
      
      toast({
        description: "Food added to repository",
      });
    } catch (error: any) {
      console.error("Error adding food:", error);
      toast({
        title: "Error",
        description: "Failed to add food",
        variant: "destructive",
      });
    }
  };

  const scheduleFood = async (foodId: string, date: string) => {
    try {
      const { error } = await supabase
        .from("foods")
        .update({ scheduled_date: date })
        .eq("id", foodId);

      if (error) throw error;

      fetchData();
      
      toast({
        description: "Food scheduled for introduction",
      });
    } catch (error: any) {
      console.error("Error scheduling food:", error);
      toast({
        title: "Error",
        description: "Failed to schedule food",
        variant: "destructive",
      });
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFoods = filteredFoods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-emerald-100">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-800">Food Repository</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Category */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addCategory} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Food */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add new food item"
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button onClick={addFood} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Food Categories */}
      <div className="space-y-4">
        {Object.entries(groupedFoods).map(([category, categoryFoods]) => (
          <Card key={category} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-800">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryFoods.map((food) => (
                  <div key={food.id} className="border rounded-lg p-3 space-y-3">
                    <img
                      src={getUnsplashImage(food.name)}
                      alt={food.name}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/400x300/?food`;
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{food.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        {food.introduced ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Introduced
                          </Badge>
                        ) : food.scheduled_date ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Scheduled
                          </Badge>
                        ) : (
                          <input
                            type="date"
                            onChange={(e) => scheduleFood(food.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FoodRepository;
