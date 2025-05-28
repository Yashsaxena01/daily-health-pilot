
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface ScheduleItem {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
  repeatFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export const useScheduleItems = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduleItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching schedule items...");
      
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching schedule items:', error);
        throw error;
      }

      console.log("Schedule items fetched successfully:", data?.length || 0, "items");
      
      const formattedData: ScheduleItem[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.date,
        time: item.time,
        completed: item.completed || false,
        repeatFrequency: (item.repeat_frequency as 'none' | 'daily' | 'weekly' | 'monthly') || 'none'
      }));
      
      setScheduleItems(formattedData);
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      setScheduleItems([]);
      toast({
        description: "Failed to load schedule items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleItems();
  }, [fetchScheduleItems]);

  const getTodaysItems = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysItems = scheduleItems.filter(item => item.date === today);
    console.log("Today's items:", todaysItems.length, "for date:", today);
    return todaysItems;
  }, [scheduleItems]);

  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      console.log("Updating schedule item:", id, "with:", updates);
      
      // Optimistic update
      setScheduleItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      
      const dbUpdates: any = {
        title: updates.title,
        description: updates.description,
        date: updates.date,
        time: updates.time,
        completed: updates.completed,
        repeat_frequency: updates.repeatFrequency
      };
      
      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => 
        dbUpdates[key] === undefined && delete dbUpdates[key]
      );
      
      const { error } = await supabase
        .from('schedule_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error("Error updating schedule item:", error);
        // Revert optimistic update on error
        await fetchScheduleItems();
        throw error;
      }
      
      console.log("Schedule item updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating schedule item:', error);
      toast({
        description: "Failed to update schedule item",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    scheduleItems,
    loading,
    getTodaysItems,
    updateScheduleItem,
    refreshScheduleItems: fetchScheduleItems
  };
};
