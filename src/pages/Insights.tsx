import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, TrendingUp, Activity, Users } from 'lucide-react';

interface DailyLog {
  id: string;
  date: string;
  foods: string[];
  medications: string[];
  exercises: string[];
  symptoms: string[];
  stress_level: number;
  work_done: boolean;
  work_type: string;
  pain_score: number;
}

const Insights = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchLogs();
  }, [user, navigate]);

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

  const calculateAverage = (field: 'stress_level' | 'pain_score') => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + (log[field] || 0), 0);
    return (sum / logs.length).toFixed(1);
  };

  const getMostCommon = (field: 'foods' | 'medications' | 'exercises' | 'symptoms') => {
    const counts: Record<string, number> = {};
    
    logs.forEach(log => {
      (log[field] || []).forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
      });
    });

    const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
    return sorted.slice(0, 3).map(([item, count]) => ({ item, count }));
  };

  const getWeeklyTrend = () => {
    const last7Days = logs.slice(0, 7);
    if (last7Days.length < 2) return null;

    const oldAvg = last7Days.slice(3).reduce((acc, log) => acc + log.pain_score, 0) / Math.max(last7Days.slice(3).length, 1);
    const newAvg = last7Days.slice(0, 3).reduce((acc, log) => acc + log.pain_score, 0) / Math.max(last7Days.slice(0, 3).length, 1);
    
    const change = ((newAvg - oldAvg) / oldAvg) * 100;
    return { change: change.toFixed(1), improving: change < 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  const trend = getWeeklyTrend();
  const avgStress = calculateAverage('stress_level');
  const avgPain = calculateAverage('pain_score');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Log
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Insights & Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start logging your daily activities to see insights and trends.
                </p>
                <Button onClick={() => navigate('/')}>
                  Create Your First Log
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{logs.length}</div>
                    <p className="text-sm text-muted-foreground">
                      Days tracked
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Pain Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgPain}</div>
                    <p className="text-sm text-muted-foreground">
                      Out of 10
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Stress Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgStress}</div>
                    <p className="text-sm text-muted-foreground">
                      Out of 5
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Trend */}
              {trend && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Weekly Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${trend.improving ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.improving ? '↓' : '↑'} {Math.abs(parseFloat(trend.change))}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trend.improving ? 'Improvement' : 'Increase'} in pain score this week
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Most Common Items */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Common Foods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getMostCommon('foods').map(({ item, count }) => (
                        <div key={item} className="flex justify-between items-center">
                          <span className="text-sm">{item}</span>
                          <span className="text-sm text-muted-foreground">{count} times</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Common Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getMostCommon('symptoms').map(({ item, count }) => (
                        <div key={item} className="flex justify-between items-center">
                          <span className="text-sm">{item}</span>
                          <span className="text-sm text-muted-foreground">{count} times</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Premium Features Teaser */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Premium to unlock advanced insights:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Advanced correlation analysis</li>
                      <li>• Personalized protocol suggestions</li>
                      <li>• Export logs to PDF</li>
                      <li>• Track supplement effectiveness</li>
                    </ul>
                    <Button variant="outline" className="w-full">
                      Upgrade to Premium - $4.99/month
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Powered by branding */}
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Powered by <span className="text-primary font-semibold">JawHealthHub.com</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Insights;