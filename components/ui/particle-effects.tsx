"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ParticleEffectProps {
  trigger: boolean;
  type: "success" | "milestone" | "combo";
  position?: { x: number; y: number };
}

export function ParticleEffect({ trigger, type, position }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clean up any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clear canvas immediately
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only create particles if trigger is true
    if (!trigger) {
      particlesRef.current = [];
      isAnimatingRef.current = false;
      return;
    }

    // Create particles based on type
    const particleCount = type === "milestone" ? 100 : type === "combo" ? 60 : 40;
    const colors = 
      type === "milestone" 
        ? ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1"]
        : type === "combo"
        ? ["#FF6B6B", "#FFA500", "#FFD700"]
        : ["#10B981", "#34D399", "#6EE7B7"];

    const centerX = position?.x ?? canvas.width / 2;
    const centerY = position?.y ?? canvas.height / 2;

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const angle = (Math.PI * 2 * Math.random());
      const speed = type === "milestone" ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        size: type === "milestone" ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    isAnimatingRef.current = true;

    // Animation loop
    const animate = () => {
      if (!isAnimatingRef.current || !canvas || !ctx) {
        return;
      }

      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.life++;

        // Only draw if particle is still alive
        if (particle.life < particle.maxLife) {
          const alpha = 1 - particle.life / particle.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        return particle.life < particle.maxLife;
      });

      // Continue animation if there are particles left
      if (particlesRef.current.length > 0 && isAnimatingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete, clear canvas one more time
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isAnimatingRef.current = false;
        animationFrameRef.current = null;
      }
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Clear canvas on cleanup
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [trigger, type, position]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

