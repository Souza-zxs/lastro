import { Logo } from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-paper-texture flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
