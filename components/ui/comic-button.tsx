import type { ButtonHTMLAttributes, ReactNode } from "react";

type ComicButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const variantClasses = {
  primary: "eq-btn-primary",
  secondary: "eq-btn-ghost",
  danger: "eq-btn-danger",
  success: "eq-btn-mint",
};

const sizeClasses = {
  sm: "eq-btn-sm",
  md: "",
  lg: "eq-btn-lg",
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
      className={`eq-btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
