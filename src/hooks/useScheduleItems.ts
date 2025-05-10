
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface ScheduleItem {
  id?: string;
  title: string;
  description?: string;
  time?: string;
  date: string;
  completed: boolean;
}

export const useScheduleItems = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduleItems();
  }, []);

  const fetchScheduleItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      setScheduleItems(data);
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      toast({
        description: "Failed to load schedule items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .insert(item)
        .select();

      if (error) throw error;

      setScheduleItems(prev => [...prev, data[0]]);
      return data[0];
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
    } catch (error) {
      console.error('Error updating schedule item:', error);
      toast({
        description: "Failed to update schedule item",
        variant: "destructive",
      });
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
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast({
        description: "Failed to delete schedule item",
        variant: "destructive",
      });
    }
  };

  const getTodaysItems = () => {
    const today = new Date().toISOString().split('T')[0];
    return scheduleItems
      .filter(item => item.date === today)
      .sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);
  };

  return {
    scheduleItems,
    loading,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    getTodaysItems,
    refreshScheduleItems: fetchScheduleItems
  };
};
