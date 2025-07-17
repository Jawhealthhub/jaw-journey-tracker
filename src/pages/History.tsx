import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity, Brain, Briefcase, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import BottomNavigation from '@/components/BottomNavigation';

interface DailyLog {
  id: string;
  date: string;
  pain_score: number;
  stress_level: number;
  work_done: boolean;
  work_type: string;
  foods: string[];
  medications: string[];
  exercises: string[];
  symptoms: string[];
}

const History = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching logs:', error);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPainColor = (score: number) => {
    if (score <= 3) return 'bg-success/20 text-success';
    if (score <= 6) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return 'bg-success/20 text-success';
    if (level <= 3) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your history...</p>
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
            <HistoryIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Log History</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No logs yet</h3>
            <p className="text-muted-foreground">Start tracking your daily symptoms to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getPainColor(log.pain_score)}>
                        Pain: {log.pain_score}/10
                      </Badge>
                      <Badge className={getStressColor(log.stress_level)}>
                        Stress: {log.stress_level}/5
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {log.work_done && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Work:</span>
                      <Badge variant="outline">{log.work_type}</Badge>
                    </div>
                  )}
                  
                  {log.symptoms && log.symptoms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Activity className="w-4 h-4" />
                        <span>Symptoms:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {log.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {log.foods && log.foods.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span>Foods:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {log.foods.slice(0, 3).map((food, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {food}
                          </Badge>
                        ))}
                        {log.foods.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{log.foods.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default History;