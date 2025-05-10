
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface Food {
  id?: string;
  name: string;
  introduced: boolean;
  introduction_date?: string;
  reaction?: string;
  reaction_level?: 'none' | 'mild' | 'severe';
}

export interface FoodCategory {
  id?: string;
  name: string;
  expanded: boolean;
  foods: Food[];
}

export const useEliminationDiet = () => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEliminationDiet();
  }, []);

  const fetchEliminationDiet = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('food_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch foods
      const { data: foodsData, error: foodsError } = await supabase
        .from('foods')
        .select('*');

      if (foodsError) throw foodsError;

      // Organize foods by category
      const organizedData = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        expanded: category.expanded,
        foods: foodsData
          .filter(food => food.category_id === category.id)
          .map(food => ({
            id: food.id,
            name: food.name,
            introduced: food.introduced,
            introduction_date: food.introduction_date,
            reaction: food.reaction,
            reaction_level: food.reaction_level as 'none' | 'mild' | 'severe' | undefined
          }))
      }));

      setCategories(organizedData);
    } catch (error) {
      console.error('Error fetching elimination diet data:', error);
      toast({
        description: "Failed to load elimination diet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .insert({ name, expanded: true })
        .select();

      if (error) throw error;

      setCategories(prev => [...prev, {
        id: data[0].id,
        name,
        expanded: true,
        foods: []
      }]);

      toast({
        description: `Added category: ${name}`,
      });

      return data[0].id;
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('food_categories')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === id ? { ...cat, name } : cat
        )
      );

      toast({
        description: `Updated category: ${name}`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));

      toast({
        description: "Category deleted",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const toggleCategoryExpanded = async (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    try {
      const { error } = await supabase
        .from('food_categories')
        .update({ expanded: !category.expanded })
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === id ? { ...cat, expanded: !cat.expanded } : cat
        )
      );
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const addFood = async (categoryId: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('foods')
        .insert({
          category_id: categoryId,
          name,
          introduced: false
        })
        .select();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId
            ? {
                ...cat,
                foods: [...cat.foods, {
                  id: data[0].id,
                  name,
                  introduced: false
                }]
              }
            : cat
        )
      );

      toast({
        description: `Added food: ${name}`,
      });

      return data[0].id;
    } catch (error) {
      console.error('Error adding food:', error);
      toast({
        description: "Failed to add food",
        variant: "destructive",
      });
    }
  };

  const updateFood = async (
    categoryId: string, 
    foodId: string, 
    updates: Partial<Food>
  ) => {
    try {
      const { error } = await supabase
        .from('foods')
        .update({
          name: updates.name,
          introduced: updates.introduced,
          introduction_date: updates.introduced && !updates.introduction_date 
            ? new Date().toISOString().split('T')[0]
            : updates.introduction_date,
          reaction: updates.reaction,
          reaction_level: updates.reaction_level
        })
        .eq('id', foodId);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId
            ? {
                ...cat,
                foods: cat.foods.map(food => 
                  food.id === foodId
                    ? { 
                        ...food, 
                        ...updates,
                        introduction_date: updates.introduced && !food.introduction_date && !updates.introduction_date
                          ? new Date().toISOString().split('T')[0]
                          : updates.introduction_date || food.introduction_date
                      }
                    : food
                )
              }
            : cat
        )
      );

      toast({
        description: `Updated food: ${updates.name || 'food'}`,
      });
    } catch (error) {
      console.error('Error updating food:', error);
      toast({
        description: "Failed to update food",
        variant: "destructive",
      });
    }
  };

  const deleteFood = async (categoryId: string, foodId: string) => {
    try {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', foodId);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId
            ? {
                ...cat,
                foods: cat.foods.filter(food => food.id !== foodId)
              }
            : cat
        )
      );

      toast({
        description: "Food deleted",
      });
    } catch (error) {
      console.error('Error deleting food:', error);
      toast({
        description: "Failed to delete food",
        variant: "destructive",
      });
    }
  };

  const markFoodIntroduced = async (
    categoryId: string, 
    foodId: string, 
    reactionLevel: 'none' | 'mild' | 'severe' = 'none',
    reactionNotes?: string
  ) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('foods')
        .update({
          introduced: true,
          introduction_date: today,
          reaction: reactionNotes,
          reaction_level: reactionLevel
        })
        .eq('id', foodId);

      if (error) throw error;

      // Also create an entry in food_summaries and introduced_foods if needed
      await updateFoodSummary(
        categoryId, 
        foodId, 
        reactionLevel, 
        reactionNotes
      );

      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId
            ? {
                ...cat,
                foods: cat.foods.map(food => 
                  food.id === foodId
                    ? { 
                        ...food, 
                        introduced: true,
                        introduction_date: today,
                        reaction: reactionNotes,
                        reaction_level: reactionLevel
                      }
                    : food
                )
              }
            : cat
        )
      );

      toast({
        description: "Food marked as introduced",
      });
    } catch (error) {
      console.error('Error marking food as introduced:', error);
      toast({
        description: "Failed to update food status",
        variant: "destructive",
      });
    }
  };

  // Helper function to update food summary when a food is introduced
  const updateFoodSummary = async (
    categoryId: string,
    foodId: string,
    reactionLevel: 'none' | 'mild' | 'severe',
    reactionNotes?: string
  ) => {
    try {
      // Find the food and category
      const category = categories.find(cat => cat.id === categoryId);
      const food = category?.foods.find(f => f.id === foodId);
      
      if (!category || !food) return;

      // Check if we already have a food summary
      const { data: existingSummary } = await supabase
        .from('food_summaries')
        .select('*')
        .limit(1);

      let summaryId;

      // Create or use existing summary
      if (!existingSummary || existingSummary.length === 0) {
        const { data: newSummary } = await supabase
          .from('food_summaries')
          .insert({ streak: 0 })
          .select();
        
        summaryId = newSummary?.[0]?.id;
      } else {
        summaryId = existingSummary[0].id;
      }

      if (!summaryId) return;

      // Add to introduced foods
      await supabase
        .from('introduced_foods')
        .insert({
          food_summary_id: summaryId,
          name: food.name,
          category: category.name,
          reaction: reactionLevel,
          date: new Date().toISOString().split('T')[0]
        });

    } catch (error) {
      console.error('Error updating food summary:', error);
    }
  };

  return {
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
    refreshEliminationDiet: fetchEliminationDiet
  };
};
