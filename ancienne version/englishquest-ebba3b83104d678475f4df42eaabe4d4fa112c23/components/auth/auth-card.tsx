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
    <div className="glass-panel w-full max-w-md px-6 py-8 shadow-2xl">
      <div className="space-y-1 pb-6 text-center text-slate-100">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
      <p className="pt-6 text-center text-sm text-slate-400">
        {footerHint}{" "}
        <Link href={footerHref} className="font-semibold text-cyan-300 hover:text-cyan-200">
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}

