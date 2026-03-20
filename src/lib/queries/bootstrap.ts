import { createServiceRoleClient } from "@/lib/supabase/server";

type HealthStatus = "connected" | "misconfigured" | "schema-missing" | "query-failed";

export type BootstrapStats = {
  envReady: boolean;
  connectionStatus: HealthStatus;
  connectionMessage: string;
  counts: {
    publishedChallenges: number;
    publishedSubmissions: number;
    compareReadyEntries: number;
  };
  publishedChallenges: Array<{
    id: string;
    title: string;
    updatedAt: string | null;
    publishedAt: string | null;
  }>;
};

type PublishedChallengeRow = {
  id: string;
  title: string;
  updated_at: string | null;
  published_at: string | null;
};

export async function getBootstrapStats(): Promise<BootstrapStats> {
  try {
    const supabase = createServiceRoleClient();

    const [
      publishedChallengesCountResult,
      publishedChallengesResult,
      publishedSubmissionsResult,
      compareReadyEntriesResult
    ] =
      await Promise.all([
        supabase
          .from("challenges")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true),
        supabase
          .from("challenges")
          .select("id, title, updated_at, published_at")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("updated_at", { ascending: false })
          .limit(6),
        supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true),
        supabase
          .from("submission_overview")
          .select("*", { count: "exact", head: true })
          .eq("challenge_is_published", true)
          .eq("submission_is_published", true)
          .eq("has_html", true)
      ]);

    const errors = [
      publishedChallengesCountResult.error,
      publishedChallengesResult.error,
      publishedSubmissionsResult.error,
      compareReadyEntriesResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      const message = errors[0]?.message ?? "Unknown query error";
      const schemaMissing =
        message.includes("relation") || message.includes("does not exist");

      return {
        envReady: true,
        connectionStatus: schemaMissing ? "schema-missing" : "query-failed",
        connectionMessage: message,
        counts: {
          publishedChallenges: 0,
          publishedSubmissions: 0,
          compareReadyEntries: 0
        },
        publishedChallenges: []
      };
    }

    const publishedChallenges = (publishedChallengesResult.data ??
      []) as PublishedChallengeRow[];

    return {
      envReady: true,
      connectionStatus: "connected",
      connectionMessage: "Supabase service connection is working.",
      counts: {
        publishedChallenges: publishedChallengesCountResult.count ?? 0,
        publishedSubmissions: publishedSubmissionsResult.count ?? 0,
        compareReadyEntries: compareReadyEntriesResult.count ?? 0
      },
      publishedChallenges: publishedChallenges.map((challenge) => ({
          id: challenge.id,
          title: challenge.title,
          updatedAt: challenge.updated_at,
          publishedAt: challenge.published_at
        }))
    };
  } catch (error) {
    return {
      envReady: false,
      connectionStatus: "misconfigured",
      connectionMessage: error instanceof Error ? error.message : "Unknown configuration error",
      counts: {
        publishedChallenges: 0,
        publishedSubmissions: 0,
        compareReadyEntries: 0
      },
      publishedChallenges: []
    };
  }
}
