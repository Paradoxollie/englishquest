"use client";

import { motion, AnimatePresence } from "framer-motion";

// --- Combo Counter ---
interface ComboCounterProps {
    combo: number;
}

export function ComboCounter({ combo }: ComboCounterProps) {
    if (combo < 2) return null;

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={combo}
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1.2, opacity: 1, y: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute top-24 right-8 z-20 pointer-events-none"
            >
                <div className="relative">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 italic skew-x-[-10deg] drop-shadow-[4px_4px_0_#000]">
                        {combo}x
                    </div>
                    <div className="text-xl font-bold text-white uppercase tracking-widest text-outline text-center -mt-2 skew-x-[-10deg]">
                        COMBO!
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// --- Hit Effects ---
interface HitEffectProps {
    type: "hit" | "miss";
    id: number;
}

export function HitEffect({ type, id }: HitEffectProps) {
    const text = type === "hit" ? "NICE!" : "MISS!";
    const color = type === "hit" ? "text-emerald-400" : "text-red-500";
    const rotation = (id % 31) - 15;

    return (
        <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: [0, 1.5, 1], rotate: rotation, opacity: [1, 1, 0] }}
            transition={{ duration: 0.6 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-6xl font-black ${color} text-outline drop-shadow-[4px_4px_0_#000]`}
        >
            {text}
        </motion.div>
    );
}

// --- Timeline Bar ---
interface TimelineBarProps {
    timeLeft: number;
    totalTime: number;
}

export function TimelineBar({ timeLeft, totalTime }: TimelineBarProps) {
    const percentage = (timeLeft / totalTime) * 100;
    const isCrisis = percentage < 30;

    return (
        <div className="w-full h-6 bg-slate-900 border-2 border-black rounded-full overflow-hidden relative shadow-[0_4px_0_0_rgba(0,0,0,0.5)]">
            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 z-10 pointer-events-none" />

            <motion.div
                className={`h-full ${isCrisis ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-blue-600"}`}
                animate={{ width: `${percentage}%` }}
                transition={{ type: "tween", ease: "linear", duration: 0.1 }}
            />

            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none mix-blend-overlay" />
        </div>
    );
}

// --- Fire Background for High Streaks ---
export function FireBackground({ intensity }: { intensity: number }) {
    if (intensity < 5) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-600/50 to-transparent" />
        </motion.div>
    );
}
