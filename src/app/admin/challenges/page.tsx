import { sql } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { createChallenge, togglePublishChallenge, deleteChallenge } from "./actions";

export default async function AdminChallenges() {
  const challenges = await sql`
    SELECT id, title, description, is_published, created_at,
      (SELECT count(*) FROM challenge_phases cp WHERE cp.challenge_id = c.id) as phase_count
    FROM challenges c
    ORDER BY created_at DESC
  `;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground mt-1">Manage platform coding challenges and their visibility.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createChallenge} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID (URL Key)</label>
                  <input name="id" required placeholder="e.g. receipt-ui" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input name="title" required placeholder="e.g. Receipt UI Challenge" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea name="description" rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Challenge
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {challenges.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No challenges found. Create one to get started.</p>
            </div>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <div className="flex items-start justify-between p-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                      <Badge variant={challenge.is_published ? "default" : "secondary"}>
                        {challenge.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-xs">{challenge.id}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md line-clamp-2">
                      {challenge.description || "No description"}
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {challenge.phase_count} Phases • Created {new Date(challenge.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <form action={async () => {
                      "use server";
                      await togglePublishChallenge(challenge.id, challenge.is_published);
                    }}>
                      <Button variant="outline" size="sm" type="submit" className="w-28 justify-start">
                        {challenge.is_published ? <><EyeOff className="w-4 h-4 mr-2"/> Unpublish</> : <><Eye className="w-4 h-4 mr-2"/> Publish</>}
                      </Button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await deleteChallenge(challenge.id);
                    }}>
                      <Button variant="destructive" size="sm" type="submit" className="w-28 justify-start">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
