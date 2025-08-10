import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, CheckCircle, Trophy, Clock, Calendar, Footprints, Droplets, Pill } from "lucide-react";
import AIRecoveryRecommendations from "@/components/recovery/AIRecoveryRecommendations";
import StandardVoiceButton from "@/components/voice/StandardVoiceButton";

interface Task { id: string; title: string; done: boolean; type: 'medication' | 'exercise' | 'wellness' | 'hydration'; }

const initialTasks: Task[] = [
  { id: 't1', title: 'Walk for 10 minutes', done: false, type: 'exercise' },
  { id: 't2', title: 'Drink a glass of water', done: false, type: 'hydration' },
  { id: 't3', title: 'Take medication A', done: false, type: 'medication' },
];

const Recovery = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try { return JSON.parse(localStorage.getItem('recoveryTasks') || 'null') ?? initialTasks; } catch { return initialTasks; }
  });
  const [streak, setStreak] = useState<number>(() => {
    try { return Number(localStorage.getItem('recoveryStreak') || '0'); } catch { return 0; }
  });

  useEffect(() => {
    localStorage.setItem('recoveryTasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completeDay = () => {
    if (tasks.every(t => t.done)) {
      setStreak(s => {
        const next = s + 1; localStorage.setItem('recoveryStreak', String(next)); return next;
      });
      setTasks(initialTasks);
    }
  };

  const getTaskIcon = (title: string, type: string) => {
    if (title === 'Walk for 10 minutes') {
      return <Footprints className="h-5 w-5 text-green-600 animate-pulse hover:animate-bounce transition-all" />;
    }
    if (title === 'Drink a glass of water') {
      return <Droplets className="h-5 w-5 text-blue-600 hover:scale-110 transition-transform" />;
    }
    if (title === 'Take medication A') {
      return <Pill className="h-5 w-5 text-blue-600 hover:scale-110 transition-transform" />;
    }
    
    // Fallback for other tasks
    switch (type) {
      case 'medication': return <Pill className="h-5 w-5 text-blue-600" />;
      case 'exercise': return <Footprints className="h-5 w-5 text-green-600" />;
      case 'hydration': return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'wellness': return '💭';
      default: return '✅';
    }
  };

  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;

  return (
    <main className="max-w-screen-lg mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-28 sm:pb-24">
      {/* Page Header */}
      <section className="border-b pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Patient Recovery Program</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Track your daily recovery activities and maintain consistent progress toward wellness.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 bg-card border rounded-lg p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{completedTasks}/{totalTasks}</div>
                <div className="text-xs text-muted-foreground">Today's Progress</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Completed</span>
                <span className="font-medium">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Achievement Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-amber-500">{streak}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Consecutive days completed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-1 sm:space-y-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                On Track
              </Badge>
              <div className="text-xs sm:text-sm text-muted-foreground">Recovery progressing well</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Today's Activities */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Today's Recovery Activities
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete all activities to maintain your recovery progress and increase your achievement streak.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {tasks.map(t => (
            <div key={t.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-3 sm:p-4 transition-all gap-3 sm:gap-4 ${
              t.done ? 'bg-muted/30 border-green-200' : 'bg-background border-border hover:border-primary/50'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
                  {getTaskIcon(t.title, t.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-sm sm:text-base block ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {t.title}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {t.type} • Required daily activity
                  </div>
                </div>
              </div>
              <Button 
                variant={t.done ? 'secondary' : 'default'} 
                onClick={() => toggle(t.id)}
                className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
                size="sm"
              >
                {t.done ? (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Mark Complete</span>
                    <span className="sm:hidden">Complete</span>
                  </>
                )}
              </Button>
            </div>
          ))}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
            <div className="text-xs sm:text-sm text-muted-foreground flex-1">
              {completedTasks === totalTasks 
                ? "🎉 All activities completed! Ready to finalize your day." 
                : `${totalTasks - completedTasks} activities remaining for today.`
              }
            </div>
            <Button 
              onClick={completeDay}
              disabled={!tasks.every(t => t.done)}
              size="lg"
              className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-11"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Complete Day</span>
              <span className="sm:hidden">Complete</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <AIRecoveryRecommendations />

      {/* Information Section */}
      <Card className="bg-muted/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Recovery Program Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-2 p-4 sm:p-6">
          <p>
            This recovery program is designed by Ministry of Health Malaysia healthcare professionals to support your healing process.
            Regular completion of activities helps monitor your progress and ensures optimal recovery outcomes.
          </p>
          <p>
            If you experience any difficulties or have concerns about your recovery activities, 
            please contact your healthcare provider immediately.
          </p>
        </CardContent>
      </Card>
      
      {/* Standard Voice Button */}
      <StandardVoiceButton />
    </main>
  );
};

export default Recovery;
