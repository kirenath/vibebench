import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { AlertCircle, Code2, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 0; // Dynamic route based on searchParams

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const p = await searchParams;
  const challengeId = p.challenge as string;
  const phaseKey = p.phase as string;
  const entriesQuery = p.entries as string; // modelId@channelId,modelId@channelId

  if (!challengeId || !entriesQuery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Invalid Compare Parameters</h2>
        <p className="text-muted-foreground">Missing challenge or entries in URL.</p>
        <Button asChild><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  // 1. Fetch Challenge & Phase
  const challenges = await sql`
    SELECT id, title, rules_markdown FROM challenges WHERE id = ${challengeId} AND is_published = true
  `;
  if (challenges.length === 0) notFound();
  const challenge = challenges[0];

  const phases = await sql`
    SELECT id, phase_label FROM challenge_phases WHERE challenge_id = ${challengeId} AND phase_key = ${phaseKey}
  `;
  if (phases.length === 0) notFound();
  const activePhase = phases[0];

  // 2. Parse entries
  const entryKeys = entriesQuery.split(",").filter(Boolean); // ["gpt-4-pro@web", "claude-3@api"]
  if (entryKeys.length < 1 || entryKeys.length > 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
         <p>Please select between 1 to 4 models to compare.</p>
      </div>
    );
  }

  // 3. Fetch submissions for these entries
  const conditions = entryKeys.map(key => {
    const [modelVariantId, channelId] = key.split("@");
    return { modelVariantId, channelId };
  });

  // Construct queries for each requested submission
  const fetchedSubmissions = await Promise.all(
    conditions.map(async (cond) => {
      const dbRow = await sql`
        SELECT 
          s.id, s.manual_touched, s.manual_notes,
          mv.name as variant_name, v.name as vendor_name, c.name as channel_name
        FROM submissions s
        JOIN model_variants mv ON s.model_variant_id = mv.id
        JOIN model_families mf ON mv.family_id = mf.id
        JOIN vendors v ON mf.vendor_id = v.id
        JOIN channels c ON s.channel_id = c.id
        WHERE s.challenge_phase_id = ${activePhase.id} 
          AND s.model_variant_id = ${cond.modelVariantId}
          AND s.channel_id = ${cond.channelId}
          AND s.is_published = true
      `;
      return dbRow[0] || null;
    })
  );

  const sandboxBaseUrl = process.env.SANDBOX_BASE_URL || "http://localhost:3001";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Compare Header */}
      <header className="border-b bg-muted/20 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href={`/challenges/${challengeId}?phase=${phaseKey}`}>Back</Link>
          </Button>
          <div>
            <h1 className="font-bold text-foreground leading-none">{challenge.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-[10px] h-5 rounded-sm">{activePhase.phase_label}</Badge>
              <span className="text-xs text-muted-foreground">{entryKeys.length} models compared</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" className="hidden md:flex gap-1" asChild>
             <Link href={`/challenges/${challengeId}?phase=${phaseKey}`}><Code2 className="w-3 h-3"/> View Rules</Link>
           </Button>
        </div>
      </header>

      {/* Iframes Grid */}
      <div className={`flex-1 grid gap-0 divide-x divide-y md:divide-y-0 h-full ${
        fetchedSubmissions.length === 1 ? "grid-cols-1" :
        fetchedSubmissions.length === 2 ? "grid-cols-1 md:grid-cols-2" :
        fetchedSubmissions.length === 3 ? "grid-cols-1 md:grid-cols-3" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      }`}>
        {fetchedSubmissions.map((sub, index) => {
          if (!sub) {
            return (
              <div key={index} className="flex flex-col items-center justify-center p-8 text-center border-b md:border-b-0 h-[50vh] md:h-auto">
                <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Submission not found</p>
                <p className="text-xs text-muted-foreground/70">{entryKeys[index]} does not exist or is unpublished.</p>
              </div>
            );
          }

          const iframeUrl = `${sandboxBaseUrl}/s/${sub.id}/index.html`;

          return (
            <div key={sub.id} className="relative flex flex-col h-[50vh] md:h-full group">
              {/* Overlay Header */}
              <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-background/95 to-background/0 z-10 pointer-events-none transition-opacity">
                <div className="inline-flex flex-col backdrop-blur-md bg-background/80 border p-2 rounded-lg shadow-sm pointer-events-auto">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-primary">{sub.vendor_name}</span>
                    <span className="text-xs text-muted-foreground">{sub.channel_name}</span>
                  </div>
                  <div className="font-bold text-sm tracking-tight">{sub.variant_name}</div>
                  
                  {sub.manual_touched && (
                    <div className="mt-1">
                      <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-orange-200 text-[10px] px-1.5 py-0">Manual Edit</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Toolbar */}
              <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md" asChild>
                  <a href={iframeUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              {/* Sandboxed iframe */}
              <iframe
                src={iframeUrl}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts"
                title={`${sub.variant_name} code execution`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
