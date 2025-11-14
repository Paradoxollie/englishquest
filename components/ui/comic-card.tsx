import { ReactNode } from "react";
import Link from "next/link";

type ComicCardProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: "light" | "dark";
  onClick?: () => void;
};

export function ComicCard({
  children,
  href,
  className = "",
  variant = "dark",
  onClick,
}: ComicCardProps) {
  const baseClasses = variant === "dark" ? "comic-card-dark" : "comic-card";
  const combinedClasses = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={combinedClasses}>
        {children}
      </button>
    );
  }

  return <div className={combinedClasses}>{children}</div>;
}


