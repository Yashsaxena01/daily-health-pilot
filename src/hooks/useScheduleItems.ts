
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

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
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (error) throw error;

      setScheduleItems(data || []);
    } catch (error) {
      console.error('Error fetching schedule items:', error);
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

  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
    try {
      console.log("Adding schedule item:", item); // Debug log
      
      const { data, error } = await supabase
        .from('schedule_items')
        .insert(item)
        .select();

      if (error) {
        console.error("Supabase error:", error); // Debug log
        throw error;
      }
      
      if (data && data[0]) {
        console.log("Successfully added item:", data[0]); // Debug log
        setScheduleItems(prev => [data[0], ...prev]);
        
        toast({
          description: "Activity added successfully",
        });
        
        return data[0];
      }
    } catch (error) {
      console.error('Error adding schedule item:', error);
      toast({
        description: "Failed to add schedule item",
        variant: "destructive",
      });
    }
  };

  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      const { error } = await supabase
        .from('schedule_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScheduleItems(prev => prev.filter(item => item.id !== id));
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
        // First compare by date
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        
        // If same date, compare by time if both have time
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        // If one has time and the other doesn't, prioritize the one with time
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
