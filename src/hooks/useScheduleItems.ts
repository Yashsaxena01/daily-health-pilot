
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
        console.error('Supabase error:', error);
        throw error;
      }

      console.log("Schedule items fetched:", data);
      setScheduleItems(data || []);
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
      
      // Optimistic update
      const tempItem: ScheduleItem = {
        ...item,
        id: `temp-${Date.now()}`
      };
      
      setScheduleItems(prev => [tempItem, ...prev]);
      
      const { data, error } = await supabase
        .from('schedule_items')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        // Rollback optimistic update
        setScheduleItems(prev => prev.filter(i => i.id !== tempItem.id));
        throw error;
      }
      
      if (data) {
        console.log("Successfully added item:", data);
        // Replace temp item with real one
        setScheduleItems(prev => prev.map(i => 
          i.id === tempItem.id ? data : i
        ));
        
        toast({
          description: "Activity added successfully",
        });
        
        return data;
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
      
      const { error } = await supabase
        .from('schedule_items')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error("Error updating schedule item:", error);
        throw error;
      }

      setScheduleItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      
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
    return scheduleItems
      .filter(item => item.date === today)
      .sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
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
