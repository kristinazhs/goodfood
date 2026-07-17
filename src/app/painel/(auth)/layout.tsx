export default function PainelAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-6 py-12">
      {children}
    </div>
  );
}
