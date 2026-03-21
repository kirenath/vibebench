import { sql } from "@/lib/db";
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
      <section className="relative px-4 py-24 md:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
          <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Vibe Coding Horizontal Review
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground balance-text">
            Compare AI Coding Models <br className="hidden md:inline" />
            <span className="text-primary bg-clip-text">Side-by-Side</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            VibeBench collects frontend creations from various AI models solving the exact same coding challenges. Explore, switch phases, and see who "vibes" the best.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" asChild>
              <Link href="#challenges">
                Browse Challenges <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link href="/models">View Models Directory</Link>
            </Button>
          </div>
        </div>
        
        {/* Abstract shapes for Organic feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none -z-10" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x border-border">
            <div className="flex flex-col items-center justify-center p-4 space-y-2 text-center">
              <div className="p-3 bg-primary/10 text-primary rounded-full mb-2">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-bold tracking-tight text-foreground">{stats.challengesCount}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Published Challenges</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 space-y-2 text-center">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full mb-2">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-bold tracking-tight text-foreground">{stats.modelsCount}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Model Variants</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 space-y-2 text-center">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-full mb-2">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-bold tracking-tight text-foreground">{stats.submissionsCount}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Submissions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section id="challenges" className="py-20 md:py-24 container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Latest Challenges</h2>
            <p className="text-muted-foreground mt-2">Discover how different models approach identical tasks.</p>
          </div>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-muted/30 border-dashed">
            <h3 className="text-lg font-medium text-foreground">No challenges available</h3>
            <p className="text-muted-foreground mt-1">Check back later or contact the administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="group overflow-hidden flex flex-col h-full border hover:border-primary/50 transition-all">
                <div className="relative aspect-video bg-muted overflow-hidden border-b">
                  {challenge.cover_image ? (
                    <Image
                      src={challenge.cover_image}
                      alt={challenge.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 text-muted-foreground">
                      <Code2 className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs font-normal">Challenge</Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Cpu className="w-3 h-3 mr-1" />
                      {challenge.model_count} Models
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{challenge.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                    {challenge.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 border-t p-4 bg-muted/10">
                  <Button variant="ghost" className="w-full justify-between" asChild>
                    <Link href={`/challenges/${challenge.id}`}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
