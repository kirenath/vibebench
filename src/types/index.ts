// Database entity types matching the PostgreSQL schema

export interface Vendor {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ModelFamily {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ModelVariant {
  id: string;
  family_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  rules_markdown: string | null;
  prompt_markdown: string | null;
  cover_image: string | null;
  is_published: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengePhase {
  id: string;
  challenge_id: string;
  phase_key: string;
  phase_label: string;
  description: string | null;
  sort_order: number;
  is_default: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Submission {
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
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionArtifact {
  id: string;
  submission_id: string;
  type: ArtifactType;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  checksum: string | null;
  file_size: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubmissionOverview {
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
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  has_html: boolean;
  has_prd: boolean;
  has_screenshot: boolean;
}

// Literal types
export type ArtifactType = "html" | "prd" | "screenshot";
export type TimingMethod = "manual" | "measured" | "estimated";

// API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
}

// Admin session
export interface AdminSession {
  role: "admin";
  iat: number;
  exp: number;
}
