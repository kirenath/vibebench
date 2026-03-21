import { sql } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

async function getModels() {
  // Return variants that have at least 1 published submission
  return await sql`
    SELECT 
      mv.id, mv.name, mv.description,
      mf.name as family_name,
      v.name as vendor_name,
      (
        SELECT count(DISTINCT s.challenge_phase_id)::int 
        FROM submissions s 
        WHERE s.model_variant_id = mv.id AND s.is_published = true
      ) as participation_count
    FROM model_variants mv
    JOIN model_families mf ON mv.family_id = mf.id
    JOIN vendors v ON mf.vendor_id = v.id
    WHERE EXISTS (
      SELECT 1 FROM submissions s WHERE s.model_variant_id = mv.id AND s.is_published = true
    )
    ORDER BY v.sort_order ASC, mf.sort_order ASC, mv.sort_order ASC
  `;
}

export default async function ModelsPage() {
  const models = await getModels();

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Cpu className="w-8 h-8 text-primary" /> Models Directory
        </h1>
        <p className="text-xl text-muted-foreground mt-4 leading-relaxed">
          Explore all AI models that have participated in VibeBench challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="group hover:border-primary/50 transition-colors flex flex-col items-start border shadow-sm">
            <CardHeader className="w-full">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-xs bg-muted">
                  {model.vendor_name}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Layers className="w-3 h-3 mr-1" />
                  {model.participation_count} Entries
                </div>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {model.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {model.family_name} Family
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 mt-auto w-full">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link href={`/models/${model.id}`}>
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {models.length === 0 && (
         <div className="text-center py-24 rounded-2xl border border-dashed bg-muted/10">
           <h3 className="text-lg font-medium text-foreground">No active models yet</h3>
           <p className="text-muted-foreground mt-2">Models will appear here once they have published submissions.</p>
         </div>
      )}
    </div>
  );
}
