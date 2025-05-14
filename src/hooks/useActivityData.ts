
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export interface Activity {
  id?: string;
  description: string;
  date: string;
  completed: boolean;
}

export const useActivityData = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

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
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = async (description: string, date: string) => {
    try {
      console.log("Adding activity:", { description, date });
      
      const { data, error } = await supabase
        .from('activities')
        .insert({ description, date, completed: false })
        .select();

      if (error) {
        console.error("Error adding activity:", error);
        throw error;
      }

      if (data && data[0]) {
        console.log("Activity added successfully:", data[0]);
        setActivities(prev => [data[0], ...prev]);
        
        toast({
          description: "Activity added successfully",
        });
        
        return data[0];
      }
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
          activity.id === id ? { ...activity, description } : activity
        )
      );
      
      toast({
        description: "Activity updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        description: "Failed to update activity",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleActivityCompleted = async (id: string) => {
    try {
      const activity = activities.find(a => a.id === id);
      if (!activity) return false;

      const { error } = await supabase
        .from('activities')
        .update({ completed: !activity.completed })
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => 
        prev.map(a => 
          a.id === id ? { ...a, completed: !a.completed } : a
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error toggling activity completion:', error);
      toast({
        description: "Failed to update activity status",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => prev.filter(a => a.id !== id));
      
      toast({
        description: "Activity deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        description: "Failed to delete activity",
        variant: "destructive",
      });
      return false;
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
