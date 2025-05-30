
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface Food {
  id?: string;
  name: string;
  introduced: boolean;
  introduction_date?: string;
  reaction?: string;
  reaction_level?: 'none' | 'mild' | 'severe';
  scheduled_date?: string;
  order?: number;
  category_id?: string;
}

export interface FoodCategory {
  id?: string;
  name: string;
  expanded: boolean;
  foods: Food[];
  order?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useEliminationDiet = () => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEliminationDiet();
  }, []);

  const fetchEliminationDiet = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching elimination diet data... (attempt ${retryCount + 1})`);
      
      // Test connection to both tables
      const { error: categoriesConnectionError } = await supabase
        .from('food_categories')
        .select('count', { count: 'exact', head: true });
      
      if (categoriesConnectionError) {
        console.error('Food categories connection test failed:', categoriesConnectionError);
        throw new Error(`Database connection failed: ${categoriesConnectionError.message}`);
      }

      const { error: foodsConnectionError } = await supabase
        .from('foods')
        .select('count', { count: 'exact', head: true });
      
      if (foodsConnectionError) {
        console.error('Foods connection test failed:', foodsConnectionError);
        throw new Error(`Database connection failed: ${foodsConnectionError.message}`);
      }
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('food_categories')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false })
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
      }

      // Fetch foods
      const { data: foodsData, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false });

      if (foodsError) {
        console.error('Error fetching foods:', foodsError);
        throw new Error(`Failed to fetch foods: ${foodsError.message}`);
      }

      console.log("Elimination diet data fetched successfully:", {
        categories: categoriesData?.length || 0,
        foods: foodsData?.length || 0
      });

      // Organize foods by category
      const organizedData = (categoriesData || []).map(category => ({
        id: category.id,
        name: category.name,
        expanded: category.expanded,
        order: category.order,
        foods: (foodsData || [])
          .filter(food => food.category_id === category.id)
          .map(food => ({
            id: food.id,
            name: food.name,
            introduced: food.introduced,
            introduction_date: food.introduction_date,
            reaction: food.reaction,
            scheduled_date: food.scheduled_date,
            order: food.order,
            reaction_level: food.reaction_level as 'none' | 'mild' | 'severe' | undefined
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }));

      setCategories(organizedData);
      setError(null);
      
      // Update scheduled dates if needed
      if (organizedData.length > 0) {
        updateScheduledDates(organizedData);
      }
    } catch (error: any) {
      console.error('Error fetching elimination diet data:', error);
      setError(error.message || 'Failed to load elimination diet data');
      
      // Retry logic for connection issues
      if (retryCount < 2 && (error.message?.includes('connection') || error.message?.includes('network'))) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => fetchEliminationDiet(retryCount + 1), (retryCount + 1) * 1000);
        return;
      }
      
      toast({
        description: error.message || "Failed to load elimination diet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScheduledDates = async (currentCategories = categories) => {
    try {
      const allFoods: {id: string, categoryId: string}[] = [];
      
      // Collect all non-introduced foods in their display order
      currentCategories.forEach(category => {
        category.foods
          .filter(food => !food.introduced)
          .forEach(food => {
            if (food.id) {
              allFoods.push({
                id: food.id,
                categoryId: category.id || ""
              });
            }
          });
      });
      
      // Calculate scheduled dates, starting with today
      const today = new Date();
      const updates: {id: string, date: string}[] = [];
      
      allFoods.forEach((food, index) => {
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + index);
        
        updates.push({
          id: food.id,
          date: scheduledDate.toISOString().split('T')[0]
        });
      });
      
      // Batch update in database
      for (const update of updates) {
        const { error } = await supabase
          .from('foods')
          .update({ scheduled_date: update.date })
          .eq('id', update.id);
          
        if (error) {
          console.error('Error updating scheduled date for food:', update.id, error);
        }
      }
      
      // Update local state
      setCategories(prev => 
        prev.map(category => ({
          ...category,
          foods: category.foods.map(food => {
            const update = updates.find(u => u.id === food.id);
            return update 
              ? { ...food, scheduled_date: update.date }
              : food;
          })
        }))
      );
    } catch (error) {
      console.error('Error updating scheduled dates:', error);
    }
  };

  const reorderCategories = async (orderedIds: string[]) => {
    try {
      // Update local state first for optimistic UI update
      const newCategories = [...categories];
      
      // Sort the categories based on the new order
      newCategories.sort((a, b) => {
        const aIndex = a.id ? orderedIds.indexOf(a.id) : -1;
        const bIndex = b.id ? orderedIds.indexOf(b.id) : -1;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      
      // Update the order property of each category
      const updatedCategories = newCategories.map((category, index) => ({
        ...category,
        order: index
      }));
      
      setCategories(updatedCategories);
      
      // Update in database
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from('food_categories')
          .update({ order: i })
          .eq('id', orderedIds[i]);
      }
      
      // Update scheduled dates after reordering
      await updateScheduledDates();
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast({
        description: "Failed to reorder categories",
        variant: "destructive",
      });
    }
  };

  const reorderFoods = async (categoryId: string, orderedIds: string[]) => {
    try {
      // Update local state first for optimistic UI update
      setCategories(prev => 
        prev.map(cat => {
          if (cat.id !== categoryId) return cat;
          
          const newFoods = [...cat.foods];
          
          // Sort the foods based on the new order
          newFoods.sort((a, b) => {
            const aIndex = a.id ? orderedIds.indexOf(a.id) : -1;
            const bIndex = b.id ? orderedIds.indexOf(b.id) : -1;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          
          // Update the order property of each food
          const updatedFoods = newFoods.map((food, index) => ({
            ...food,
            order: index
          }));
          
          return {
            ...cat,
            foods: updatedFoods
          };
        })
      );
      
      // Update in database
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from('foods')
          .update({ order: i })
          .eq('id', orderedIds[i]);
      }
      
      // Update scheduled dates after reordering
      await updateScheduledDates();
    } catch (error) {
      console.error('Error reordering foods:', error);
      toast({
        description: "Failed to reorder foods",
        variant: "destructive",
      });
    }
  };

  const addCategory = async (name: string) => {
    try {
      // Get the next order number
      const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order || 0), -1);
      
      const { data, error } = await supabase
        .from('food_categories')
        .insert({ name, expanded: true, order: maxOrder + 1 })
        .select();

      if (error) throw error;

      setCategories(prev => [...prev, {
        id: data[0].id,
        name,
        expanded: true,
        order: maxOrder + 1,
        foods: []
      }]);

      toast({
        description: `Added category: ${name}`,
      });

      await updateScheduledDates();
      
      return data[0].id;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        description: error.message || "Failed to add category",
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
      
      // Update scheduled dates
      await updateScheduledDates();
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
      // Find the category
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      // Get the next order number for this category
      const maxOrder = category.foods.reduce((max, food) => Math.max(max, food.order || 0), -1);
      
      const { data, error } = await supabase
        .from('foods')
        .insert({
          category_id: categoryId,
          name,
          introduced: false,
          order: maxOrder + 1
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
                  introduced: false,
                  order: maxOrder + 1
                }]
              }
            : cat
        )
      );

      toast({
        description: `Added food: ${name}`,
      });
      
      // Update scheduled dates
      await updateScheduledDates();

      return data[0].id;
    } catch (error: any) {
      console.error('Error adding food:', error);
      toast({
        description: error.message || "Failed to add food",
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
      const dbUpdates: any = {
        name: updates.name,
        introduced: updates.introduced,
        introduction_date: updates.introduced && !updates.introduction_date 
          ? new Date().toISOString().split('T')[0]
          : updates.introduction_date,
        reaction: updates.reaction,
        reaction_level: updates.reaction_level,
        scheduled_date: updates.scheduled_date
      };
      
      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => 
        dbUpdates[key] === undefined && delete dbUpdates[key]
      );
      
      const { error } = await supabase
        .from('foods')
        .update(dbUpdates)
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
      
      // If we introduced a food, update scheduled dates
      if (updates.introduced !== undefined) {
        await updateScheduledDates();
      }
    } catch (error: any) {
      console.error('Error updating food:', error);
      toast({
        description: error.message || "Failed to update food",
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
      
      // Update scheduled dates
      await updateScheduledDates();
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
      
      // Update scheduled dates
      await updateScheduledDates();
    } catch (error: any) {
      console.error('Error marking food as introduced:', error);
      toast({
        description: error.message || "Failed to update food status",
        variant: "destructive",
      });
    }
  };

  // New function to mark food as introduced by foodId only
  const markFoodAsIntroduced = async (
    foodId: string, 
    reactionLevel: 'none' | 'mild' | 'severe' = 'none',
    reactionNotes?: string
  ) => {
    try {
      // Find the category for this food
      let categoryId = '';
      for (const category of categories) {
        const food = category.foods.find(f => f.id === foodId);
        if (food) {
          categoryId = category.id || '';
          break;
        }
      }
      
      if (!categoryId) {
        throw new Error('Food not found in any category');
      }
      
      await markFoodIntroduced(categoryId, foodId, reactionLevel, reactionNotes);
    } catch (error: any) {
      console.error('Error marking food as introduced:', error);
      toast({
        description: error.message || "Failed to update food status",
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

  // Get today's recommended food to introduce
  const getTodaysFood = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // First pass: check for exact match on today's date
    for (const category of categories) {
      for (const food of category.foods) {
        if (!food.introduced && food.scheduled_date === today) {
          return { 
            food, 
            category 
          };
        }
      }
    }
    
    // Second pass: if no food is scheduled exactly for today, get the next one
    if (categories.length > 0) {
      const allNonIntroducedFoods = categories
        .flatMap(cat => 
          cat.foods
            .filter(food => !food.introduced) // Only non-introduced foods
            .map(food => ({ 
              food, 
              category: cat,
              date: food.scheduled_date || '9999-12-31' // Default to far future if no date
            }))
        )
        .sort((a, b) => a.date.localeCompare(b.date));
      
      if (allNonIntroducedFoods.length > 0) {
        const nextFood = allNonIntroducedFoods[0];
        return {
          food: nextFood.food,
          category: nextFood.category
        };
      }
    }
    
    return null;
  };

  return {
    categories,
    loading,
    error,
    addCategory: async (name: string) => {
      try {
        const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order || 0), -1);
        
        const { data, error } = await supabase
          .from('food_categories')
          .insert({ name, expanded: true, order: maxOrder + 1 })
          .select();

        if (error) throw error;

        setCategories(prev => [...prev, {
          id: data[0].id,
          name,
          expanded: true,
          order: maxOrder + 1,
          foods: []
        }]);

        toast({
          description: `Added category: ${name}`,
        });

        await updateScheduledDates();
        return data[0].id;
      } catch (error: any) {
        console.error('Error adding category:', error);
        toast({
          description: error.message || "Failed to add category",
          variant: "destructive",
        });
      }
    },
    updateCategory,
    deleteCategory,
    toggleCategoryExpanded,
    addFood,
    updateFood,
    deleteFood,
    markFoodIntroduced,
    markFoodAsIntroduced,
    reorderCategories,
    reorderFoods,
    getTodaysFood,
    refreshEliminationDiet: fetchEliminationDiet
  };
};
