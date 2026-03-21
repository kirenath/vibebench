import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const challengePhaseId = formData.get('challenge_phase_id') as string;
    const modelVariantId = formData.get('model_variant_id') as string;
    const channelId = formData.get('channel_id') as string;

    const challengeId = formData.get('challenge_id') as string;
    const phaseKey = formData.get('phase_key') as string;

    if (!challengePhaseId || !modelVariantId || !channelId || !challengeId || !phaseKey) {
      return NextResponse.json({ error: 'Missing required relational fields' }, { status: 400 });
    }

    const manualTouched = formData.get('manual_touched') === 'true';
    const manualNotes = formData.get('manual_notes') as string || null;
    const isPublished = formData.get('is_published') === 'true';
    const durationMs = formData.get('duration_ms') ? Number(formData.get('duration_ms')) : null;
    const iterationCount = formData.get('iteration_count') ? Number(formData.get('iteration_count')) : null;
    
    // UPSERT Submission
    const existingSubmissions = await sql`
      SELECT id FROM submissions 
      WHERE challenge_phase_id = ${challengePhaseId} 
        AND model_variant_id = ${modelVariantId} 
        AND channel_id = ${channelId}
    `;

    let submissionId;
    if (existingSubmissions.length > 0) {
      submissionId = existingSubmissions[0].id;
      await sql`
        UPDATE submissions 
        SET manual_touched = ${manualTouched},
            manual_notes = ${manualNotes},
            is_published = ${isPublished},
            duration_ms = ${durationMs},
            iteration_count = ${iterationCount},
            published_at = ${isPublished ? sql`NOW()` : null},
            updated_at = NOW()
        WHERE id = ${submissionId}
      `;
    } else {
      const inserted = await sql`
        INSERT INTO submissions (
          challenge_phase_id, model_variant_id, channel_id, 
          manual_touched, manual_notes, is_published, duration_ms, iteration_count, published_at
        ) VALUES (
          ${challengePhaseId}, ${modelVariantId}, ${channelId}, 
          ${manualTouched}, ${manualNotes}, ${isPublished}, ${durationMs}, ${iterationCount},
          ${isPublished ? sql`NOW()` : null}
        )
        RETURNING id
      `;
      submissionId = inserted[0].id;
    }

    // Process Files
    const uploadDirBasics = process.env.UPLOAD_DIR || './uploads';
    const baseDir = path.join(uploadDirBasics, challengeId, modelVariantId, channelId, phaseKey);

    const processFile = async (file: File | null, type: string) => {
      if (!file || !(file instanceof File)) return;
      const typeDir = path.join(baseDir, type);
      await mkdir(typeDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(typeDir, file.name);

      await writeFile(filePath, buffer);

      // UPSERT artifact DB record
      const relativePath = `/${challengeId}/${modelVariantId}/${channelId}/${phaseKey}/${type}/${file.name}`;
      
      const existingArtifacts = await sql`SELECT id FROM submission_artifacts WHERE submission_id = ${submissionId} AND type = ${type}`;
      if (existingArtifacts.length > 0) {
        await sql`
          UPDATE submission_artifacts
          SET file_path = ${relativePath},
              file_name = ${file.name},
              mime_type = ${file.type},
              file_size = ${file.size},
              updated_at = NOW()
          WHERE id = ${existingArtifacts[0].id}
        `;
      } else {
        await sql`
          INSERT INTO submission_artifacts (submission_id, type, file_path, file_name, mime_type, file_size)
          VALUES (${submissionId}, ${type}, ${relativePath}, ${file.name}, ${file.type}, ${file.size})
        `;
      }
    };

    await processFile(formData.get('file_html') as File | null, 'html');
    await processFile(formData.get('file_prd') as File | null, 'prd');
    await processFile(formData.get('file_screenshot') as File | null, 'screenshot');

    return NextResponse.json({ success: true, submissionId });
  } catch (error: any) {
    console.error("Submission API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
