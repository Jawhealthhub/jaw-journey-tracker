import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingStatus {
  foods_completed: boolean;
  medications_completed: boolean;
  exercises_completed: boolean;
  symptoms_completed: boolean;
  onboarding_completed: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
    }
  }, [user]);

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching onboarding status:', error);
      } else {
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingStep = async (step: keyof OnboardingStatus, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({ [step]: completed })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating onboarding step:', error);
      } else {
        setStatus(prev => prev ? { ...prev, [step]: completed } : null);
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({ 
          onboarding_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
      } else {
        setStatus(prev => prev ? { ...prev, onboarding_completed: true } : null);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return {
    status,
    loading,
    updateOnboardingStep,
    completeOnboarding,
    refetch: fetchOnboardingStatus
  };
};