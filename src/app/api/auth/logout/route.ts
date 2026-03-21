import { clearAuthCookie } from "@/lib/auth";
import { json } from "@/lib/api-helpers";

export async function POST() {
  await clearAuthCookie();
  return json({ success: true });
}
