export const ARTIFACT_TYPES = ['html', 'prd', 'screenshot'] as const;
export type ArtifactType = typeof ARTIFACT_TYPES[number];

export const TIMING_METHODS = ['manual', 'measured', 'estimated'] as const;
export type TimingMethod = typeof TIMING_METHODS[number];

export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
export const UPLOAD_MAX_FILE_SIZE_MB = parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '20', 10);
export const UPLOAD_MAX_FILE_SIZE_BYTES = UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const SANDBOX_BASE_URL = process.env.SANDBOX_BASE_URL || 'http://localhost:3001';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/** Allowed MIME types per artifact type */
export const ALLOWED_MIMES: Record<ArtifactType, string[]> = {
  html: ['text/html'],
  prd: ['text/markdown', 'text/plain', 'application/octet-stream'],
  screenshot: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
};

/** Allowed file extensions per artifact type */
export const ALLOWED_EXTENSIONS: Record<ArtifactType, string[]> = {
  html: ['.html', '.htm'],
  prd: ['.md', '.txt'],
  screenshot: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
};

/** File storage path builder */
export function getArtifactDir(
  challengeId: string,
  modelVariantId: string,
  channelId: string,
  phaseKey: string,
  artifactType: ArtifactType
): string {
  return `${challengeId}/${modelVariantId}/${channelId}/${phaseKey}/${artifactType}`;
}

export function getCoverDir(): string {
  return 'covers';
}
