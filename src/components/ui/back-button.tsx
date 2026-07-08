import Link from "next/link";

export function BackButton({
  href,
  className = "bg-sage",
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Voltar"
      className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-base ${className}`}
    >
      ←
    </Link>
  );
}
