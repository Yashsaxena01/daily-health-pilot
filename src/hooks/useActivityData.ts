
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

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
      console.log("Fetching activities...");
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log("Activities fetched:", data);
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Don't show toast for network errors to avoid spam
      setActivities([]);
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
      
      // Optimistically update UI first
      const tempActivity: Activity = {
        id: `temp-${Date.now()}`,
        description,
        date,
        completed: false
      };
      
      setActivities(prev => [tempActivity, ...prev]);
      
      const { data, error } = await supabase
        .from('activities')
        .insert({ description, date, completed: false })
        .select()
        .single();

      if (error) {
        console.error("Error adding activity:", error);
        // Rollback optimistic update
        setActivities(prev => prev.filter(a => a.id !== tempActivity.id));
        throw error;
      }

      if (data) {
        console.log("Activity added successfully:", data);
        // Replace temp activity with real one
        setActivities(prev => prev.map(a => 
          a.id === tempActivity.id ? data : a
        ));
        
        toast({
          description: "Activity added successfully",
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        description: "Failed to add activity",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateActivity = async (id: string, description: string) => {
    try {
      console.log("Updating activity:", { id, description });
      
      const { error } = await supabase
        .from('activities')
        .update({ description })
        .eq('id', id);

      if (error) {
        console.error("Error updating activity:", error);
        throw error;
      }

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

      // Optimistic update
      setActivities(prev => 
        prev.map(a => 
          a.id === id ? { ...a, completed: !a.completed } : a
        )
      );

      const { error } = await supabase
        .from('activities')
        .update({ completed: !activity.completed })
        .eq('id', id);

      if (error) {
        // Rollback optimistic update
        setActivities(prev => 
          prev.map(a => 
            a.id === id ? { ...a, completed: activity.completed } : a
          )
        );
        throw error;
      }
      
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
      console.log("Deleting activity:", id);
      
      // Optimistic update
      const originalActivities = activities;
      setActivities(prev => prev.filter(a => a.id !== id));
      
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) {
        // Rollback optimistic update
        setActivities(originalActivities);
        throw error;
      }
      
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
