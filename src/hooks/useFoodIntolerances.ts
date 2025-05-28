
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface FoodIntolerance {
  id: string;
  food_name: string;
  category: string;
  reaction_level: 'mild' | 'severe';
  reaction_notes?: string;
  discovered_date: string;
}

export const useFoodIntolerances = () => {
  const [intolerances, setIntolerances] = useState<FoodIntolerance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntolerances = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching food intolerances...");
      
      const { data, error } = await supabase
        .from('food_intolerances')
        .select('*')
        .order('discovered_date', { ascending: false });

      if (error) {
        console.error('Error fetching food intolerances:', error);
        throw error;
      }

      console.log("Food intolerances fetched successfully:", data?.length || 0, "items");
      
      // Type cast the data to match our interface
      const typedData: FoodIntolerance[] = (data || []).map(item => ({
        id: item.id,
        food_name: item.food_name,
        category: item.category,
        reaction_level: item.reaction_level as 'mild' | 'severe',
        reaction_notes: item.reaction_notes,
        discovered_date: item.discovered_date
      }));
      
      setIntolerances(typedData);
    } catch (error) {
      console.error('Error fetching food intolerances:', error);
      setIntolerances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntolerances();
  }, [fetchIntolerances]);

  const addIntolerance = async (intolerance: Omit<FoodIntolerance, 'id'>) => {
    try {
      console.log("Adding food intolerance:", intolerance);
      
      const { data, error } = await supabase
        .from('food_intolerances')
        .insert({
          food_name: intolerance.food_name,
          category: intolerance.category,
          reaction_level: intolerance.reaction_level,
          reaction_notes: intolerance.reaction_notes,
          discovered_date: intolerance.discovered_date,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding food intolerance:", error);
        throw error;
      }
      
      if (data) {
        console.log("Food intolerance added successfully:", data);
        
        // Type cast the returned data
        const newIntolerance: FoodIntolerance = {
          id: data.id,
          food_name: data.food_name,
          category: data.category,
          reaction_level: data.reaction_level as 'mild' | 'severe',
          reaction_notes: data.reaction_notes,
          discovered_date: data.discovered_date
        };
        
        setIntolerances(prev => [newIntolerance, ...prev]);
        return newIntolerance;
      }
    } catch (error) {
      console.error('Error adding food intolerance:', error);
      toast({
        description: "Failed to add food intolerance",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteIntolerance = async (id: string) => {
    try {
      console.log("Deleting food intolerance:", id);
      
      const originalIntolerances = intolerances;
      setIntolerances(prev => prev.filter(item => item.id !== id));
      
      const { error } = await supabase
        .from('food_intolerances')
        .delete()
        .eq('id', id);

      if (error) {
        setIntolerances(originalIntolerances);
        throw error;
      }
      
      console.log("Food intolerance deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting food intolerance:', error);
      toast({
        description: "Failed to delete food intolerance",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    intolerances,
    loading,
    addIntolerance,
    deleteIntolerance,
    refreshIntolerances: fetchIntolerances
  };
};
