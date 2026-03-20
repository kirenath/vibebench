import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-organic-bg">
      <AdminSidebar />
      <div className="flex-1 p-10">{children}</div>
    </div>
  );
}
