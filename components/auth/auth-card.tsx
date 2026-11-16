import type { PropsWithChildren } from "react";
import Link from "next/link";

type AuthCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footerHint: string;
  footerLinkLabel: string;
  footerHref: string;
}>;

export function AuthCard({
  title,
  subtitle,
  children,
  footerHint,
  footerLinkLabel,
  footerHref,
}: AuthCardProps) {
  return (
    <div className="eq-card w-full max-w-lg p-6 md:p-8">
      <h1 className="eq-h2">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{subtitle}</p>

      <div className="mt-6">{children}</div>

      <p className="mt-6 border-t border-[var(--line)] pt-5 text-center text-sm eq-muted">
        {footerHint}{" "}
        <Link href={footerHref} className="eq-text-link">
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
