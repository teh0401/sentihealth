import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Task { id: string; title: string; done: boolean; }

const initialTasks: Task[] = [
  { id: 't1', title: 'Walk for 10 minutes', done: false },
  { id: 't2', title: 'Drink a glass of water', done: false },
  { id: 't3', title: 'Take medication A', done: false },
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

  return (
    <main className="max-w-screen-sm mx-auto px-4 py-6 space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Recovery Plan</h1>
        <p className="text-muted-foreground text-sm">Simple daily challenges to support your healing.</p>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Today’s Challenges</CardTitle>
            <CardDescription>Complete all to increase your streak.</CardDescription>
          </div>
          <Badge variant="secondary">Streak: {streak} 🔥</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center justify-between border rounded-md p-3">
              <span className={t.done ? 'line-through opacity-70' : ''}>{t.title}</span>
              <Button variant={t.done ? 'secondary' : 'hero'} onClick={() => toggle(t.id)}>
                {t.done ? 'Undo' : 'Done'}
              </Button>
            </div>
          ))}
          <div className="flex justify-end">
            <Button variant="outline" onClick={completeDay}>Complete Day</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Recovery;
