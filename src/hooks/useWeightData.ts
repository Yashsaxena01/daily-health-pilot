
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';

export interface WeightEntry {
  id?: string;
  date: string;
  weight: number;
  rawDate?: Date;
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
      console.log("Fetching weight data...");
      
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .order('date', { ascending: false }); // Most recent first

      if (error) {
        console.error('Error fetching weight data:', error);
        throw error;
      }

      console.log("Weight data fetched successfully:", data?.length || 0, "entries");

      // Format the data to match our expected format
      const formattedData = (data || []).map(entry => {
        const rawDate = parseISO(entry.date);
        return {
          id: entry.id,
          date: format(rawDate, 'MMM d'),
          weight: entry.weight,
          rawDate: rawDate
        };
      });
      
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
      const displayDateStr = format(date, 'MMM d'); // Format as MMM d
      
      console.log("Adding weight entry:", { date: dateStr, weight });
      
      // Check if we already have an entry for this date
      const existingEntryIndex = weightData.findIndex(item => 
        item.rawDate && format(item.rawDate, 'yyyy-MM-dd') === dateStr
      );
      
      if (existingEntryIndex >= 0 && weightData[existingEntryIndex].id) {
        // Update existing entry
        const { error } = await supabase
          .from('weight_entries')
          .update({ weight })
          .eq('id', weightData[existingEntryIndex].id);
          
        if (error) throw error;
        
        console.log("Weight entry updated successfully");
        
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
        
        console.log("Weight entry added successfully:", data[0]);
        
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

  // Group weight data by weeks for accordion display
  const getWeightDataByWeeks = () => {
    const weeks: Record<string, WeightEntry[]> = {};
    
    weightData.forEach(entry => {
      if (entry.rawDate) {
        const weekStart = format(entry.rawDate, 'MMM d, yyyy');
        const weekKey = `Week of ${weekStart}`;
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = [];
        }
        weeks[weekKey].push(entry);
      }
    });
    
    return Object.entries(weeks).map(([week, entries]) => ({
      week,
      entries: entries.sort((a, b) => 
        (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0)
      )
    }));
  };

  // Group weight data by months for accordion display
  const getWeightDataByMonths = () => {
    const months: Record<string, WeightEntry[]> = {};
    
    weightData.forEach(entry => {
      if (entry.rawDate) {
        const monthKey = format(entry.rawDate, 'MMM yyyy');
        
        if (!months[monthKey]) {
          months[monthKey] = [];
        }
        months[monthKey].push(entry);
      }
    });
    
    return Object.entries(months).map(([month, entries]) => ({
      month,
      entries: entries.sort((a, b) => 
        (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0)
      )
    }));
  };

  return { 
    weightData, 
    loading, 
    addWeightEntry, 
    refreshWeightData: fetchWeightData,
    getWeightDataByWeeks,
    getWeightDataByMonths
  };
};
