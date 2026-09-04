import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <>
      <AdminNav nome={admin.nome} />
      <main className="flex-1 bg-paper">{children}</main>
    </>
  );
}
