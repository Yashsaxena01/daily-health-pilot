
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface Meal {
  id?: string;
  title: string;
  time: string;
  description: string;
  completed: boolean;
}

export interface MealPlan {
  id?: string;
  date: string;
  meals: Meal[];
}

export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      
      // Get all meal plans
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .order('date');

      if (planError) throw planError;

      // Get all meals
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .select('*');

      if (mealError) throw mealError;

      // Organize meals by plan
      const organizedPlans = planData.map(plan => {
        const planMeals = mealData
          .filter(meal => meal.meal_plan_id === plan.id)
          .map(meal => ({
            id: meal.id,
            title: meal.title,
            time: meal.time || '',
            description: meal.description || '',
            completed: meal.completed
          }))
          .sort((a, b) => a.time.localeCompare(b.time));

        return {
          id: plan.id,
          date: plan.date,
          meals: planMeals
        };
      });

      setMealPlans(organizedPlans);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        description: "Failed to load meal plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (planId: string, meal: Omit<Meal, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          meal_plan_id: planId,
          title: meal.title,
          time: meal.time,
          description: meal.description,
          completed: meal.completed
        })
        .select();

      if (error) throw error;

      // Update local state
      setMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId
            ? {
                ...plan,
                meals: [...plan.meals, { ...meal, id: data[0].id }]
                  .sort((a, b) => a.time.localeCompare(b.time))
              }
            : plan
        )
      );

      return data[0].id;
    } catch (error) {
      console.error('Error adding meal:', error);
      toast({
        description: "Failed to add meal",
        variant: "destructive",
      });
    }
  };

  const updateMeal = async (planId: string, mealId: string, updatedMeal: Omit<Meal, 'id'>) => {
    try {
      const { error } = await supabase
        .from('meals')
        .update({
          title: updatedMeal.title,
          time: updatedMeal.time,
          description: updatedMeal.description,
          completed: updatedMeal.completed
        })
        .eq('id', mealId);

      if (error) throw error;

      // Update local state
      setMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId
            ? {
                ...plan,
                meals: plan.meals.map(meal => 
                  meal.id === mealId
                    ? { ...updatedMeal, id: mealId }
                    : meal
                ).sort((a, b) => a.time.localeCompare(b.time))
              }
            : plan
        )
      );
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        description: "Failed to update meal",
        variant: "destructive",
      });
    }
  };

  const deleteMeal = async (planId: string, mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      // Update local state
      setMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId
            ? {
                ...plan,
                meals: plan.meals.filter(meal => meal.id !== mealId)
              }
            : plan
        )
      );
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        description: "Failed to delete meal",
        variant: "destructive",
      });
    }
  };

  const createMealPlan = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({ date })
        .select();

      if (error) throw error;

      // Update local state
      setMealPlans(prevPlans => [...prevPlans, { id: data[0].id, date, meals: [] }]);

      return data[0].id;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast({
        description: "Failed to create meal plan",
        variant: "destructive",
      });
    }
  };

  return { 
    mealPlans, 
    loading, 
    addMeal, 
    updateMeal, 
    deleteMeal, 
    createMealPlan,
    refreshMealPlans: fetchMealPlans
  };
};
