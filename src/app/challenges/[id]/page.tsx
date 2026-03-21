import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, RefreshCw, GitCommit, FileText, MonitorPlay } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChallengeDetail({ params, searchParams }: PageProps) {
  const { id } = await params;
  const p = await searchParams;
  
  // 1. Fetch Challenge
  const challenges = await sql`
    SELECT id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, metadata, created_at 
    FROM challenges 
    WHERE id = ${id} AND is_published = true
  `;
  
  if (challenges.length === 0) {
    notFound();
  }
  const challenge = challenges[0];

  // 2. Fetch Phases
  const phases = await sql`
    SELECT id, phase_key, phase_label, description, is_default 
    FROM challenge_phases 
    WHERE challenge_id = ${id} 
    ORDER BY sort_order ASC
  `;

  // Determine active phase
  let activePhaseKey = p.phase as string | undefined;
  if (!activePhaseKey && phases.length > 0) {
    const defaultPhase = phases.find(p => p.is_default) || phases[0];
    activePhaseKey = defaultPhase.phase_key;
  }
  
  const activePhase = phases.find(p => p.phase_key === activePhaseKey);

  // 3. Fetch Submissions for active phase if it exists
  let submissions: any[] = [];
  if (activePhase) {
    submissions = await sql`
      SELECT 
        s.id, 
        s.manual_touched, 
        s.manual_notes,
        s.duration_ms,
        s.iteration_count,
        s.published_at,
        v.name as vendor_name,
        mf.name as family_name,
        mv.id as variant_id,
        mv.name as variant_name,
        c.id as channel_id,
        c.name as channel_name,
        EXISTS (
          SELECT 1 FROM submission_artifacts sa WHERE sa.submission_id = s.id AND sa.type = 'html'
        ) as has_html,
        EXISTS (
          SELECT 1 FROM submission_artifacts sa WHERE sa.submission_id = s.id AND sa.type = 'prd'
        ) as has_prd
      FROM submissions s
      JOIN model_variants mv ON s.model_variant_id = mv.id
      JOIN model_families mf ON mv.family_id = mf.id
      JOIN vendors v ON mf.vendor_id = v.id
      JOIN channels c ON s.channel_id = c.id
      WHERE s.challenge_phase_id = ${activePhase.id} AND s.is_published = true
      ORDER BY s.published_at DESC
    `;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Challenges
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative w-full md:w-1/3 aspect-video bg-muted rounded-xl border overflow-hidden shrink-0 shadow-sm">
            {challenge.cover_image ? (
              <Image src={challenge.cover_image} alt={challenge.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <FileText className="w-12 h-12 opacity-30" />
              </div>
            )}
          </div>
          <div className="space-y-4 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{challenge.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{challenge.description}</p>
            
            <div className="pt-4 border-t border-border flex flex-wrap gap-2">
              {phases.map((phase) => (
                <Button 
                  key={phase.id} 
                  variant={phase.phase_key === activePhaseKey ? "default" : "outline"} 
                  className="rounded-full"
                  asChild
                >
                  <Link href={`/challenges/${id}?phase=${phase.phase_key}`}>
                    {phase.phase_label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activePhase && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              {activePhase.phase_label} Submissions
            </h2>
            <div className="text-sm text-muted-foreground">
              {submissions.length} Models Participated
            </div>
          </div>

          {activePhase.description && (
            <p className="text-muted-foreground mb-8 p-4 bg-muted/30 rounded-lg border">
              {activePhase.description}
            </p>
          )}

          {submissions.length === 0 ? (
            <div className="text-center py-24 rounded-2xl border border-dashed bg-muted/10">
              <h3 className="text-lg font-medium text-foreground">No submissions yet</h3>
              <p className="text-muted-foreground mt-2">Check back later for AI coding results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((sub) => (
                <div key={sub.id} className="flex flex-col bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6 border-b flex items-start justify-between bg-muted/10 rounded-t-xl">
                    <div>
                      <div className="text-xs font-medium text-primary mb-1">{sub.vendor_name}</div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">{sub.variant_name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MonitorPlay className="w-3 h-3" />
                        {sub.channel_name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {sub.manual_touched && <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 shadow-none border border-orange-200">Manual Edit</Badge>}
                      {sub.has_html && <Badge variant="secondary" className="shadow-none border">HTML Available</Badge>}
                      {sub.has_prd && <Badge variant="outline" className="shadow-none border">PRD Extracted</Badge>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 text-sm">
                      {sub.duration_ms != null && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> Time</span>
                          <span className="font-medium">{(sub.duration_ms / 1000).toFixed(1)}s</span>
                        </div>
                      )}
                      {sub.iteration_count != null && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs flex items-center gap-1 mb-1"><RefreshCw className="w-3 h-3"/> Iterations</span>
                          <span className="font-medium">{sub.iteration_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 border-t rounded-b-xl flex gap-2">
                    <Button variant="default" className="w-full flex-1" disabled={!sub.has_html} asChild={sub.has_html}>
                      {sub.has_html ? (
                        <Link href={`/compare?challenge=${id}&phase=${activePhaseKey}&entries=${sub.variant_id}@${sub.channel_id}`}>
                          Compare
                        </Link>
                      ) : (
                        <span>No Output</span>
                      )}
                    </Button>
                    {sub.manual_touched && (
                       // Can open a modal or simple alert later
                       <Button variant="outline" size="icon" title={sub.manual_notes || "Manually revised"}>
                          <GitCommit className="w-4 h-4 text-orange-500" />
                       </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
