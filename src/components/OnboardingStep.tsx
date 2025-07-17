import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { usePreferences, type PreferenceType, type DefaultPreference } from '@/hooks/usePreferences';

interface OnboardingStepProps {
  title: string;
  description: string;
  type: PreferenceType;
  onComplete: (selectedItems: string[]) => void;
  onSkip?: () => void;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  type,
  onComplete,
  onSkip
}) => {
  const { defaultPreferences, addPreference } = usePreferences(type);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleToggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleAddCustom = async () => {
    if (customInput.trim()) {
      await addPreference(customInput.trim(), false);
      setSelectedItems(prev => [...prev, customInput.trim()]);
      setCustomInput('');
      setIsAddingCustom(false);
    }
  };

  const handleComplete = async () => {
    // Add selected default preferences to user preferences
    for (const item of selectedItems) {
      const isDefault = defaultPreferences.some(d => d.preference_value === item);
      await addPreference(item, isDefault);
    }
    
    onComplete(selectedItems);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {defaultPreferences.map((item) => (
              <Badge
                key={item.id}
                variant={selectedItems.includes(item.preference_value) ? "default" : "outline"}
                className="cursor-pointer p-3 justify-center text-center hover:bg-primary/10"
                onClick={() => handleToggleItem(item.preference_value)}
              >
                {item.preference_value}
              </Badge>
            ))}
          </div>

          {/* Custom items that were added */}
          {selectedItems.filter(item => 
            !defaultPreferences.some(d => d.preference_value === item)
          ).map((item) => (
            <Badge
              key={item}
              variant="default"
              className="cursor-pointer p-3 justify-between"
            >
              {item}
              <X 
                className="w-4 h-4 ml-2 cursor-pointer hover:text-destructive"
                onClick={() => handleToggleItem(item)}
              />
            </Badge>
          ))}

          <div className="border-t pt-4">
            {!isAddingCustom ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAddingCustom(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom {type.slice(0, -1)}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder={`Enter custom ${type.slice(0, -1)}`}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                />
                <Button onClick={handleAddCustom} size="sm">
                  Add
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomInput('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleComplete} className="flex-1">
              Continue ({selectedItems.length} selected)
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingStep;