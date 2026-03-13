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
    <div className="comic-card-dark w-full max-w-lg p-6 md:p-8">
      <div className="relative z-10">
        <div className="pb-6 text-slate-100">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
            Authentification
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white text-outline">
            {title}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
            {subtitle}
          </p>
        </div>

        {children}

        <p className="border-t border-white/10 pt-6 text-center text-sm font-semibold text-slate-400">
          {footerHint}{" "}
          <Link href={footerHref} className="font-bold text-cyan-300 hover:text-cyan-200">
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
