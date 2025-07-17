import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingStep from '@/components/OnboardingStep';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { status, loading, updateOnboardingStep, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status?.onboarding_completed) {
      navigate('/');
    }
  }, [status, navigate]);

  const steps = [
    {
      key: 'foods_completed' as const,
      title: 'Select Your Foods',
      description: 'Choose foods you commonly eat. We\'ll use this to track potential triggers.',
      type: 'foods' as const
    },
    {
      key: 'medications_completed' as const,
      title: 'Your Medications',
      description: 'Add medications and supplements you take for TMJ or general health.',
      type: 'medications' as const
    },
    {
      key: 'exercises_completed' as const,
      title: 'Your Exercise Routine',
      description: 'Select exercises and activities you do regularly.',
      type: 'exercises' as const
    },
    {
      key: 'symptoms_completed' as const,
      title: 'Common Symptoms',
      description: 'Choose symptoms you experience. This helps us track patterns.',
      type: 'symptoms' as const
    }
  ];

  const handleStepComplete = async (selectedItems: string[]) => {
    const step = steps[currentStep];
    await updateOnboardingStep(step.key, true);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
      navigate('/');
    }
  };

  const handleSkip = async () => {
    const step = steps[currentStep];
    await updateOnboardingStep(step.key, true);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (status?.onboarding_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Setup Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Start Logging
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mb-8">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">TMJ Tracker Setup</h1>
            <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />
          <div className="text-center text-sm text-muted-foreground">
            Powered by <span className="text-primary font-semibold">JawHealthHub.com</span>
          </div>
        </div>
      </div>

      <OnboardingStep
        title={steps[currentStep].title}
        description={steps[currentStep].description}
        type={steps[currentStep].type}
        onComplete={handleStepComplete}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default Onboarding;