import { sql } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Code2, Cpu, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60; // Revalidate the page every 60 seconds

async function getStats() {
  const [challenges, models, submissions] = await Promise.all([
    sql`SELECT count(*)::int as count FROM challenges WHERE is_published = true`,
    sql`SELECT count(*)::int as count FROM model_variants`,
    sql`SELECT count(*)::int as count FROM submissions WHERE is_published = true`,
  ]);

  return {
    challengesCount: challenges[0]?.count || 0,
    modelsCount: models[0]?.count || 0,
    submissionsCount: submissions[0]?.count || 0,
  };
}

async function getChallenges() {
  const challenges = await sql`
    SELECT 
      c.id, 
      c.title, 
      c.description, 
      c.cover_image,
      (
        SELECT count(DISTINCT s.model_variant_id)::int
        FROM submissions s 
        JOIN challenge_phases cp ON s.challenge_phase_id = cp.id 
        WHERE cp.challenge_id = c.id AND s.is_published = true
      ) as model_count
    FROM challenges c 
    WHERE c.is_published = true 
    ORDER BY c.sort_order ASC, c.created_at DESC
  `;
  return challenges;
}

export default async function Home() {
  const stats = await getStats();
  const challenges = await getChallenges();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative px-4 py-32 md:py-48 overflow-hidden bg-background">
        <div className="container mx-auto max-w-5xl text-center space-y-12 relative z-10">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Vibe Coding Horizontal Review
          </Badge>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground balance-text leading-[1.1]">
            Compare AI Coding Models <br className="hidden md:inline" />
            <span className="text-primary">Side-by-Side</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            VibeBench collects frontend creations from various AI models solving the exact same coding challenges. Explore, switch phases, and see who "vibes" the best.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
            <Button size="lg" className="shadow-float" asChild>
              <Link href="#challenges">
                Browse Challenges <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/models">View Models Directory</Link>
            </Button>
          </div>
        </div>
        
        {/* Organic Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary/15 blur-[100px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/15 blur-[100px] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] pointer-events-none -z-10" />
      </section>

      {/* Stats Section */}
      <section className="bg-card py-20 relative z-20 shadow-soft">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="group flex flex-col items-center justify-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 text-primary rounded-full mb-2 transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
                <Code2 className="w-8 h-8" />
              </div>
              <h3 className="text-5xl md:text-6xl font-serif text-primary transition-transform duration-500 group-hover:scale-110">{stats.challengesCount}</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Published Challenges</p>
            </div>
            <div className="group flex flex-col items-center justify-center space-y-4 text-center">
              <div className="p-4 bg-[#C18C5D]/10 text-secondary rounded-full mb-2 transition-colors duration-500 group-hover:bg-secondary group-hover:text-secondary-foreground">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-5xl md:text-6xl font-serif text-secondary transition-transform duration-500 group-hover:scale-110">{stats.modelsCount}</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Model Variants</p>
            </div>
            <div className="group flex flex-col items-center justify-center space-y-4 text-center">
              <div className="p-4 bg-[#A85448]/10 text-destructive rounded-full mb-2 transition-colors duration-500 group-hover:bg-destructive group-hover:text-destructive-foreground">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-5xl md:text-6xl font-serif text-destructive transition-transform duration-500 group-hover:scale-110">{stats.submissionsCount}</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Submissions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section id="challenges" className="py-24 md:py-32 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Latest Challenges</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">Discover how different models approach identical tasks with varying styles and capabilities.</p>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-32 rounded-[3rem] bg-muted/40 border border-border/50 shadow-inner">
            <h3 className="text-2xl font-serif text-foreground">No challenges available</h3>
            <p className="text-muted-foreground mt-4">Check back later or contact the administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {challenges.map((challenge, index) => {
              const organicRadii = [
                "rounded-[4rem_2rem_3rem_1.5rem]", 
                "rounded-[2rem_4rem_1.5rem_3rem]", 
                "rounded-[3rem_2rem_4rem_2rem]", 
                "rounded-[2.5rem_3.5rem_2rem_4rem]", 
                "rounded-[4rem_1.5rem_3rem_2rem]", 
                "rounded-[2rem_3rem_2.5rem_4rem]"
              ];
              const radiusClass = organicRadii[index % organicRadii.length];

              return (
              <Card key={challenge.id} className={cn("group overflow-hidden flex flex-col h-full border hover:border-primary/30 transition-all duration-500", radiusClass)}>
                <div className="relative aspect-[4/3] bg-muted overflow-hidden border-b border-border/50">
                  {challenge.cover_image ? (
                    <Image
                      src={challenge.cover_image}
                      alt={challenge.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 text-muted-foreground">
                      <Code2 className="w-16 h-16 opacity-30" />
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1 px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">Challenge</Badge>
                    <div className="flex items-center text-sm font-bold text-muted-foreground">
                      <Cpu className="w-4 h-4 mr-2 text-primary" />
                      {challenge.model_count} Models
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-serif group-hover:text-primary transition-colors line-clamp-1">{challenge.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-3 leading-relaxed text-base">
                    {challenge.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 p-8 pb-8 mt-auto">
                  <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 text-primary" asChild>
                    <Link href={`/challenges/${challenge.id}`}>
                      View Details
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        )}
      </section>
    </div>
  );
}
