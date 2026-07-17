import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default function MobileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cream md:shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
      <PrototypeBanner />
      {children}
    </div>
  );
}
