"use client";
import { recordClassHits } from "@/components/classes/live-activity-events";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

/* Lexicon Blaster (Space Lex) : shooter lexical. Le moteur pur est dans lib/games/spaceLexShooter. */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSoundEffect } from "@/lib/games/audio";
import { submitLexiconBlasterScore } from "./actions";
import {
  type EnemyWord,
  type GameState,
  type PowerUpType,
  createGameState,
  startGame,
  resumeGame,
  resetGame,
  moveShip,
  setShipTarget,
  updateShipPosition,
  fireBullet,
  updateEnemies,
  updateBullets,
  checkCollisions,
  checkEnemiesReachedBottom,
  spawnEnemiesIfNeeded,
  updateLevel,
  updateExplosions,
  updateFeedbackMessages,
  updateWaveLifecycle,
  getMissionExample,
  spawnPowerUpIfNeeded,
  updatePowerUps,
  collectPowerUp,
  updateActivePowerUps,
  activateSuper,
  updateSuperState,
  advanceDialogue,
  closeDialogue,
} from "@/lib/games/spaceLexShooter";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";
import {
  GameEnd,
  GameHud,
  GameStart,
  HudStat,
  SpeakButton,
  TimeBar,
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

function SpaceShip({
  x,
  isRunning,
  skinImageUrl,
}: {
  x: number;
  isRunning: boolean;
  skinImageUrl?: string | null;
}) {
  return (
    <div
      className="eq-space-ship-anchor"
      style={{ left: `${x * 100}%`, bottom: "3.5%" }}
      aria-hidden="true"
    >
      <motion.div
        className="eq-space-ship-body"
        animate={isRunning ? { y: [0, -3, 0] } : { y: 0 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {skinImageUrl ? (
          <img
            src={addCacheBustingIfSupabase(skinImageUrl)}
            alt=""
            width={76}
            height={92}
            className="eq-space-ship-img"
          />
        ) : (
          <svg
            width="76"
            height="92"
            viewBox="0 0 80 100"
            className="eq-space-ship-svg"
          >
            <defs>
              <linearGradient id="redMain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="55%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="redDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
              <linearGradient id="goldMain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="blueGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.85" />
              </radialGradient>
              <linearGradient id="thrustGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#ff8800" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            <rect x="30" y="20" width="20" height="60" fill="url(#redMain)" />
            <rect x="32" y="22" width="16" height="56" fill="url(#redDark)" />
            <rect x="36" y="20" width="8" height="60" fill="url(#goldMain)" />
            <rect x="38" y="22" width="4" height="56" fill="url(#goldDark)" />
            <polygon points="40,8 46,20 34,20" fill="url(#goldMain)" />
            <polygon points="40,12 43,20 37,20" fill="url(#goldDark)" />
            <ellipse cx="40" cy="35" rx="10" ry="14" fill="#1e293b" />
            <ellipse cx="40" cy="35" rx="8" ry="12" fill="#334155" />
            <ellipse cx="40" cy="35" rx="10" ry="14" fill="none" stroke="url(#goldMain)" strokeWidth="2" />
            <ellipse cx="38" cy="32" rx="3" ry="4" fill="#93c5fd" opacity="0.4" />
            <polygon points="20,45 10,65 20,70 30,50" fill="url(#redMain)" />
            <polygon points="60,45 70,65 60,70 50,50" fill="url(#redMain)" />
            <polygon points="20,45 10,65 12,66 22,46" fill="url(#goldMain)" />
            <polygon points="60,45 70,65 68,66 58,46" fill="url(#goldMain)" />
            <rect x="22" y="48" width="6" height="18" fill="url(#goldDark)" />
            <rect x="52" y="48" width="6" height="18" fill="url(#goldDark)" />
            <circle cx="25" cy="55" r="6" fill="url(#blueGlow)" />
            <circle cx="55" cy="55" r="6" fill="url(#blueGlow)" />
            <circle cx="25" cy="55" r="2.2" fill="#bfdbfe" />
            <circle cx="55" cy="55" r="2.2" fill="#bfdbfe" />
            <circle cx="30" cy="75" r="5" fill="#1f2937" />
            <circle cx="50" cy="75" r="5" fill="#1f2937" />
            <polygon points="30,80 25,95 30,90 35,95" fill="url(#redMain)" />
            <polygon points="50,80 45,95 50,90 55,95" fill="url(#redMain)" />
            {isRunning && (
              <>
                <ellipse cx="30" cy="86" rx="4" ry="10" fill="url(#thrustGradient)" opacity="0.95">
                  <animate attributeName="ry" values="9;14;9" dur="0.24s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="50" cy="86" rx="4" ry="10" fill="url(#thrustGradient)" opacity="0.95">
                  <animate attributeName="ry" values="9;14;9" dur="0.24s" repeatCount="indefinite" />
                </ellipse>
              </>
            )}
          </svg>
        )}
      </motion.div>
    </div>
  );
}

function PowerUpGlyph({ type }: { type: PowerUpType }) {
  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M12 3l7 3v5c0 4.5-3 8.3-7 9.7C8 19.3 5 15.5 5 11V6l7-3z"
          fill="currentColor"
          opacity="0.22"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (type === "slowmo") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5L4.9 17.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === "extra_life") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M12 20s-7-4.5-8.5-9A4.6 4.6 0 0 1 12 6.8 4.6 4.6 0 0 1 20.5 11C19 15.5 12 20 12 20z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
    </svg>
  );
}

function powerUpLabel(type: PowerUpType): string {
  switch (type) {
    case "double_xp":
      return "2x Points";
    case "extra_life":
      return "+1 Vie";
    case "shield":
      return "Bouclier";
    case "slowmo":
      return "Ralenti";
  }
}

export function SpaceLexGame({
  isLoggedIn,
  missionTarget,
  initialShipSkinImageUrl,
  suggestedLevel,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  initialShipSkinImageUrl?: string | null;
  suggestedLevel: GameLevel | null;
}) {
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [shipSkinImageUrl, setShipSkinImageUrl] = useState<string | null>(
    initialShipSkinImageUrl ?? null
  );
  const [isPaused, setIsPaused] = useState(false);
  const [autoFire, setAutoFire] = useState(false);
  const [backgroundFlash, setBackgroundFlash] = useState<"green" | "red" | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [comboBurst, setComboBurst] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scoreResult, setScoreResult] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const gameStateRef = useRef<GameState | null>(null);
  const isPausedRef = useRef(false);
  const autoFireRef = useRef(false);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const pointerDownRef = useRef(false);
  const startedAtRef = useRef<number>(0);
  const scoreSubmittedRef = useRef<boolean>(false);
  const sessionRef = useRef(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const wordWidthsRef = useRef(new Map<string, number>());
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endSfxSessionRef = useRef<number>(-1);
  const gameSession = useGameSession("space-lex", isLoggedIn);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    autoFireRef.current = autoFire;
  }, [autoFire]);

  useGameFocusMode(Boolean(gameState?.isRunning && !gameState.gameOver));

  // Measure on a new word or resize. The whole label stays on screen and a
  // tap on either end of a long expression uses the same width as the target.
  const visibleWordIds = gameState?.enemies.map(enemy => enemy.id).join(",");
  useEffect(() => {
    const stage = gameAreaRef.current;
    if (!stage || !visibleWordIds) {
      wordWidthsRef.current.clear();
      return;
    }
    const labels = Array.from(stage.querySelectorAll<HTMLElement>("[data-enemy-id]"));
    const measure = () => {
      if (!stage.clientWidth) return;
      wordWidthsRef.current = new Map(labels.map(label => [
        label.dataset.enemyId!, label.offsetWidth / stage.clientWidth,
      ]));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    labels.forEach(label => observer.observe(label));
    return () => observer.disconnect();
  }, [visibleWordIds]);

  // Load ship skin only when not injected by server page
  useEffect(() => {
    if (initialShipSkinImageUrl !== undefined) {
      return;
    }
    let cancelled = false;
    async function loadShipSkin() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: equippedItems } = await supabase
          .from("user_equipped_items")
          .select("equipped_ship_skin_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (equippedItems?.equipped_ship_skin_id) {
          const { data: skin } = await supabase
            .from("shop_items")
            .select("image_url")
            .eq("id", equippedItems.equipped_ship_skin_id)
            .eq("is_active", true)
            .maybeSingle();

          if (!cancelled && skin?.image_url) {
            setShipSkinImageUrl(skin.image_url);
            return;
          }
        }
      }

      const { data: defaultSkin } = await supabase
        .from("shop_items")
        .select("image_url")
        .eq("item_type", "ship_skin")
        .eq("is_active", true)
        .eq("is_public", true)
        .eq("price_gold", 0)
        .eq("required_level", 1)
        .order("display_order")
        .limit(1)
        .maybeSingle();

      if (!cancelled && defaultSkin?.image_url) {
        setShipSkinImageUrl(defaultSkin.image_url);
      }
    }
    loadShipSkin();
    return () => {
      cancelled = true;
    };
  }, [initialShipSkinImageUrl]);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(
        window.innerWidth < 768 ||
          (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches)
      );
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const initial = createGameState(suggestedLevel ?? DEFAULT_GAME_LEVEL);
    gameStateRef.current = initial;
    setGameState(initial);
  }, [suggestedLevel]);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!gameState?.gameOver) return;
    if (endSfxSessionRef.current === sessionRef.current) return;
    endSfxSessionRef.current = sessionRef.current;
    playSoundEffect(gameState.score > 0 ? "victory" : "wrong");
  }, [gameState?.gameOver, gameState?.score]);

  const triggerFlash = useCallback((color: "green" | "red") => {
    setBackgroundFlash(color);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setBackgroundFlash(null), 260);
  }, []);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => setScreenShake(false), 300);
  }, []);

  const triggerComboBurst = useCallback(() => {
    setComboBurst(true);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setComboBurst(false), 700);
  }, []);

  const applyManualShot = useCallback(() => {
    const current = gameStateRef.current;
    if (!current || !current.isRunning || current.gameOver || isPausedRef.current) return;
    if (current.currentDialogue || current.waveStatus !== "playing") return;
    const fired = fireBullet(current, 240);
    if (fired !== current) {
      gameStateRef.current = fired;
      setGameState(fired);
      playSoundEffect("tick");
    }
  }, []);

  const handleActivateSuper = useCallback(() => {
    const current = gameStateRef.current;
    if (
      !current ||
      current.superBar < 100 ||
      !current.isRunning ||
      current.gameOver ||
      isPausedRef.current
    ) {
      return;
    }
    const next = activateSuper(current);
    gameStateRef.current = next;
    setGameState(next);
    playSoundEffect("combo");
    triggerShake();
  }, [triggerShake]);

  const stepSimulation = useCallback(
    (deltaMs: number) => {
      const current = gameStateRef.current;
      if (!current || !current.isRunning || current.gameOver || isPausedRef.current) {
        return;
      }

      const clampedDelta = Math.max(4, Math.min(80, deltaMs));
      const prevWaveStatus = current.waveStatus;
      const hadDialogue = Boolean(current.currentDialogue);
      const prevScore = current.score;
      const prevLives = current.lives;
      const prevCombo = current.comboCount;
      const prevSuperBar = current.superBar;

      // Freeze physics while dialogue banner is shown
      let next = current;
      if (next.currentDialogue) {
        next = updateSuperState(next);
        next = updateWaveLifecycle(next);
        gameStateRef.current = next;
        if (next !== current) {
          setGameState(next);
        }
        return;
      }

      next = updateSuperState(next);
      next = updateWaveLifecycle(next);
      next = updateActivePowerUps(next);

      if (next.waveStatus === "playing") {
        const keys = keysPressedRef.current;
        if (keys.has("left") && !keys.has("right")) {
          next = moveShip(next, "left");
        } else if (keys.has("right") && !keys.has("left")) {
          next = moveShip(next, "right");
        } else {
          next = moveShip(next, "stop");
        }
        next = updateShipPosition(next, clampedDelta);

        if (autoFireRef.current) {
          next = fireBullet(next, 360);
        } else if (pointerDownRef.current || keys.has("fire")) {
          next = fireBullet(next, 240);
        }

        next = spawnPowerUpIfNeeded(next);
        next = updatePowerUps(next, clampedDelta);
        next = collectPowerUp(next);
        next = updateBullets(next, clampedDelta);
        next = updateEnemies(next, clampedDelta, wordWidthsRef.current);
        const beforeHits = next.enemies;
        next = checkCollisions(next, next.mission, wordWidthsRef.current);
        recordClassHits(beforeHits, next.enemies);
        next = checkEnemiesReachedBottom(next, next.mission);
        next = spawnEnemiesIfNeeded(next, next.mission);
        next = updateLevel(next);
        next = updateExplosions(next, clampedDelta);
        next = updateFeedbackMessages(next, clampedDelta);
      }

      // Trigger audio & visual feedback outside state updater functions
      if (next.lives < prevLives) {
        playSoundEffect("wrong");
        triggerFlash("red");
        triggerShake();
      } else if (next.score > prevScore) {
        playSoundEffect("correct");
        triggerFlash("green");
        if (next.comboCount > prevCombo && next.comboCount >= 3) {
          triggerComboBurst();
          playSoundEffect("combo");
        }
      }

      if (next.waveStatus === "cleared" && prevWaveStatus !== "cleared") {
        playSoundEffect("victory");
      }
      if (next.waveNumber > current.waveNumber && next.waveStatus === "playing") {
        playSoundEffect("tick");
      }
      if (next.superBar >= 100 && prevSuperBar < 100) {
        playSoundEffect("combo");
      }
      if (next.currentDialogue && !hadDialogue) {
        playSoundEffect("tick");
      }

      gameStateRef.current = next;
      setGameState(next);
    },
    [triggerComboBurst, triggerFlash, triggerShake]
  );

  // Start / replay helpers
  const handleStartGame = useCallback(() => {
    sessionRef.current += 1;
    gameSession.begin();
    const newState = startGame(createGameState(level));
    gameStateRef.current = newState;
    setGameState(newState);
    setIsPaused(false);
    isPausedRef.current = false;
    keysPressedRef.current = new Set();
    pointerDownRef.current = false;
    pausedAtRef.current = 0;
    lastUpdateRef.current = Date.now();
    startedAtRef.current = performance.now();
    scoreSubmittedRef.current = false;
    setScoreResult(null);
    setRewardError(null);
    setSubmitStatus("idle");
  }, [gameSession, level]);

  const handlePauseToggle = useCallback(() => {
    const current = gameStateRef.current;
    if (!current?.isRunning || current.gameOver) return;
    keysPressedRef.current = new Set();
    pointerDownRef.current = false;
    if (isPausedRef.current) {
      const elapsed = pausedAtRef.current > 0 ? Date.now() - pausedAtRef.current : 0;
      const resumed = resumeGame(current, elapsed);
      gameStateRef.current = resumed;
      setGameState(resumed);
      pausedAtRef.current = 0;
      isPausedRef.current = false;
      setIsPaused(false);
      lastUpdateRef.current = Date.now();
    } else {
      pausedAtRef.current = Date.now();
      const pausedState = { ...current, shipVelocity: 0 };
      gameStateRef.current = pausedState;
      setGameState(pausedState);
      isPausedRef.current = true;
      setIsPaused(true);
    }
  }, []);

  const handleResetToSetup = useCallback(() => {
    sessionRef.current += 1;
    gameSession.cancel();
    const fresh = resetGame(createGameState(level));
    gameStateRef.current = fresh;
    setGameState(fresh);
    setIsPaused(false);
    isPausedRef.current = false;
    keysPressedRef.current = new Set();
    pointerDownRef.current = false;
    pausedAtRef.current = 0;
    startedAtRef.current = performance.now();
    scoreSubmittedRef.current = false;
    setScoreResult(null);
    setRewardError(null);
    setSubmitStatus("idle");
  }, [gameSession, level]);

  // Keyboard listener (QWERTY + AZERTY + Dialogue Space + Pause + EMP Super)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = gameStateRef.current;
      if (!current?.isRunning || current.gameOver) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handlePauseToggle();
        return;
      }

      if (isPausedRef.current) return;

      const lower = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || lower === "a" || lower === "q") {
        e.preventDefault();
        keysPressedRef.current.add("left");
      } else if (e.key === "ArrowRight" || lower === "d") {
        e.preventDefault();
        keysPressedRef.current.add("right");
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (current.currentDialogue) {
          if (!e.repeat) {
            const next = advanceDialogue(current);
            gameStateRef.current = next;
            setGameState(next);
          }
          return;
        }
        keysPressedRef.current.add("fire");
        if (!e.repeat) {
          applyManualShot();
        }
      } else if (lower === "e") {
        e.preventDefault();
        if (current.superBar >= 100 && !e.repeat) {
          handleActivateSuper();
        }
      } else if (e.key === "Enter") {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== "BUTTON" && current.currentDialogue) {
          e.preventDefault();
          const next = advanceDialogue(current);
          gameStateRef.current = next;
          setGameState(next);
        } else if (activeTag !== "BUTTON" && current.superBar >= 100) {
          e.preventDefault();
          handleActivateSuper();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const lower = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || lower === "a" || lower === "q") {
        keysPressedRef.current.delete("left");
      } else if (e.key === "ArrowRight" || lower === "d") {
        keysPressedRef.current.delete("right");
      } else if (e.key === " " || e.code === "Space") {
        keysPressedRef.current.delete("fire");
      }
    };

    const clearKeys = () => {
      keysPressedRef.current = new Set();
      pointerDownRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, [applyManualShot, handleActivateSuper, handlePauseToggle]);

  // Animation loop
  useEffect(() => {
    if (!gameState?.isRunning || gameState.gameOver || isPaused) {
      return;
    }

    lastUpdateRef.current = Date.now();
    let frameId = 0;
    const loop = () => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;
      stepSimulation(delta);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState?.isRunning, gameState?.gameOver, isPaused, stepSimulation]);

  // Deterministic audit hooks : uniquement hors production (ils révèlent les cibles et accélèrent le jeu).
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    window.advanceTime = (ms: number) => {
      const steps = Math.max(1, Math.round(ms / 16));
      const dt = ms / steps;
      for (let i = 0; i < steps; i++) {
        stepSimulation(dt);
      }
    };

    window.render_game_to_text = () => {
      const s = gameStateRef.current;
      return JSON.stringify({
        running: Boolean(s?.isRunning),
        paused: isPausedRef.current,
        gameOver: Boolean(s?.gameOver),
        score: s?.score ?? 0,
        wave: s?.waveNumber ?? 0,
        waveStatus: s?.waveStatus ?? "idle",
        lives: s?.lives ?? 0,
        shipX: Number((s?.shipX ?? 0.5).toFixed(3)),
        bulletsCount: s?.bullets.length ?? 0,
        enemies: (s?.enemies ?? []).map((e) => ({
          word: e.text,
          x: Number(e.x.toFixed(3)),
          y: Number(e.y.toFixed(3)),
          isTarget: e.isTarget,
        })),
        mission: s?.mission?.label ?? "",
        dialogueOpen: Boolean(s?.currentDialogue),
      });
    };

    return () => {
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [stepSimulation]);

  // Submit score when game ends
  useEffect(() => {
    if (!gameState?.gameOver || scoreSubmittedRef.current) return;
    scoreSubmittedRef.current = true;

    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }

    setSubmitStatus("saving");
    setRewardError(null);
    const currentSession = sessionRef.current;

    gameSession
      .finish(performance.now() - startedAtRef.current)
      .then(({ sessionId, durationMs, save }) =>
        save(() => submitLexiconBlasterScore({
          score: gameState.score,
          wave: gameState.waveNumber,
          maxCombo: gameState.maxCombo,
          wordsMastered: gameState.learnedWords.length,
          wordsMissed: gameState.missedWords.length,
          durationMs,
          sessionId,
        }))
      )
      .then((res) => {
        if (currentSession !== sessionRef.current) return;
        if (!res.success) {
          setSubmitStatus("error");
          setRewardError(res.error ?? "Impossible d'enregistrer ce score.");
          return;
        }
        setRewardsFromResponse(res);
      })
      .catch(() => {
        if (currentSession !== sessionRef.current) return;
        setSubmitStatus("error");
        setRewardError("Erreur réseau lors de l'enregistrement du score.");
      });

    function setRewardsFromResponse(res: Awaited<ReturnType<typeof submitLexiconBlasterScore>>) {
      setScoreResult(mapScoreResultToRewards(res));
      setSubmitStatus("saved");
    }
  }, [gameSession, gameState, isLoggedIn]);

  const handleStagePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const current = gameStateRef.current;
    if (!current?.isRunning || current.gameOver || isPausedRef.current) return;
    if (current.currentDialogue) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const updated = setShipTarget(current, ratio);
    gameStateRef.current = updated;
    setGameState(updated);
  }, []);

  const handleStagePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.target instanceof Element && e.target.closest("button")) return;
      const current = gameStateRef.current;
      if (!current?.isRunning || current.gameOver || isPausedRef.current) return;
      if (current.currentDialogue) {
        const next = advanceDialogue(current);
        gameStateRef.current = next;
        setGameState(next);
        return;
      }
      if (current.waveStatus !== "playing") return;
      pointerDownRef.current = true;
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const ratio = (e.clientX - rect.left) / rect.width;
        const aimed = setShipTarget(current, ratio);
        gameStateRef.current = aimed;
      }
      applyManualShot();
    },
    [applyManualShot]
  );

  const handleStagePointerUp = useCallback(() => {
    pointerDownRef.current = false;
  }, []);

  if (!gameState) {
    return (
      <div className="eq-game-screen">
        <p className="eq-game-sub">Préparation du vaisseau...</p>
      </div>
    );
  }

  // Start screen
  if (!gameState.isRunning && !gameState.gameOver) {
    return (
      <GameStart
        title="Lexicon Blaster"
        intro="Des vagues de mots descendent vers ton secteur. Détruis uniquement les cibles qui correspondent à la mission en cours."
        startLabel="Décoller"
        onStart={handleStartGame}
        rules={[
          isMobile ? "Glisse sur l’aire de jeu ou maintiens les flèches pour déplacer le vaisseau." : "Déplace-toi avec la souris, les flèches ou les touches Q et D.",
          isMobile ? "Touche une cible pour te diriger vers elle et tirer, ou utilise le bouton Tirer." : "Clique ou appuie sur Espace pour tirer. Tu peux aussi activer le tir automatique.",
          "Suis la consigne de la vague. Une cible que tu laisses passer peut revenir quelques mots plus tard.",
          missionTarget
            ? `Objectif de mission : ${missionTarget.toLocaleString("fr-FR")} points.`
            : isMobile ? "À pleine charge, touche EMP pour éliminer les distracteurs." : "À pleine charge, appuie sur E ou sur le bouton EMP pour éliminer les distracteurs.",
        ]}
      >
        <LevelPicker
          value={level}
          onChange={(next) => {
            setLevel(next);
            const fresh = createGameState(next);
            gameStateRef.current = fresh;
            setGameState(fresh);
          }}
          suggested={suggestedLevel}
        />
        <div className="eq-space-setup-note">
          <span>Départ niveau {getGameLevelLabel(level)}</span>
          {level <= 2 ? (
            <span>Missions guidées en français • Zéro connecteurs pièges</span>
          ) : (
            <span>Missions en anglais • Boss toutes les 5 vagues</span>
          )}
        </div>
      </GameStart>
    );
  }

  // End screen
  if (gameState.gameOver) {
    const learnedUnique = gameState.learnedWords;
    const missedUnique = gameState.missedWords;

    return (
      <GameEnd
        gameSlug="space-lex"
        title={gameState.lives <= 0 ? "Vaisseau neutralisé" : "Mission terminée"}
        score={gameState.score.toLocaleString("fr-FR")}
        scoreLabel="points"
        lines={[
          `Vague atteinte : ${gameState.waveNumber}`,
          `${learnedUnique.length} ${learnedUnique.length > 1 ? "mots différents reconnus" : "mot reconnu"}`,
          `Meilleur combo : ${gameState.maxCombo}x • Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={scoreResult}
        rewardStatus={submitStatus}
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={missionTarget !== null ? gameState.score >= missionTarget : null}
        onReplay={handleStartGame}
      >
        {(learnedUnique.length > 0 || missedUnique.length > 0) && (
          <div className="eq-space-review-grid">
            {learnedUnique.length > 0 && (
              <div>
                <p className="eq-kicker">Cibles validées ({learnedUnique.length})</p>
                <div className="eq-game-review-scroll">
                  <ul className="eq-game-review">
                    {learnedUnique.map((word) => (
                      <li key={word}>
                        <div>
                          <b>{word}</b>
                        </div>
                        <SpeakButton text={word} label="Audio" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {missedUnique.length > 0 && (
              <div>
                <p className="eq-kicker">Mots à revoir ({missedUnique.length})</p>
                <div className="eq-game-review-scroll">
                  <ul className="eq-game-review">
                    {missedUnique.map((word) => (
                      <li key={word} className="is-hard">
                        <div>
                          <b>{word}</b>
                        </div>
                        <SpeakButton text={word} label="Audio" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={handleResetToSetup}>
            Changer de niveau
          </button>
        </div>
      </GameEnd>
    );
  }

  const livesLeft = Math.max(0, gameState.lives);
  const livesDisplay = `${"♥".repeat(livesLeft)}${"♡".repeat(Math.max(0, 3 - livesLeft))}`;
  const wavePct =
    gameState.waveTarget > 0
      ? Math.min(100, Math.round((gameState.waveProgress / gameState.waveTarget) * 100))
      : 0;
  const superReady = gameState.superBar >= 100;
  const bossPct = gameState.boss
    ? Math.max(0, Math.round((gameState.boss.hp / gameState.boss.maxHp) * 100))
    : 0;
  const example = getMissionExample(gameState.mission);
  const currentDialogueLine =
    gameState.currentDialogue?.lines[gameState.dialogueIndex] ?? null;

  return (
    <div className="eq-game-play eq-space">
      <GameHud onQuit={handleResetToSetup}>
        <HudStat label="Score" value={gameState.score.toLocaleString("fr-FR")} tone="gold" />
        <HudStat label="Vague" value={`#${gameState.waveNumber}`} tone="cyan" />
        <HudStat label="Vies" value={livesDisplay} tone={livesLeft <= 1 ? "coral" : "mint"} />
        <HudStat
          label="Combo"
          value={gameState.comboCount > 1 ? `${gameState.comboCount}x` : "—"}
          tone={comboBurst ? "gold" : "default"}
        />
      </GameHud>

      {/* Compact Mission & Super Strip above the Arena */}
      <div className="eq-space-mission-strip">
        <div className="eq-space-mission-main">
          <span className="eq-space-mission-kicker">
            Vague {gameState.waveNumber}
            {gameState.mission?.type === "BOSS" ? " • BOSS" : ""}
          </span>
          <strong className="eq-space-mission-title">
            {gameState.mission?.label ?? "Préparation de mission"}
          </strong>
          {example && <span className="eq-space-mission-kicker" data-testid="mission-example">Exemple de cible · <b lang="en">{example}</b></span>}
          <div className="eq-space-wave-progress">
            <span>
              {gameState.waveProgress}/{gameState.waveTarget} cibles
            </span>
            <TimeBar percent={wavePct} />
          </div>
        </div>

        <button
          type="button"
          className={`eq-space-super-btn ${superReady ? "is-ready" : ""}`}
          disabled={!superReady}
          onClick={handleActivateSuper}
          title={
            superReady
              ? (isMobile ? "Déclencher l’onde EMP" : "Déclencher l’onde EMP (touche E)")
              : "Charge l'EMP en détruisant les cibles"
          }
        >
          <span className="eq-space-super-head">
            <span>EMP Super</span>
            <strong>{superReady ? "PRÊT (E)" : `${Math.round(gameState.superBar)}%`}</strong>
          </span>
          <span className="eq-space-super-track" aria-hidden="true">
            <span
              className="eq-space-super-fill"
              style={{ width: `${Math.min(100, gameState.superBar)}%` }}
            />
          </span>
        </button>
      </div>

      {/* Main Arena */}
      <motion.div
        ref={gameAreaRef}
        data-testid="space-stage"
        className={`eq-space-stage ${
          backgroundFlash === "green"
            ? "is-flash-green"
            : backgroundFlash === "red"
              ? "is-flash-red"
              : ""
        }`}
        animate={screenShake ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.28 }}
        onPointerMove={handleStagePointerMove}
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        onPointerLeave={handleStagePointerUp}
      >
        <div className="eq-space-grid" aria-hidden="true" />
        <div className="eq-space-stars" aria-hidden="true" />

        {/* Single consolidated Top HUD row inside the arena: zero overlaps */}
        <div className="eq-space-topbar">
          <div className="eq-space-powerup-row">
            {gameState.hasShield && (
              <span className="eq-space-pill is-shield">
                <PowerUpGlyph type="shield" />
                <span>Bouclier actif</span>
              </span>
            )}
            {gameState.activePowerUps.map((p) => {
              const sec = Math.max(0, Math.ceil((p.endTime - Date.now()) / 1000));
              return (
                <span key={p.type} className={`eq-space-pill is-${p.type}`}>
                  <PowerUpGlyph type={p.type} />
                  <span>{powerUpLabel(p.type)}</span>
                  <b>{sec}s</b>
                </span>
              );
            })}
            {gameState.superActive && (
              <span className="eq-space-pill is-emp">
                <strong>ONDE EMP ACTIVE</strong>
              </span>
            )}
          </div>

          {gameState.boss && (
            <div className="eq-space-boss-bar">
              <div className="eq-space-boss-meta">
                <span>{gameState.boss.name}</span>
                <strong>
                  {gameState.boss.hp}/{gameState.boss.maxHp} PV
                </strong>
              </div>
              <div className="eq-space-boss-track">
                <div className="eq-space-boss-fill" style={{ width: `${bossPct}%` }} />
              </div>
            </div>
          )}

          {gameState.upcomingEnemy && gameState.waveStatus === "playing" && (
            <div className="eq-space-preview" aria-label="Prochain mot">
              <span>Prochain</span>
              <strong>{gameState.upcomingEnemy.text}</strong>
            </div>
          )}
        </div>

        {/* EMP shockwave overlay */}
        {gameState.superActive && <div className="eq-space-emp-ring" aria-hidden="true" />}

        {/* Word Targets / Distractors */}
        {gameState.enemies.map((enemy: EnemyWord) => (
          <div
            key={enemy.id}
            data-enemy-id={enemy.id}
            className="eq-space-word-anchor"
            style={{
              left: `${enemy.x * 100}%`,
              top: `${enemy.y * 100}%`,
            }}
          >
            <div className="eq-space-word">
              <span>{enemy.text}</span>
            </div>
          </div>
        ))}

        {/* Falling Power-Ups */}
        {gameState.powerups.map((pu) => (
          <div
            key={pu.id}
            className={`eq-space-powerup-anchor is-${pu.type}`}
            style={{ left: `${pu.x * 100}%`, top: `${pu.y * 100}%` }}
            aria-hidden="true"
          >
            <PowerUpGlyph type={pu.type} />
          </div>
        ))}

        {/* Plasma Bullets */}
        {gameState.bullets.map((bullet) => (
          <div
            key={bullet.id}
            className="eq-space-bullet"
            style={{ left: `${bullet.x * 100}%`, top: `${bullet.y * 100}%` }}
            aria-hidden="true"
          />
        ))}

        {/* Explosions */}
        {gameState.explosions.map((exp) => {
          const progress = Math.min(1, exp.life / Math.max(1, exp.maxLife));
          return (
            <div
              key={exp.id}
              className="eq-space-explosion"
              style={{
                left: `${exp.x * 100}%`,
                top: `${exp.y * 100}%`,
                backgroundColor: exp.type === "hit" ? "#34d399" : "#f87171",
                opacity: 1 - progress,
                transform: `translate(-50%, -50%) scale(${0.6 + progress * 1.4})`,
              }}
              aria-hidden="true"
            />
          );
        })}

        {/* Floating Feedback Chips */}
        {gameState.feedbackMessages.map((msg) => {
          const opacity = Math.max(0, 1 - msg.life / Math.max(1, msg.maxLife));
          return (
            <div
              key={msg.id}
              className={`eq-space-feedback-chip ${msg.isCorrect ? "is-success" : "is-error"}`}
              style={{
                left: `${Math.min(82, Math.max(18, msg.x * 100))}%`,
                top: `${Math.min(78, Math.max(18, msg.y * 100))}%`,
                opacity,
              }}
            >
              <span>{msg.text}</span>
              {msg.explanation ? <small> · {msg.explanation}</small> : null}
            </div>
          );
        })}

        {/* Boss Craft */}
        {gameState.boss && (
          <div
            className="eq-space-boss-anchor"
            style={{ left: `${gameState.boss.x * 100}%`, top: "24%" }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 60" width="112" height="68">
              <path
                d="M10,20 L50,8 L90,20 L80,50 L20,50 Z"
                fill="#1e293b"
                stroke="#ef4444"
                strokeWidth="2.5"
              />
              <path d="M30,50 L12,59 L50,54 L88,59 L70,50 Z" fill="#ef4444" />
              <rect x="35" y="23" width="30" height="14" fill="#ef4444" opacity="0.85" rx="3" />
              <circle cx="50" cy="30" r="5" fill="#fef08a" />
            </svg>
          </div>
        )}

        {/* Ship */}
        <SpaceShip
          x={gameState.shipX}
          isRunning={gameState.isRunning && !isPaused}
          skinImageUrl={shipSkinImageUrl}
        />

        {/* Dialogue Briefing Overlay */}
        <AnimatePresence>
          {currentDialogueLine && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="eq-space-overlay"
            >
              <div className="eq-space-overlay-card">
                <p className="eq-kicker">{currentDialogueLine.speaker}</p>
                <p className="eq-space-dialogue-text">{currentDialogueLine.text}</p>
                {example && <p className="eq-space-overlay-sub">{gameState.mission?.label} · <b lang="en">{example}</b></p>}
                {currentDialogueLine.subtitle ? (
                  <p className="eq-space-overlay-sub">{currentDialogueLine.subtitle}</p>
                ) : null}
                <div className="eq-space-overlay-actions">
                  <button
                    type="button"
                    className="eq-btn eq-btn-gold"
                    onClick={() => {
                      const next = advanceDialogue(gameState);
                      gameStateRef.current = next;
                      setGameState(next);
                    }}
                  >
                    {gameState.currentDialogue &&
                    gameState.dialogueIndex + 1 < gameState.currentDialogue.lines.length
                      ? (isMobile ? "Suivant" : "Suivant (Espace)")
                      : (isMobile ? "Commencer" : "Commencer (Espace)")}
                  </button>
                  <button
                    type="button"
                    className="eq-btn eq-btn-ghost"
                    onClick={() => {
                      const next = closeDialogue(gameState);
                      gameStateRef.current = next;
                      setGameState(next);
                    }}
                  >
                    Passer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!currentDialogueLine && (gameState.waveStatus === "intro" || gameState.waveStatus === "boss_intro") && (
          <div className="eq-space-overlay pointer-events-none" role="status">
            <div className="eq-space-overlay-card">
              <p className="eq-kicker">Vague {gameState.waveNumber}</p>
              <p className="eq-space-dialogue-text">{gameState.mission?.label}</p>
              {example && <p className="eq-space-overlay-sub">Une bonne cible est <b lang="en">{example}</b>.</p>}
            </div>
          </div>
        )}

        {/* Wave Cleared Banner */}
        <AnimatePresence>
          {gameState.waveStatus === "cleared" && !currentDialogueLine && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="eq-space-overlay"
            >
              <div className="eq-space-overlay-card">
                <p className="eq-kicker">Vague {gameState.waveNumber} sécurisée</p>
                <p className="eq-space-dialogue-text">
                  Bonus +{gameState.waveNumber * 100} points et +20% EMP !
                </p>
                <p className="eq-space-overlay-sub">Nouvelle mission en approche...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Overlay */}
        {isPaused && (
          <div className="eq-space-overlay">
            <div className="eq-space-overlay-card">
              <p className="eq-kicker">Pause</p>
              <p className="eq-space-overlay-sub">Le vaisseau attend tes ordres.</p>
              <div className="eq-space-overlay-actions">
                <button type="button" className="eq-btn eq-btn-gold" onClick={handlePauseToggle}>
                  Reprendre
                </button>
                <button type="button" className="eq-btn eq-btn-ghost" onClick={handleResetToSetup}>
                  Changer de niveau
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Controls Bar below Stage */}
      <div className="eq-space-controls">
        {isMobile && (
          <div className="eq-space-touch-pad">
            <button
              type="button"
              className="eq-btn eq-btn-ghost"
              onPointerDown={() => {
                keysPressedRef.current.add("left");
              }}
              onPointerUp={() => {
                keysPressedRef.current.delete("left");
              }}
              onPointerLeave={() => {
                keysPressedRef.current.delete("left");
              }}
            >
              ← Gauche
            </button>
            <button type="button" className="eq-btn eq-btn-gold" onClick={applyManualShot}>
              Tirer
            </button>
            <button
              type="button"
              className="eq-btn eq-btn-ghost"
              onPointerDown={() => {
                keysPressedRef.current.add("right");
              }}
              onPointerUp={() => {
                keysPressedRef.current.delete("right");
              }}
              onPointerLeave={() => {
                keysPressedRef.current.delete("right");
              }}
            >
              Droite →
            </button>
          </div>
        )}

        <div className="eq-game-actions">
          <button
            type="button"
            className={`eq-btn ${autoFire ? "eq-btn-gold" : "eq-btn-ghost"}`}
            aria-pressed={autoFire}
            onClick={() => setAutoFire((v) => !v)}
          >
            {autoFire ? "Tir automatique activé" : isMobile ? "Activer le tir automatique" : "Tir manuel (Clic / Espace)"}
          </button>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={handlePauseToggle}>
            {isPaused ? "Reprendre" : isMobile ? "Pause" : "Pause (Échap)"}
          </button>
        </div>
      </div>
    </div>
  );
}
