import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { ARTIFACT_TYPES } from "@/lib/constants";
import { getR2PublicUrl } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id, type } = await params;

  if (!ARTIFACT_TYPES.includes(type as (typeof ARTIFACT_TYPES)[number])) {
    return jsonError("Invalid artifact type", 400);
  }

  try {
    const artifact = await queryOne<{
      file_path: string;
      file_name: string;
      mime_type: string;
    }>(
      `SELECT sa.file_path, sa.file_name, sa.mime_type
       FROM submission_artifacts sa
       JOIN submissions s ON s.id = sa.submission_id
       WHERE sa.submission_id = $1 AND sa.type = $2`,
      [id, type]
    );

    if (!artifact) {
      return jsonError("Artifact not found", 404);
    }

    const publicUrl = getR2PublicUrl(artifact.file_path);

    // HTML artifacts: proxy content so we can set Permissions-Policy header
    // (allows Clipboard API to work inside sandboxed iframes)
    if (type === "html") {
      const r2Res = await fetch(publicUrl);
      if (!r2Res.ok) {
        return jsonError("Failed to fetch artifact from storage", 502);
      }
      let html = await r2Res.text();

      // Inject <base> tag so relative/root URLs resolve against the R2 origin,
      // plus a script to patch pushState/replaceState (they throw SecurityError
      // when <base> causes hash/relative URLs to resolve to a cross-origin URL).
      const patchScript = `<script>(function(){var o=history.pushState,r=history.replaceState;function f(u){if(u!=null){try{var x=new URL(u,document.baseURI);if(x.origin!==location.origin)return location.origin+x.pathname+x.search+x.hash}catch(e){}}return u}history.pushState=function(s,t,u){return o.call(this,s,t,f(u))};history.replaceState=function(s,t,u){return r.call(this,s,t,f(u))}})()<\/script>`;
      const baseTag = `<base href="${publicUrl}">`;
      const injection = patchScript + baseTag;
      if (/<head[\s>]/i.test(html)) {
        html = html.replace(/(<head[\s>])/i, `$1${injection}`);
      } else if (/<html[\s>]/i.test(html)) {
        html = html.replace(/(<html[^>]*>)/i, `$1<head>${injection}</head>`);
      } else {
        html = injection + html;
      }

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Permissions-Policy": "clipboard-read=(*), clipboard-write=(*)",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }

    // Other artifacts (screenshot, prd): 302 redirect to R2
    return NextResponse.redirect(publicUrl, 302);
  } catch (e) {
    return jsonError("Failed to read artifact: " + (e as Error).message, 500);
  }
}
