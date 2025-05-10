
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface IntroducedFood {
  id?: string;
  name: string;
  category: string;
  reaction: string;
  date: string;
}

export interface FoodSummary {
  id?: string;
  streak: number;
  lastJunkFood: { date: string; item: string } | null;
  introducedFoods: IntroducedFood[];
  todaysFood?: {
    name: string;
    category: string;
  };
  nextMeal?: {
    type: string;
    time: string;
    food: string;
  };
}

export const useFoodSummary = () => {
  const [summaryData, setSummaryData] = useState<FoodSummary>({
    streak: 0,
    lastJunkFood: null,
    introducedFoods: [],
    todaysFood: undefined,
    nextMeal: undefined
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodSummary();
  }, []);

  const fetchFoodSummary = async () => {
    try {
      setLoading(true);
      
      // Get food summary
      const { data: summaryResult, error: summaryError } = await supabase
        .from('food_summaries')
        .select('*')
        .limit(1);

      if (summaryError) throw summaryError;

      // If no summary exists, create one
      let summary = summaryResult && summaryResult.length > 0 ? summaryResult[0] : null;
      
      if (!summary) {
        const { data: newSummary, error: createError } = await supabase
          .from('food_summaries')
          .insert({ streak: 0 })
          .select();
          
        if (createError) throw createError;
        summary = newSummary[0];
      }

      // Get introduced foods
      const { data: introducedFoodsData, error: foodsError } = await supabase
        .from('introduced_foods')
        .select('*')
        .eq('food_summary_id', summary.id)
        .order('date', { ascending: false });

      if (foodsError) throw foodsError;

      // Get next food to introduce (from foods table where introduced=false)
      const { data: nextFoodData } = await supabase
        .from('foods')
        .select(`
          id,
          name,
          food_categories (
            name
          )
        `)
        .eq('introduced', false)
        .limit(1);

      // Get next meal from meal_plans and meals tables
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysMealPlan } = await supabase
        .from('meal_plans')
        .select(`
          id,
          meals (
            id,
            title,
            time,
            description,
            completed
          )
        `)
        .eq('date', today)
        .limit(1);

      let nextMealInfo;
      if (todaysMealPlan && todaysMealPlan.length > 0 && todaysMealPlan[0].meals) {
        const uncompletedMeals = todaysMealPlan[0].meals
          .filter(meal => !meal.completed)
          .sort((a, b) => a.time.localeCompare(b.time));
          
        if (uncompletedMeals.length > 0) {
          const nextMeal = uncompletedMeals[0];
          nextMealInfo = {
            type: nextMeal.title,
            time: nextMeal.time,
            food: nextMeal.description || "No description"
          };
        }
      }

      // Format the data
      const formattedData: FoodSummary = {
        id: summary.id,
        streak: summary.streak || 0,
        lastJunkFood: summary.last_junk_food 
          ? { date: summary.last_junk_food, item: 'Unknown food' } 
          : null,
        introducedFoods: introducedFoodsData.map(food => ({
          id: food.id,
          name: food.name,
          category: food.category,
          reaction: food.reaction,
          date: food.date
        })),
        todaysFood: nextFoodData && nextFoodData.length > 0 
          ? {
              name: nextFoodData[0].name,
              category: nextFoodData[0].food_categories?.name || 'Unknown'
            }
          : undefined,
        nextMeal: nextMealInfo
      };

      setSummaryData(formattedData);
    } catch (error) {
      console.error('Error fetching food summary:', error);
      toast({
        description: "Failed to load food summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async (newStreak: number) => {
    try {
      if (!summaryData.id) return;
      
      const { error } = await supabase
        .from('food_summaries')
        .update({ streak: newStreak })
        .eq('id', summaryData.id);

      if (error) throw error;

      setSummaryData(prev => ({ ...prev, streak: newStreak }));
      
      toast({
        description: `Streak updated to ${newStreak} days`,
      });
    } catch (error) {
      console.error('Error updating streak:', error);
      toast({
        description: "Failed to update streak",
        variant: "destructive",
      });
    }
  };

  const recordJunkFood = async (item: string) => {
    try {
      if (!summaryData.id) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('food_summaries')
        .update({ 
          streak: 0,
          last_junk_food: today
        })
        .eq('id', summaryData.id);

      if (error) throw error;

      setSummaryData(prev => ({ 
        ...prev, 
        streak: 0,
        lastJunkFood: { date: today, item }
      }));
      
      toast({
        description: "Junk food recorded, streak reset",
      });
    } catch (error) {
      console.error('Error recording junk food:', error);
      toast({
        description: "Failed to record junk food",
        variant: "destructive",
      });
    }
  };

  const incrementStreak = async () => {
    await updateStreak(summaryData.streak + 1);
  };

  const resetStreak = async () => {
    await updateStreak(0);
  };

  return {
    summaryData,
    loading,
    updateStreak,
    incrementStreak,
    resetStreak,
    recordJunkFood,
    refreshFoodSummary: fetchFoodSummary
  };
};
