import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, RefreshCw, Sparkles, TrendingUp, Heart, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  type: 'exercise' | 'nutrition' | 'mental' | 'sleep' | 'social';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeEstimate: string;
  reason: string;
}

const AIRecoveryRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Mock AI recommendations based on user progress
  const generateRecommendations = async () => {
    setLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        type: 'exercise',
        title: 'Gentle Morning Stretches',
        description: 'Start your day with 10 minutes of light stretching to improve circulation and reduce stiffness.',
        priority: 'high',
        timeEstimate: '10 minutes',
        reason: 'Based on your completed activities, gentle movement will enhance your recovery process.'
      },
      {
        id: '2',
        type: 'nutrition',
        title: 'Hydration Boost',
        description: 'Increase water intake to 8-10 glasses daily. Add lemon or cucumber for variety.',
        priority: 'high',
        timeEstimate: 'Throughout day',
        reason: 'Proper hydration accelerates healing and reduces inflammation.'
      },
      {
        id: '3',
        type: 'mental',
        title: 'Mindfulness Practice',
        description: 'Try a 5-minute guided breathing exercise to manage stress and improve mental clarity.',
        priority: 'medium',
        timeEstimate: '5 minutes',
        reason: 'Your progress shows readiness for stress management techniques.'
      },
      {
        id: '4',
        type: 'sleep',
        title: 'Sleep Schedule Optimization',
        description: 'Maintain consistent bedtime and wake-up times to improve recovery quality.',
        priority: 'medium',
        timeEstimate: 'Ongoing',
        reason: 'Quality sleep is crucial for tissue repair and mental health recovery.'
      },
      {
        id: '5',
        type: 'social',
        title: 'Connect with Support Network',
        description: 'Reach out to family or friends for a brief, positive conversation.',
        priority: 'low',
        timeEstimate: '15-30 minutes',
        reason: 'Social connection supports emotional well-being during recovery.'
      }
    ];
    
    setRecommendations(mockRecommendations);
    setLastGenerated(new Date());
    setLoading(false);
    
    toast({
      title: 'AI Recommendations Updated',
      description: 'Personalized suggestions generated based on your recovery progress.',
    });
  };

  // Auto-generate recommendations on component mount
  useEffect(() => {
    generateRecommendations();
  }, []);

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'exercise': return <TrendingUp className="h-4 w-4" />;
      case 'nutrition': return <Heart className="h-4 w-4" />;
      case 'mental': return <Brain className="h-4 w-4" />;
      case 'sleep': return <Sparkles className="h-4 w-4" />;
      case 'social': return <Heart className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'exercise': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'nutrition': return 'bg-green-100 text-green-700 border-green-200';
      case 'mental': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sleep': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'social': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              AI Recovery Recommendations
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                Personalized
              </Badge>
            </CardTitle>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
        {lastGenerated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastGenerated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="border rounded-lg p-3 sm:p-4 bg-white/70 hover:bg-white/90 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(rec.type)}>
                        {getTypeIcon(rec.type)}
                        {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                      </Badge>
                    </div>
                    <h4 className="font-medium text-foreground">{rec.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>⏱️ {rec.timeEstimate}</span>
                      <span>•</span>
                      <span>{rec.reason}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-700">
                  <strong>Note:</strong> These AI-generated recommendations are suggestions based on your recovery progress. 
                  Always consult your healthcare provider before making significant changes to your recovery plan.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecoveryRecommendations;