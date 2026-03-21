import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UPLOAD_DIR, UPLOAD_MAX_FILE_SIZE_BYTES,
  ARTIFACT_TYPES, ALLOWED_EXTENSIONS,
  getArtifactDir, type ArtifactType
} from '@/lib/constants';

// POST /api/submissions/:id/artifacts — upload/replace artifact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const artifactType = formData.get('type') as string | null;

    if (!file || !artifactType) {
      return NextResponse.json({ error: 'file 和 type 必填' }, { status: 400 });
    }

    if (!ARTIFACT_TYPES.includes(artifactType as ArtifactType)) {
      return NextResponse.json({ error: `type 必须是 ${ARTIFACT_TYPES.join('/')}` }, { status: 400 });
    }

    // Size check
    if (file.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: '文件过大' }, { status: 400 });
    }

    // Extension check
    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = ALLOWED_EXTENSIONS[artifactType as ArtifactType];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: `不支持的文件格式，允许: ${allowedExts.join(', ')}` }, { status: 400 });
    }

    // Get submission context for file path
    const { data: submission } = await supabase
      .from('submission_overview')
      .select('challenge_id, phase_key, model_variant_id, channel_id')
      .eq('submission_id', submissionId)
      .single();

    if (!submission) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    // Build storage path
    const artifactDir = getArtifactDir(
      submission.challenge_id,
      submission.model_variant_id,
      submission.channel_id,
      submission.phase_key,
      artifactType as ArtifactType
    );

    const fileName = artifactType === 'html' ? 'index.html'
      : artifactType === 'prd' ? 'prd.md'
      : `preview${ext}`;

    const filePath = path.join(artifactDir, fileName);
    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    // Compute checksum
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    // Delete existing artifact of same type (upsert)
    await supabase
      .from('submission_artifacts')
      .delete()
      .eq('submission_id', submissionId)
      .eq('type', artifactType);

    // Insert new artifact record
    const { data, error } = await supabase
      .from('submission_artifacts')
      .insert({
        submission_id: submissionId,
        type: artifactType,
        file_path: filePath.replace(/\\/g, '/'),
        file_name: file.name,
        mime_type: file.type || null,
        checksum,
        file_size: file.size,
        metadata: {},
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Artifact upload error:', err);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
