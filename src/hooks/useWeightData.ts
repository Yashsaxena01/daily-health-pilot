
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeightData();
  }, []);

  const fetchWeightData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching weight data... (attempt ${retryCount + 1})`);
      
      // Test Supabase connection first
      const { error: connectionError } = await supabase
        .from('weight_entries')
        .select('count', { count: 'exact', head: true });
      
      if (connectionError) {
        console.error('Connection test failed:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .order('date', { ascending: false }); // Most recent first

      if (error) {
        console.error('Error fetching weight data:', error);
        throw new Error(`Failed to fetch weight data: ${error.message}`);
      }

      console.log("Weight data fetched successfully:", data?.length || 0, "entries");

      // Format the data to match our expected format
      const formattedData = (data || []).map(entry => {
        try {
          const rawDate = parseISO(entry.date);
          return {
            id: entry.id,
            date: format(rawDate, 'MMM d'),
            weight: entry.weight,
            rawDate: rawDate
          };
        } catch (formatError) {
          console.error('Error formatting entry:', entry, formatError);
          return null;
        }
      }).filter(Boolean) as WeightEntry[];
      
      setWeightData(formattedData);
      setError(null);
    } catch (error: any) {
      console.error('Error in fetchWeightData:', error);
      setError(error.message || 'Failed to load weight data');
      
      // Retry logic for connection issues
      if (retryCount < 2 && (error.message?.includes('connection') || error.message?.includes('network'))) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => fetchWeightData(retryCount + 1), (retryCount + 1) * 1000);
        return;
      }
      
      toast({
        description: error.message || "Failed to load weight data",
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

  // Get data for comparative weekly/monthly views
  const getComparativeWeeklyData = () => {
    const weeklyData: Record<string, WeightEntry[]> = {};
    
    weightData.forEach(entry => {
      if (entry.rawDate) {
        const weekKey = format(entry.rawDate, "'Week of' MMM d");
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(entry);
      }
    });
    
    // Convert to array and get last 8 weeks
    const sortedWeeks = Object.entries(weeklyData)
      .map(([week, entries]) => ({
        date: week,
        weight: entries.reduce((sum, entry) => sum + entry.weight, 0) / entries.length,
        isToday: entries.some(entry => 
          entry.rawDate && format(entry.rawDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        )
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8);
    
    return sortedWeeks;
  };

  const getComparativeMonthlyData = () => {
    const monthlyData: Record<string, WeightEntry[]> = {};
    
    weightData.forEach(entry => {
      if (entry.rawDate) {
        const monthKey = format(entry.rawDate, 'MMM yyyy');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(entry);
      }
    });
    
    // Convert to array and get last 6 months
    const sortedMonths = Object.entries(monthlyData)
      .map(([month, entries]) => ({
        date: month,
        weight: entries.reduce((sum, entry) => sum + entry.weight, 0) / entries.length,
        isToday: entries.some(entry => 
          entry.rawDate && format(entry.rawDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        )
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6);
    
    return sortedMonths;
  };

  return { 
    weightData, 
    loading, 
    error,
    addWeightEntry: async (date: Date, weight: number) => {
      try {
        const dateStr = date.toISOString().split('T')[0];
        
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
          
          toast({
            description: "Weight added successfully",
          });
        }
        
        // Refresh data from server
        await fetchWeightData();
        
      } catch (error: any) {
        console.error('Error adding weight entry:', error);
        toast({
          description: error.message || "Failed to add weight entry",
          variant: "destructive",
        });
      }
    },
    refreshWeightData: fetchWeightData,
    getWeightDataByWeeks,
    getWeightDataByMonths,
    getComparativeWeeklyData,
    getComparativeMonthlyData
  };
};
