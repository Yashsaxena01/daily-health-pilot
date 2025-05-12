
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface WeightEntry {
  id?: string;
  date: string;
  weight: number;
}

export const useWeightData = () => {
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeightData();
  }, []);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Format the data to match our expected format
      const formattedData = data.map(entry => ({
        id: entry.id,
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: entry.weight
      }));
      
      setWeightData(formattedData);
    } catch (error) {
      console.error('Error fetching weight data:', error);
      toast({
        description: "Failed to load weight data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addWeightEntry = async (date: Date, weight: number) => {
    try {
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const displayDateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Format as MMM d
      
      // Check if we already have an entry for this date
      const existingEntryIndex = weightData.findIndex(item => 
        new Date(item.date).toLocaleDateString() === date.toLocaleDateString()
      );
      
      if (existingEntryIndex >= 0 && weightData[existingEntryIndex].id) {
        // Update existing entry
        const { error } = await supabase
          .from('weight_entries')
          .update({ weight })
          .eq('id', weightData[existingEntryIndex].id);
          
        if (error) throw error;
        
        // Update local state
        const updatedData = [...weightData];
        updatedData[existingEntryIndex] = { 
          ...updatedData[existingEntryIndex], 
          weight 
        };
        
        setWeightData(updatedData);
        toast({
          description: "Weight updated successfully",
        });
      } else {
        // Insert new entry
        const { data, error } = await supabase
          .from('weight_entries')
          .insert({ date: dateStr, weight })
          .select();
          
        if (error) throw error;
        
        // Add to local state
        const newWeightData = [
          ...weightData,
          { 
            id: data[0].id,
            date: displayDateStr, 
            weight 
          }
        ];
        
        // Sort by date
        newWeightData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        
        setWeightData(newWeightData);
        
        toast({
          description: "Weight added successfully",
        });
      }
      
      // Refresh data from server to ensure consistency
      await fetchWeightData();
      
    } catch (error) {
      console.error('Error adding weight entry:', error);
      toast({
        description: "Failed to add weight entry",
        variant: "destructive",
      });
    }
  };

  return { weightData, loading, addWeightEntry, refreshWeightData: fetchWeightData };
};
