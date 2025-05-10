
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface Activity {
  id?: string;
  description: string;
  completed: boolean;
  date: string;
}

export const useActivityData = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (description: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('activities')
        .insert({ 
          description, 
          completed: false,
          date: today
        })
        .select();

      if (error) throw error;

      setActivities(prev => [data[0], ...prev]);
      
      toast({
        description: "Activity added successfully",
      });
      
      return data[0];
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        description: "Failed to add activity",
        variant: "destructive",
      });
    }
  };

  const updateActivity = async (id: string, description: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ description })
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => 
        prev.map(activity => 
          activity.id === id 
            ? { ...activity, description } 
            : activity
        )
      );
      
      toast({
        description: "Activity updated successfully",
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        description: "Failed to update activity",
        variant: "destructive",
      });
    }
  };

  const toggleActivityCompleted = async (id: string) => {
    try {
      const activity = activities.find(a => a.id === id);
      if (!activity) return;
      
      const { error } = await supabase
        .from('activities')
        .update({ completed: !activity.completed })
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => 
        prev.map(activity => 
          activity.id === id 
            ? { ...activity, completed: !activity.completed } 
            : activity
        )
      );
    } catch (error) {
      console.error('Error toggling activity completion:', error);
      toast({
        description: "Failed to update activity status",
        variant: "destructive",
      });
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => prev.filter(activity => activity.id !== id));
      
      toast({
        description: "Activity deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    toggleActivityCompleted,
    deleteActivity,
    refreshActivities: fetchActivities
  };
};
