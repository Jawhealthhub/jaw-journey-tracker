import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePreferences } from '@/hooks/usePreferences';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Plus, LogOut, Menu, TrendingUp, X, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { status: onboardingStatus, loading: onboardingLoading } = useOnboarding();
  const { toast } = useToast();

  // Form state
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [workDone, setWorkDone] = useState<boolean>(false);
  const [workType, setWorkType] = useState<string>('');
  const [painScore, setPainScore] = useState<number>(5);
  const [isLogging, setIsLogging] = useState(false);
  const [logCount, setLogCount] = useState<number>(0);
  const [showProductBanner, setShowProductBanner] = useState(false);

  // Preferences hooks
  const { preferences: foodPreferences, addPreference: addFood } = usePreferences('foods');
  const { preferences: medicationPreferences, addPreference: addMedication } = usePreferences('medications');
  const { preferences: exercisePreferences, addPreference: addExercise } = usePreferences('exercises');
  const { preferences: symptomPreferences, addPreference: addSymptom } = usePreferences('symptoms');

  // Custom item inputs
  const [customFood, setCustomFood] = useState('');
  const [customMedication, setCustomMedication] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!onboardingLoading && onboardingStatus && !onboardingStatus.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, onboardingStatus, onboardingLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLogCount();
    }
  }, [user]);

  const fetchLogCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching log count:', error);
      } else {
        setLogCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching log count:', error);
    }
  };

  const checkForProductRecommendation = (stress: number, pain: number) => {
    if (logCount >= 5 && stress >= 4 && pain >= 5) {
      setShowProductBanner(true);
    }
  };

  const handleAddCustomItem = async (
    type: 'food' | 'medication' | 'exercise' | 'symptom',
    value: string,
    addFunction: (value: string) => Promise<void>,
    setSelectedFunction: React.Dispatch<React.SetStateAction<string[]>>,
    setInputFunction: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      await addFunction(value.trim());
      setSelectedFunction(prev => [...prev, value.trim()]);
      setInputFunction('');
    }
  };

  const handleSubmitLog = async () => {
    if (!user) return;

    setIsLogging(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: user.id,
          date: today,
          foods: selectedFoods,
          medications: selectedMedications,
          exercises: selectedExercises,
          symptoms: selectedSymptoms,
          stress_level: stressLevel,
          work_done: workDone,
          work_type: workType,
          pain_score: painScore
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Log saved successfully!",
        description: "Your daily log has been recorded.",
      });

      // Check for product recommendation
      checkForProductRecommendation(stressLevel, painScore);

      // Reset form
      setSelectedFoods([]);
      setSelectedMedications([]);
      setSelectedExercises([]);
      setSelectedSymptoms([]);
      setStressLevel(3);
      setWorkDone(false);
      setWorkType('');
      setPainScore(5);
      
      // Update log count
      setLogCount(prev => prev + 1);
    } catch (error) {
      console.error('Error saving log:', error);
      toast({
        title: "Error saving log",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const MultiSelectSection = ({ 
    title, 
    preferences, 
    selected, 
    onToggle, 
    customValue, 
    onCustomChange, 
    onCustomAdd,
    type 
  }: {
    title: string;
    preferences: any[];
    selected: string[];
    onToggle: (value: string) => void;
    customValue: string;
    onCustomChange: (value: string) => void;
    onCustomAdd: () => void;
    type: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {preferences.map((pref) => (
          <Badge
            key={pref.id}
            variant={selected.includes(pref.preference_value) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onToggle(pref.preference_value)}
          >
            {pref.preference_value}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={`Add custom ${type}`}
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onCustomAdd()}
        />
        <Button onClick={onCustomAdd} size="sm" disabled={!customValue.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">TMJ Tracker</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Track the Inputs. Understand the Symptoms. Manage Your TMJ.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/onboarding?demo=true')}>
                View Onboarding
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Product Recommendation Banner */}
      {showProductBanner && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">
                High stress and jaw pain detected. Try TMJ ComfortPlus—our calming, muscle-soothing formula designed for tense jaw days.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                size="sm" 
                onClick={() => window.open('https://jawhealthhub.com/products/tmj-comfortplus', '_blank')}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy Now
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowProductBanner(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Log
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your daily activities and symptoms
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultiSelectSection
                title="Foods"
                preferences={foodPreferences}
                selected={selectedFoods}
                onToggle={(value) => setSelectedFoods(prev => 
                  prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
                )}
                customValue={customFood}
                onCustomChange={setCustomFood}
                onCustomAdd={() => handleAddCustomItem('food', customFood, addFood, setSelectedFoods, setCustomFood)}
                type="food"
              />

              <Separator />

              <MultiSelectSection
                title="Medications & Supplements"
                preferences={medicationPreferences}
                selected={selectedMedications}
                onToggle={(value) => setSelectedMedications(prev => 
                  prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
                )}
                customValue={customMedication}
                onCustomChange={setCustomMedication}
                onCustomAdd={() => handleAddCustomItem('medication', customMedication, addMedication, setSelectedMedications, setCustomMedication)}
                type="medication"
              />

              <Separator />

              <MultiSelectSection
                title="Exercise & Activities"
                preferences={exercisePreferences}
                selected={selectedExercises}
                onToggle={(value) => setSelectedExercises(prev => 
                  prev.includes(value) ? prev.filter(e => e !== value) : [...prev, value]
                )}
                customValue={customExercise}
                onCustomChange={setCustomExercise}
                onCustomAdd={() => handleAddCustomItem('exercise', customExercise, addExercise, setSelectedExercises, setCustomExercise)}
                type="exercise"
              />

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Stress Level</Label>
                <div className="px-3">
                  <Slider
                    value={[stressLevel]}
                    onValueChange={(value) => setStressLevel(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low (1)</span>
                    <span>High (5)</span>
                  </div>
                  <p className="text-center text-sm mt-1">Current: {stressLevel}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Did you work today?</Label>
                  <Switch
                    checked={workDone}
                    onCheckedChange={setWorkDone}
                  />
                </div>
                {workDone && (
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office Work</SelectItem>
                      <SelectItem value="remote">Remote Work</SelectItem>
                      <SelectItem value="physical">Physical Work</SelectItem>
                      <SelectItem value="creative">Creative Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Pain Score</Label>
                <div className="px-3">
                  <Slider
                    value={[painScore]}
                    onValueChange={(value) => setPainScore(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>No Pain (1)</span>
                    <span>Severe (10)</span>
                  </div>
                  <p className="text-center text-sm mt-1">Current: {painScore}</p>
                </div>
              </div>

              <Separator />

              <MultiSelectSection
                title="Jaw Symptoms"
                preferences={symptomPreferences}
                selected={selectedSymptoms}
                onToggle={(value) => setSelectedSymptoms(prev => 
                  prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
                )}
                customValue={customSymptom}
                onCustomChange={setCustomSymptom}
                onCustomAdd={() => handleAddCustomItem('symptom', customSymptom, addSymptom, setSelectedSymptoms, setCustomSymptom)}
                type="symptom"
              />

              <Button 
                onClick={handleSubmitLog} 
                className="w-full" 
                disabled={isLogging}
              >
                {isLogging ? 'Saving...' : 'Save Today\'s Log'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Home;