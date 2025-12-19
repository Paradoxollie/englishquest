import { ReactNode, ButtonHTMLAttributes } from "react";

type ComicButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const variantClasses = {
  primary: "bg-cyan-500 text-white hover:bg-cyan-600",
  secondary: "bg-slate-700 text-white hover:bg-slate-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
  success: "bg-emerald-500 text-white hover:bg-emerald-600",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function ComicButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComicButtonProps) {
  return (
    <button
      className={`comic-button ${variantClasses[variant]} ${sizeClasses[size]} text-outline ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

