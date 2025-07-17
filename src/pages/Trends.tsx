import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Brain, Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import BottomNavigation from '@/components/BottomNavigation';

interface TrendData {
  date: string;
  pain_score: number;
  stress_level: number;
  displayDate: string;
}

const Trends = () => {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrendData();
    }
  }, [user]);

  const fetchTrendData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('date, pain_score, stress_level')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30);

      if (error) {
        console.error('Error fetching trend data:', error);
      } else {
        const processedData = (data || []).map(item => ({
          ...item,
          displayDate: format(new Date(item.date), 'MMM d')
        }));
        setTrendData(processedData);
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCorrelation = () => {
    if (trendData.length < 2) return 0;
    
    const n = trendData.length;
    const sumX = trendData.reduce((sum, item) => sum + item.stress_level, 0);
    const sumY = trendData.reduce((sum, item) => sum + item.pain_score, 0);
    const sumXY = trendData.reduce((sum, item) => sum + item.stress_level * item.pain_score, 0);
    const sumXX = trendData.reduce((sum, item) => sum + item.stress_level * item.stress_level, 0);
    const sumYY = trendData.reduce((sum, item) => sum + item.pain_score * item.pain_score, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    return isNaN(correlation) ? 0 : correlation;
  };

  const correlation = calculateCorrelation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your trends...</p>
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
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Trends & Patterns</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {trendData.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Not enough data</h3>
            <p className="text-muted-foreground">Log your symptoms for a few days to see trends and patterns.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Correlation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Stress vs Pain Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {(correlation * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {correlation > 0.7 ? 'Strong positive correlation' :
                     correlation > 0.3 ? 'Moderate positive correlation' :
                     correlation > -0.3 ? 'Weak correlation' :
                     correlation > -0.7 ? 'Moderate negative correlation' :
                     'Strong negative correlation'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {correlation > 0.3 ? 'Higher stress tends to correlate with higher pain' :
                     correlation < -0.3 ? 'Higher stress tends to correlate with lower pain' :
                     'No clear pattern between stress and pain'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Pain & Stress Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pain_score"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      name="Pain Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="stress_level"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      name="Stress Level"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Stress vs Pain Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stress_level" name="Stress Level" />
                    <YAxis dataKey="pain_score" name="Pain Score" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter
                      dataKey="pain_score"
                      fill="hsl(var(--primary))"
                      name="Daily Logs"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Trends;