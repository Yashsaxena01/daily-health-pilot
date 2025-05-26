import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface ScheduleItem {
  id?: string;
  title: string;
  description?: string;
  time?: string;
  date: string;
  completed: boolean;
  repeatFrequency?: 'daily' | 'alternate' | 'weekly' | 'monthly' | 'none';
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
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (error) {
        console.error('Supabase error fetching schedule items:', error);
        throw error;
      }

      console.log("Schedule items fetched successfully:", data?.length || 0, "items");
      
      // Transform the data to match our interface with proper type casting
      const transformedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        time: item.time,
        date: item.date,
        completed: item.completed,
        repeatFrequency: (item.repeat_frequency && ['daily', 'alternate', 'weekly', 'monthly'].includes(item.repeat_frequency)) 
          ? item.repeat_frequency as 'daily' | 'alternate' | 'weekly' | 'monthly'
          : 'none' as const
      })) || [];
      
      setScheduleItems(transformedData);
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      setScheduleItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleItems();
  }, [fetchScheduleItems]);

  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
    try {
      console.log("Adding schedule item:", item);
      
      // Prepare data for insertion
      const insertData = {
        title: item.title,
        description: item.description || null,
        time: item.time || null,
        date: item.date,
        completed: item.completed || false,
        repeat_frequency: item.repeatFrequency && item.repeatFrequency !== 'none' ? item.repeatFrequency : null
      };
      
      console.log("Insert data prepared:", insertData);
      
      const { data, error } = await supabase
        .from('schedule_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error adding schedule item:", error);
        throw error;
      }
      
      if (data) {
        console.log("Schedule item added successfully:", data);
        
        // Transform the response data to match our interface
        const transformedData: ScheduleItem = {
          id: data.id,
          title: data.title,
          description: data.description,
          time: data.time,
          date: data.date,
          completed: data.completed,
          repeatFrequency: (data.repeat_frequency && ['daily', 'alternate', 'weekly', 'monthly'].includes(data.repeat_frequency)) 
            ? data.repeat_frequency as 'daily' | 'alternate' | 'weekly' | 'monthly'
            : 'none' as const
        };
        
        // Update local state
        setScheduleItems(prev => [transformedData, ...prev]);
        
        return transformedData;
      }
    } catch (error) {
      console.error('Error adding schedule item:', error);
      toast({
        description: "Failed to add schedule item",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      console.log("Updating schedule item:", { id, updates });
      
      // Transform updates to match database schema
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.repeatFrequency !== undefined) {
        dbUpdates.repeat_frequency = updates.repeatFrequency === 'none' ? null : updates.repeatFrequency;
      }
      
      const { error } = await supabase
        .from('schedule_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error("Error updating schedule item:", error);
        throw error;
      }

      // Update local state
      setScheduleItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      
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

  const deleteScheduleItem = async (id: string) => {
    try {
      console.log("Deleting schedule item:", id);
      
      // Optimistic update
      const originalItems = scheduleItems;
      setScheduleItems(prev => prev.filter(item => item.id !== id));
      
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (error) {
        // Rollback optimistic update
        setScheduleItems(originalItems);
        throw error;
      }
      
      console.log("Schedule item deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast({
        description: "Failed to delete schedule item",
        variant: "destructive",
      });
      return false;
    }
  };

  const getTodaysItems = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysItems = scheduleItems
      .filter(item => item.date === today)
      .sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
    
    console.log("Today's items:", todaysItems.length);
    return todaysItems;
  };

  const getItemsByDateRange = (startDate: string, endDate: string) => {
    return scheduleItems
      .filter(item => item.date >= startDate && item.date <= endDate)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        
        return 0;
      });
  };

  return {
    scheduleItems,
    loading,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    getItemsByDateRange,
    getTodaysItems,
    refreshScheduleItems: fetchScheduleItems
  };
};
