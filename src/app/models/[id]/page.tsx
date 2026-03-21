import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cpu, Globe, ArrowRight, Layers, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetail({ params }: PageProps) {
  const { id } = await params;
  
  const models = await sql`
    SELECT 
      mv.id, mv.name, mv.description,
      mf.name as family_name,
      v.name as vendor_name
    FROM model_variants mv
    JOIN model_families mf ON mv.family_id = mf.id
    JOIN vendors v ON mf.vendor_id = v.id
    WHERE mv.id = ${id}
  `;

  if (models.length === 0) {
    notFound();
  }
  const model = models[0];

  // Fetch latest published submission for each challenge this model participated in
  // We rank submissions per challenge by created_at DESC and take the top 1
  const submissions = await sql`
    WITH RankedSubmissions AS (
      SELECT 
        s.id as submission_id,
        s.created_at as submission_date,
        s.has_html,
        cp.phase_label,
        cp.phase_key,
        c.id as challenge_id,
        c.title as challenge_title,
        c.description as challenge_desc,
        c.cover_image,
        ch.name as channel_name,
        ROW_NUMBER() OVER(PARTITION BY c.id ORDER BY s.published_at DESC) as rn
      FROM submissions s
      JOIN challenge_phases cp ON s.challenge_phase_id = cp.id
      JOIN challenges c ON cp.challenge_id = c.id
      JOIN channels ch ON s.channel_id = ch.id
      -- We need to check if there is an html artifact, let's just use EXIST subquery
      LEFT JOIN (SELECT submission_id FROM submission_artifacts WHERE type = 'html' LIMIT 1) sa 
        ON sa.submission_id = s.id
      WHERE s.model_variant_id = ${id} AND s.is_published = true
        AND c.is_published = true
    )
    SELECT * FROM RankedSubmissions WHERE rn = 1 ORDER BY submission_date DESC
  `;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" asChild>
        <Link href="/models">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Models
        </Link>
      </Button>

      <div className="mb-12 bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{model.vendor_name}</Badge>
          <Badge variant="outline">{model.family_name} Family</Badge>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Cpu className="w-8 h-8 text-muted-foreground" />
          {model.name}
        </h1>
        <p className="text-lg text-muted-foreground mt-4 leading-relaxed max-w-3xl">
          {model.description || "No specific description available for this model variant."}
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-muted-foreground" />
          Participated Challenges
        </h2>
        <span className="text-muted-foreground text-sm">{submissions.length} Total</span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-muted/10 border-dashed">
          <h3 className="text-lg font-medium text-foreground">No published submissions</h3>
          <p className="text-muted-foreground mt-1">This model hasn't been featured in any public challenges yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => (
            <Card key={sub.submission_id} className="group overflow-hidden flex flex-col h-full hover:border-primary/40 transition-colors">
              <div className="relative aspect-[21/9] bg-muted border-b overflow-hidden">
                {sub.cover_image ? (
                  <Image src={sub.cover_image} alt={sub.challenge_title} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                    <Globe className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-background/80 backdrop-blur text-foreground border shadow-sm hover:bg-background">{sub.phase_label}</Badge>
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur shadow-sm hover:bg-background">{sub.channel_name}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{sub.challenge_title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1 leading-relaxed">
                  {sub.challenge_desc}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 mt-auto bg-muted/10 p-4 border-t">
                <Button variant="ghost" className="w-full justify-between" asChild>
                  <Link href={`/challenges/${sub.challenge_id}?phase=${sub.phase_key}`}>
                    View Challenge
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
