import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to the primary sub-dashboard section for MVP
  redirect("/admin/challenges");
}
