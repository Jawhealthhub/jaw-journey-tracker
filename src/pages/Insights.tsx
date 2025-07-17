import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Crown, Brain, Lock } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

const Insights = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_subscription')
        .select('subscribed')
        .eq('user_id', user.id)
        .single();
      if (error) console.error('Error checking subscription:', error);
      else setIsSubscribed(data?.subscribed || false);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    window.open('https://jawhealthhub.com/products/tmj-comfortplus', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">AI Insights</h1>
            {isSubscribed && (
              <Badge className="bg-warning/20 text-warning">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {isSubscribed ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Your Personal TMJ Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">AI-powered insights coming soon...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Gain AI-Powered Insights to Better Manage Your TMJ
                </CardTitle>
                <p className="text-muted-foreground">
                  Understand patterns, identify root causes, and optimize your routine based on your personal data.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={handleSubscribe} className="w-full" size="lg">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Insights;