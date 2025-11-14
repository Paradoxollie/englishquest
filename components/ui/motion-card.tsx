"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable motion card component with:
 * - Subtle float animation (up/down)
 * - Hover tilt effect (rotateX / rotateY)
 * - Smooth transitions
 * 
 * Use this for hero cards and info cards throughout the app.
 */
export function MotionCard({ children, className = "" }: MotionCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.5 },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5, // Start float after initial entrance
        },
      }}
      whileHover={{
        // Hover tilt effect
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

