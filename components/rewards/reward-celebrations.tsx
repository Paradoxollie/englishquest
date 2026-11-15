"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { BadgeMedal } from "@/components/rewards/badge-medal";
import { getBadgeDefinition } from "@/lib/profile/badges";
import { REWARD_EVENT, normalizeRewardDetail, type RewardBadge } from "@/lib/profile/reward-events";

/*
 * Célébrations des récompenses, montées une fois dans app/layout.tsx.
 * Écoute l'événement « eq:reward » (lib/profile/reward-events.ts) :
 * - XP et or : petite notification, en bas à droite sur ordinateur, en bas sur téléphone ;
 * - badges et étoiles : notification dédiée ;
 * - passage de niveau : fenêtre centrée avec un bouton « Continuer ».
 * Les notifications disparaissent après 4 secondes (pause au survol).
 */

const TOAST_MS = 4000;
const MAX_TOASTS = 4;

type ToastContent =
  | { kind: "gain"; title: string; text: string }
  | { kind: "badge"; badges: RewardBadge[] }
  | { kind: "star"; count: number };

type Toast = ToastContent & { id: number };

function gainTitle(xp: number, gold: number) {
  return [xp > 0 ? `+ ${xp} XP` : null, gold > 0 ? `+ ${gold} or` : null].filter(Boolean).join(" · ");
}

function ToastBody({ toast }: { toast: Toast }) {
  if (toast.kind === "gain") {
    return (
      <>
        <span className="eq-reward-toast-icon is-gain" aria-hidden="true">
          XP
        </span>
        <span className="eq-reward-toast-text">
          <b>{toast.title}</b>
          <small>{toast.text}</small>
        </span>
      </>
    );
  }
  if (toast.kind === "star") {
    return (
      <>
        <span className="eq-reward-toast-icon is-star" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8z" />
          </svg>
        </span>
        <span className="eq-reward-toast-text">
          <b>{toast.count > 1 ? `${toast.count} étoiles gagnées` : "Étoile gagnée"}</b>
          <small>Retrouve-les sur la carte de l&apos;aventure.</small>
        </span>
      </>
    );
  }
  const first = toast.badges[0];
  const definition = first ? getBadgeDefinition(first.key) : null;
  return (
    <>
      <BadgeMedal tier={first?.tier ?? definition?.tier ?? "bronze"} category={definition?.category ?? "mission"} size={40} />
      <span className="eq-reward-toast-text">
        <small>{toast.badges.length > 1 ? `${toast.badges.length} badges débloqués` : "Badge débloqué"}</small>
        <b>{toast.badges.map((badge) => badge.name).join(", ")}</b>
      </span>
    </>
  );
}

export function RewardCelebrations() {
  const reduceMotion = useReducedMotion();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [level, setLevel] = useState<number | null>(null);
  const timersRef = useRef(new Map<number, number>());
  const nextIdRef = useRef(1);
  const continueRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) window.clearTimeout(timer);
    timersRef.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const startTimer = useCallback(
    (id: number) => {
      const previous = timersRef.current.get(id);
      if (previous) window.clearTimeout(previous);
      timersRef.current.set(id, window.setTimeout(() => dismiss(id), TOAST_MS));
    },
    [dismiss]
  );

  const pauseTimer = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) window.clearTimeout(timer);
    timersRef.current.delete(id);
  }, []);

  const push = useCallback(
    (content: ToastContent) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      setToasts((list) => {
        const next = [...list, { ...content, id } as Toast];
        // Trop de notifications d'un coup : les plus anciennes partent.
        for (const dropped of next.slice(0, Math.max(0, next.length - MAX_TOASTS))) {
          const timer = timersRef.current.get(dropped.id);
          if (timer) window.clearTimeout(timer);
          timersRef.current.delete(dropped.id);
        }
        return next.slice(-MAX_TOASTS);
      });
      startTimer(id);
    },
    [startTimer]
  );

  useEffect(() => {
    const onReward = (event: Event) => {
      const detail = normalizeRewardDetail((event as CustomEvent<unknown>).detail);
      if (detail.xp > 0 || detail.gold > 0) {
        push({ kind: "gain", title: gainTitle(detail.xp, detail.gold), text: detail.label ?? "Récompense reçue" });
      }
      if (detail.stars > 0) push({ kind: "star", count: detail.stars });
      if (detail.badges.length > 0) push({ kind: "badge", badges: detail.badges });
      if (detail.newLevel) {
        const reached = detail.newLevel;
        setLevel((current) => Math.max(current ?? 0, reached));
      }
    };
    window.addEventListener(REWARD_EVENT, onReward);
    return () => window.removeEventListener(REWARD_EVENT, onReward);
  }, [push]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const isOpen = level !== null;

  /* Fenêtre de niveau : focus sur « Continuer », Échap ferme, retour du focus ensuite. */
  useEffect(() => {
    if (!isOpen) return;
    if (!returnFocusRef.current && document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement;
    }
    const frame = window.requestAnimationFrame(() => continueRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLevel(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target && target.isConnected) target.focus();
  }, [isOpen]);

  // Un seul élément focalisable dans la fenêtre : Tab y reste.
  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      continueRef.current?.focus();
    }
  };

  const toastMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 16, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { type: "spring" as const, stiffness: 420, damping: 32 },
      };

  return (
    <>
      <div className="eq-reward-toasts" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout={!reduceMotion}
              className={`eq-reward-toast is-${toast.kind}`}
              onMouseEnter={() => pauseTimer(toast.id)}
              onMouseLeave={() => startTimer(toast.id)}
              onFocus={() => pauseTimer(toast.id)}
              onBlur={() => startTimer(toast.id)}
              {...toastMotion}
            >
              <ToastBody toast={toast} />
              <button type="button" className="eq-reward-toast-close" onClick={() => dismiss(toast.id)} aria-label="Fermer la notification">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="levelup"
            className="eq-levelup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setLevel(null);
            }}
          >
            <motion.div
              className="eq-levelup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="eq-levelup-title"
              aria-describedby="eq-levelup-text"
              onKeyDown={trapFocus}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22 }}
            >
              <motion.span
                className="eq-levelup-ring"
                aria-hidden="true"
                initial={reduceMotion ? false : { rotate: -120, scale: 0.4 }}
                animate={reduceMotion ? undefined : { rotate: 0, scale: [0.4, 1.15, 1] }}
                transition={reduceMotion ? undefined : { duration: 0.7, ease: "easeOut", delay: 0.1 }}
              >
                {level}
              </motion.span>
              <p className="eq-kicker">Nouveau niveau</p>
              <h2 id="eq-levelup-title" className="eq-h2">
                Niveau {level} atteint
              </h2>
              <p id="eq-levelup-text" className="eq-levelup-text">
                Tu passes un cap. Certains objets de la boutique ne s&apos;ouvrent qu&apos;à partir d&apos;un niveau : va voir ce
                qui t&apos;attend.
              </p>
              <button ref={continueRef} type="button" className="eq-btn eq-btn-gold eq-btn-lg" onClick={() => setLevel(null)}>
                Continuer
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
