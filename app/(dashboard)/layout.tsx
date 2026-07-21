import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Usuario } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: usuario } = await supabase.from("usuarios").select("*").single();

  if (!usuario) redirect("/login");

  return (
    <>
      <DashboardNav usuario={usuario as Usuario} />
      <main className="flex-1 bg-paper">{children}</main>
    </>
  );
}
