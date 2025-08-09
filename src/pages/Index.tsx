// SEO: Single H1 and accessible structure
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60" aria-hidden>
          <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/0" />
        </div>
        <div className="max-w-screen-xl mx-auto px-4 pt-10 pb-6">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">SentiHealth</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Voice-guided help for appointments, indoor navigation with AR, and friendly recovery challenges. Designed for all ages with instant accessibility mode.</p>
            <div className="flex items-center justify-center gap-2">
              <Button asChild variant="hero" className="h-11 px-8">
                <Link to="/appointments">Book Appointment</Link>
              </Button>
              <Button asChild variant="secondary" className="h-11 px-8">
                <Link to="/navigate">Start Navigation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto px-4 pb-10 grid sm:grid-cols-2 gap-4">
        <article className="rounded-xl border bg-card p-5 shadow hover:shadow-lg transition-shadow">
          <h2 className="font-semibold mb-1">Voice Agent Companion</h2>
          <p className="text-sm text-muted-foreground">Natural conversations to find care, book appointments, and get reminders. Optimized for elderly users.</p>
        </article>
        <article className="rounded-xl border bg-card p-5 shadow hover:shadow-lg transition-shadow">
          <h2 className="font-semibold mb-1">AR Indoor Navigation</h2>
          <p className="text-sm text-muted-foreground">Camera-guided arrows with audio steps get you to the right department fast.</p>
        </article>
        <article className="rounded-xl border bg-card p-5 shadow hover:shadow-lg transition-shadow">
          <h2 className="font-semibold mb-1">Accessibility Mode</h2>
          <p className="text-sm text-muted-foreground">High-contrast, larger text, and voice guidance in one tap.</p>
        </article>
        <article className="rounded-xl border bg-card p-5 shadow hover:shadow-lg transition-shadow">
          <h2 className="font-semibold mb-1">Recovery Challenges</h2>
          <p className="text-sm text-muted-foreground">Stay on track with simple, rewarding tasks after your visit.</p>
        </article>
      </section>
    </main>
  );
};

export default Index;
