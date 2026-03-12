"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable motion card component with:
 * - Clean entry animation
 * - Subtle hover lift without continuous floating
 * - Smooth transitions
 */
export function MotionCard({ children, className = "" }: MotionCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.45 },
        y: { duration: 0.45, ease: "easeOut" },
      }}
      whileHover={{
        scale: 1.01,
        y: -3,
        transition: { duration: 0.18 },
      }}
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}
