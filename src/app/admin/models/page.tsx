import { sql } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Layers, Server } from "lucide-react";

export default async function AdminModels() {
  const models = await sql`
    SELECT 
      mv.id, mv.name, mv.description, mv.sort_order,
      mf.name as family_name,
      v.name as vendor_name
    FROM model_variants mv
    JOIN model_families mf ON mv.family_id = mf.id
    JOIN vendors v ON mf.vendor_id = v.id
    ORDER BY v.sort_order ASC, mf.sort_order ASC, mv.sort_order ASC
  `;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Directory</h1>
        <p className="text-muted-foreground mt-1">View the taxonomy of vendors, families, and variants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="group">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Server className="w-3 h-3" /> {model.vendor_name}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Layers className="w-3 h-3 mr-1" /> {model.family_name}
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-muted-foreground" />
                {model.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-muted-foreground">
              <p className="line-clamp-2">{model.description || "No description provided."}</p>
              <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs">
                <span>ID: <code className="bg-muted px-1 py-0.5 rounded">{model.id}</code></span>
                <span>Order: {model.sort_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {models.length === 0 && (
          <div className="col-span-full p-12 text-center border-dashed border rounded-xl bg-muted/10">
            <p className="text-muted-foreground">No models configured. Add them directly via database seeding for MVP.</p>
          </div>
        )}
      </div>
    </div>
  );
}
