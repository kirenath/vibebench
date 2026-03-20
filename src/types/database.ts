export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          rules_markdown: string | null;
          prompt_markdown: string | null;
          cover_image: string | null;
          is_published: boolean;
          sort_order: number;
          metadata: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          challenge_phase_id: string;
          model_variant_id: string;
          channel_id: string;
          is_published: boolean;
          manual_touched: boolean;
          manual_notes: string | null;
          iteration_count: number | null;
          run_started_at: string | null;
          run_finished_at: string | null;
          duration_ms: number | null;
          timing_method: string | null;
          prompt_snapshot: string | null;
          notes: string | null;
          metadata: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Views: {
      submission_overview: {
        Row: {
          submission_id: string;
          challenge_id: string;
          challenge_title: string;
          challenge_is_published: boolean;
          challenge_phase_id: string;
          phase_key: string;
          phase_label: string;
          phase_sort_order: number;
          vendor_id: string;
          vendor_name: string;
          model_family_id: string;
          model_family_name: string;
          model_variant_id: string;
          model_variant_name: string;
          channel_id: string;
          channel_name: string;
          submission_is_published: boolean;
          manual_touched: boolean;
          manual_notes: string | null;
          iteration_count: number | null;
          run_started_at: string | null;
          run_finished_at: string | null;
          duration_ms: number | null;
          timing_method: string | null;
          prompt_snapshot: string | null;
          notes: string | null;
          metadata: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          has_html: boolean;
          has_prd: boolean;
          has_screenshot: boolean;
        };
      };
    };
  };
}
