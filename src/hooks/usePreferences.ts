import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type PreferenceType = 'foods' | 'medications' | 'exercises' | 'symptoms';

export interface Preference {
  id: string;
  preference_value: string;
  is_default: boolean;
}

export interface DefaultPreference {
  id: string;
  preference_value: string;
}

export const usePreferences = (type: PreferenceType) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [defaultPreferences, setDefaultPreferences] = useState<DefaultPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchDefaultPreferences();
    }
  }, [user, type]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('preference_type', type);

      if (error) {
        console.error('Error fetching preferences:', error);
      } else {
        setPreferences(data || []);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('default_preferences')
        .select('*')
        .eq('preference_type', type);

      if (error) {
        console.error('Error fetching default preferences:', error);
      } else {
        setDefaultPreferences(data || []);
      }
    } catch (error) {
      console.error('Error fetching default preferences:', error);
    }
  };

  const addPreference = async (value: string, isDefault: boolean = false) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          preference_type: type,
          preference_value: value,
          is_default: isDefault
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding preference:', error);
      } else {
        setPreferences(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding preference:', error);
    }
  };

  const removePreference = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing preference:', error);
      } else {
        setPreferences(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error removing preference:', error);
    }
  };

  return {
    preferences,
    defaultPreferences,
    loading,
    addPreference,
    removePreference,
    refetch: fetchPreferences
  };
};