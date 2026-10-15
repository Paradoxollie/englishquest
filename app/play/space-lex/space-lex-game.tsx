"use client";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

/* Space Lex : shooter lexical. Le moteur est dans lib/games/spaceLexShooter. */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitLexiconBlasterScore } from "./actions";
import {
  type GameState,
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
  spawnPowerUpIfNeeded,
  updatePowerUps,
  collectPowerUp,
  updateActivePowerUps,
  activateSuper,
  updateSuperState,
  advanceDialogue,
  closeDialogue,
  isBeginnerLevel,
} from "@/lib/games/spaceLexShooter";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";
import { GameEnd, GameHud, GameStart, HudStat, type RewardSummary } from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { DEFAULT_GAME_LEVEL, type GameLevel } from "@/lib/games/levels";


// Professional Pixel Art Ship Component based on provided image
function SpaceShip({ x, isRunning, skinImageUrl }: { x: number; isRunning: boolean; skinImageUrl?: string | null }) {
  // Offset to compensate for visual misalignment - shift ship slightly to the left
  const SHIP_OFFSET = -0.04; // -4% of screen width to the left (increased further)
  const adjustedX = Math.max(0, x + SHIP_OFFSET); // Ensure it doesn't go below 0

  return (
    <motion.div
      className="absolute z-25"
      style={{
        left: `${adjustedX * 100}%`,
        bottom: "5%",
        transform: "translateX(-50%)",
        width: "80px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {skinImageUrl ? (
        <img
          src={addCacheBustingIfSupabase(skinImageUrl)}
          alt="Vaisseau"
          width="80"
          height="100"
          className="drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          style={{
            imageRendering: "auto",
            objectFit: "contain",
            objectPosition: "center center",
            width: "80px",
            height: "100px",
            display: "block",
          }}
        />
      ) : (
        <svg
          width="80"
          height="100"
          viewBox="0 0 80 100"
          className="drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          style={{ imageRendering: "pixelated" }}
        >
          <defs>
            {/* Red gradients */}
            <linearGradient id="redMain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="redDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* Gold gradients */}
            <linearGradient id="goldMain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Blue glow */}
            <radialGradient id="blueGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
            </radialGradient>

            {/* Thruster gradient */}
            <linearGradient id="thrustGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6b00" />
              <stop offset="50%" stopColor="#ffaa00" />
              <stop offset="100%" stopColor="#ff8800" />
            </linearGradient>
          </defs>

          {/* Main Fuselage - Red body */}
          <rect x="30" y="20" width="20" height="60" fill="url(#redMain)" />
          <rect x="32" y="22" width="16" height="56" fill="url(#redDark)" />

          {/* Central Gold Spine */}
          <rect x="36" y="20" width="8" height="60" fill="url(#goldMain)" />
          <rect x="38" y="22" width="4" height="56" fill="url(#goldDark)" />

          {/* Nose Cone - Gold */}
          <polygon
            points="40,10 45,20 35,20"
            fill="url(#goldMain)"
          />
          <polygon
            points="40,12 43,20 37,20"
            fill="url(#goldDark)"
          />

          {/* Cockpit - Dark with gold frame */}
          <ellipse
            cx="40"
            cy="35"
            rx="10"
            ry="14"
            fill="#1f2937"
          />
          <ellipse
            cx="40"
            cy="35"
            rx="8"
            ry="12"
            fill="#374151"
          />
          {/* Gold cockpit frame */}
          <ellipse
            cx="40"
            cy="35"
            rx="10"
            ry="14"
            fill="none"
            stroke="url(#goldMain)"
            strokeWidth="2"
          />
          {/* Cockpit highlight */}
          <ellipse
            cx="38"
            cy="32"
            rx="3"
            ry="4"
            fill="#60a5fa"
            opacity="0.3"
          />

          {/* Main Wings - Red with gold leading edges */}
          <polygon
            points="20,45 10,65 20,70 30,50"
            fill="url(#redMain)"
          />
          <polygon
            points="60,45 70,65 60,70 50,50"
            fill="url(#redMain)"
          />
          {/* Gold wing trim */}
          <polygon
            points="20,45 10,65 12,66 22,46"
            fill="url(#goldMain)"
          />
          <polygon
            points="60,45 70,65 68,66 58,46"
            fill="url(#goldMain)"
          />
          {/* Wing details */}
          <rect x="22" y="48" width="6" height="18" fill="url(#goldDark)" />
          <rect x="52" y="48" width="6" height="18" fill="url(#goldDark)" />

          {/* Side Vents/Intakes - Blue glowing */}
          <circle
            cx="25"
            cy="55"
            r="6"
            fill="url(#blueGlow)"
          />
          <circle
            cx="55"
            cy="55"
            r="6"
            fill="url(#blueGlow)"
          />
          <circle
            cx="25"
            cy="55"
            r="4"
            fill="#3b82f6"
          />
          <circle
            cx="55"
            cy="55"
            r="4"
            fill="#3b82f6"
          />
          <circle
            cx="25"
            cy="55"
            r="2"
            fill="#60a5fa"
          />
          <circle
            cx="55"
            cy="55"
            r="2"
            fill="#60a5fa"
          />

          {/* Engines/Exhausts - Dark grey */}
          <circle
            cx="30"
            cy="75"
            r="5"
            fill="#1f2937"
          />
          <circle
            cx="50"
            cy="75"
            r="5"
            fill="#1f2937"
          />
          <circle
            cx="30"
            cy="75"
            r="3"
            fill="#374151"
          />
          <circle
            cx="50"
            cy="75"
            r="3"
            fill="#374151"
          />

          {/* Tail Fins - Red with gold trim */}
          <polygon
            points="30,80 25,95 30,90 35,95"
            fill="url(#redMain)"
          />
          <polygon
            points="50,80 45,95 50,90 55,95"
            fill="url(#redMain)"
          />
          <line
            x1="30"
            y1="80"
            x2="25"
            y2="95"
            stroke="url(#goldMain)"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="80"
            x2="55"
            y2="95"
            stroke="url(#goldMain)"
            strokeWidth="2"
          />

          {/* Thrusters - Animated when running */}
          {isRunning && (
            <>
              <ellipse
                cx="30"
                cy="85"
                rx="4"
                ry="10"
                fill="url(#thrustGradient)"
                opacity="0.9"
              >
                <animate
                  attributeName="opacity"
                  values="0.9;0.5;0.9"
                  dur="0.25s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="ry"
                  values="10;15;10"
                  dur="0.25s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse
                cx="50"
                cy="85"
                rx="4"
                ry="10"
                fill="url(#thrustGradient)"
                opacity="0.9"
              >
                <animate
                  attributeName="opacity"
                  values="0.9;0.5;0.9"
                  dur="0.25s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="ry"
                  values="10;15;10"
                  dur="0.25s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </>
          )}

          {/* Additional details - Panel lines */}
          <line x1="25" y1="50" x2="35" y2="50" stroke="url(#goldDark)" strokeWidth="1" opacity="0.6" />
          <line x1="45" y1="50" x2="55" y2="50" stroke="url(#goldDark)" strokeWidth="1" opacity="0.6" />
          <line x1="25" y1="60" x2="35" y2="60" stroke="url(#goldDark)" strokeWidth="1" opacity="0.6" />
          <line x1="45" y1="60" x2="55" y2="60" stroke="url(#goldDark)" strokeWidth="1" opacity="0.6" />

          {/* More detailed panel lines on fuselage */}
          <line x1="32" y1="30" x2="48" y2="30" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.5" />
          <line x1="32" y1="40" x2="48" y2="40" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.5" />
          <line x1="32" y1="50" x2="48" y2="50" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.5" />
          <line x1="32" y1="65" x2="48" y2="65" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.5" />

          {/* Vertical panel separators */}
          <line x1="28" y1="25" x2="28" y2="75" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.4" />
          <line x1="52" y1="25" x2="52" y2="75" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.4" />

          {/* Small gold rivets/details */}
          <circle cx="28" cy="30" r="1" fill="url(#goldMain)" opacity="0.8" />
          <circle cx="52" cy="30" r="1" fill="url(#goldMain)" opacity="0.8" />
          <circle cx="28" cy="50" r="1" fill="url(#goldMain)" opacity="0.8" />
          <circle cx="52" cy="50" r="1" fill="url(#goldMain)" opacity="0.8" />
          <circle cx="28" cy="70" r="1" fill="url(#goldMain)" opacity="0.8" />
          <circle cx="52" cy="70" r="1" fill="url(#goldMain)" opacity="0.8" />

          {/* Wing panel details */}
          <rect x="22" y="50" width="2" height="15" fill="url(#goldDark)" opacity="0.7" />
          <rect x="56" y="50" width="2" height="15" fill="url(#goldDark)" opacity="0.7" />

          {/* Engine intake details */}
          <circle cx="25" cy="55" r="3" fill="none" stroke="url(#goldMain)" strokeWidth="1" opacity="0.5" />
          <circle cx="55" cy="55" r="3" fill="none" stroke="url(#goldMain)" strokeWidth="1" opacity="0.5" />

          {/* Nose details */}
          <line x1="40" y1="12" x2="40" y2="20" stroke="url(#goldDark)" strokeWidth="1" opacity="0.6" />
          <circle cx="40" cy="15" r="1.5" fill="url(#goldMain)" opacity="0.9" />

          {/* Cockpit additional details */}
          <ellipse cx="42" cy="33" rx="2" ry="3" fill="#60a5fa" opacity="0.4" />
          <line x1="36" y1="35" x2="44" y2="35" stroke="url(#goldDark)" strokeWidth="0.5" opacity="0.5" />

          {/* Tail fin details */}
          <line x1="30" y1="85" x2="30" y2="95" stroke="url(#goldMain)" strokeWidth="1.5" opacity="0.7" />
          <line x1="50" y1="85" x2="50" y2="95" stroke="url(#goldMain)" strokeWidth="1.5" opacity="0.7" />

          {/* Small red accent panels */}
          <rect x="26" y="45" width="4" height="3" fill="url(#redDark)" opacity="0.8" />
          <rect x="50" y="45" width="4" height="3" fill="url(#redDark)" opacity="0.8" />
          <rect x="26" y="68" width="4" height="3" fill="url(#redDark)" opacity="0.8" />
          <rect x="50" y="68" width="4" height="3" fill="url(#redDark)" opacity="0.8" />
        </svg>
      )}
    </motion.div>
  );
}

// Types for score submission results
type ScoreResult = RewardSummary;

export function SpaceLexGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
}) {
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [shipSkinImageUrl, setShipSkinImageUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [backgroundFlash, setBackgroundFlash] = useState<"green" | "red" | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [comboBurst, setComboBurst] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  useRefreshAfterScore(scoreResult ? "saved" : "idle");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreError, setScoreError] = useState(false);
  const gameStartTimeRef = useRef<number>(Date.now());
  const scoreSubmittedRef = useRef<boolean>(false);
  const sessionRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameSession = useGameSession("space-lex", isLoggedIn);
  useGameFocusMode(Boolean(gameState?.isRunning && !gameState.gameOver && !isPaused));

  // Load default ship skin (first ship_skin item, or user's equipped skin)
  useEffect(() => {
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
          .single();

        if (equippedItems?.equipped_ship_skin_id) {
          const { data: skin } = await supabase
            .from("shop_items")
            .select("image_url")
            .eq("id", equippedItems.equipped_ship_skin_id)
            .eq("is_active", true)
            .single();

          if (skin?.image_url) {
            setShipSkinImageUrl(skin.image_url);
            return;
          }
        }
      }

      // Fallback to first available ship_skin
      const { data: defaultSkin } = await supabase
        .from("shop_items")
        .select("image_url")
        .eq("item_type", "ship_skin")
        .eq("is_active", true)
        .order("display_order")
        .limit(1)
        .single();

      if (defaultSkin?.image_url) {
        setShipSkinImageUrl(defaultSkin.image_url);
      }
    }
    loadShipSkin();
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize game
  useEffect(() => {
    const newState = createGameState(suggestedLevel ?? DEFAULT_GAME_LEVEL);
    setGameState(newState);
  }, [suggestedLevel]);

  // Start the game
  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    sessionRef.current += 1;
    gameSession.begin();
    const newState = startGame(createGameState(level));
    setGameState(newState);
    setIsPaused(false);
    setKeysPressed(new Set());
    pausedAtRef.current = 0;
    lastUpdateRef.current = Date.now();
    gameStartTimeRef.current = Date.now();
    scoreSubmittedRef.current = false;
    setScoreResult(null);
    setScoreError(false);
    setIsSubmittingScore(false);
  }, [gameState, gameSession, level]);

  // Pause/Resume
  const handlePauseToggle = useCallback(() => {
    if (!gameState?.isRunning || gameState.gameOver) return;
    setKeysPressed(new Set());
    if (isPaused) {
      const elapsed = Date.now() - pausedAtRef.current;
      setGameState(current => current ? resumeGame(current, elapsed) : current);
      pausedAtRef.current = 0;
      setIsPaused(false);
      lastUpdateRef.current = Date.now();
    } else {
      pausedAtRef.current = Date.now();
      setGameState(current => current ? { ...current, shipVelocity: 0 } : current);
      setIsPaused(true);
    }
  }, [gameState?.isRunning, gameState?.gameOver, isPaused]);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, []);

  // Reset game
  const handleReset = useCallback(() => {
    if (!gameState) return;
    sessionRef.current += 1;
    gameSession.cancel();
    const newState = resetGame(gameState);
    setGameState(newState);
    setIsPaused(false);
    setKeysPressed(new Set());
    pausedAtRef.current = 0;
    gameStartTimeRef.current = Date.now();
    scoreSubmittedRef.current = false;
    setScoreResult(null);
    setScoreError(false);
    setIsSubmittingScore(false);
  }, [gameState, gameSession]);

  // Submit score when game ends
  useEffect(() => {
    if (!gameState?.gameOver || scoreSubmittedRef.current || isSubmittingScore || !isLoggedIn) return;

    const submitScore = async () => {
      const session = sessionRef.current;
      setIsSubmittingScore(true);
      scoreSubmittedRef.current = true;

      const final = {
        score: gameState.score,
        wave: gameState.waveNumber,
        maxCombo: gameState.maxCombo,
        wordsMastered: gameState.learnedWords.length,
        wordsMissed: gameState.missedWords.length,
      };

      try {
        const { sessionId, durationMs } = await gameSession.finish(Date.now() - gameStartTimeRef.current);
        const result = await submitLexiconBlasterScore({ ...final, durationMs, sessionId });
        if (session !== sessionRef.current) return;

        if (result.success && result.rewards) {
          setScoreResult({
            xpEarned: result.rewards.xpEarned,
            goldEarned: result.rewards.goldEarned,
            newLevel: result.rewards.newLevel ?? null,
            isNewPersonalBest: result.isNewPersonalBest,
            isNewGlobalBest: result.isNewGlobalBest,
            courseCompleted: result.courseCompleted
              ? {
                  courseNumber: result.courseCompleted.courseNumber,
                  courseTitle: result.courseCompleted.courseTitle,
                  rewards: result.courseCompleted.rewards,
                  newLevel: result.courseCompleted.newLevel,
                }
              : null,
            dailyChallenge: result.dailyChallenge ?? null,
            newBadges: result.newBadges ?? [],
          });
        } else {
          setScoreError(true);
        }
      } catch (error) {
        if (session !== sessionRef.current) return;
        console.error("Error submitting score:", error);
        setScoreError(true);
      } finally {
        if (session === sessionRef.current) setIsSubmittingScore(false);
      }
    };

    submitScore();
  }, [gameState?.gameOver, gameState?.score, gameState?.waveNumber, gameState?.maxCombo, gameState?.learnedWords.length, gameState?.missedWords.length, isLoggedIn, isSubmittingScore, gameSession]);

  const handleActivateSuper = useCallback(() => {
    if (isPaused) return;
    setGameState(prev => prev ? activateSuper(prev) : prev);
  }, [isPaused]);

  const handleAdvanceDialogue = useCallback(() => {
    if (isPaused) return;
    setGameState(prev => prev ? advanceDialogue(prev) : prev);
  }, [isPaused]);

  const handleCloseDialogue = useCallback(() => {
    if (isPaused) return;
    setGameState(prev => prev ? closeDialogue(prev) : prev);
  }, [isPaused]);

  // Handle keyboard input
  useEffect(() => {
    if (!gameState?.isRunning || gameState.gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        e.preventDefault();
        if (!e.repeat) handlePauseToggle();
        return;
      }
      if (isPaused) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        setKeysPressed((prev) => new Set(prev).add("left"));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        setKeysPressed((prev) => new Set(prev).add("right"));
      } else if (e.key === " ") {
        e.preventDefault();
        if (e.repeat) return;
        if (gameState.currentDialogue) {
          handleAdvanceDialogue();
        } else {
          handleActivateSuper();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setKeysPressed((prev) => {
          const newSet = new Set(prev);
          newSet.delete("left");
          return newSet;
        });
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setKeysPressed((prev) => {
          const newSet = new Set(prev);
          newSet.delete("right");
          return newSet;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const clearKeys = () => {
      setKeysPressed(new Set());
      setGameState(current => current ? { ...current, shipVelocity: 0 } : current);
    };
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, [gameState?.isRunning, gameState?.gameOver, gameState?.currentDialogue, isPaused, handlePauseToggle, handleActivateSuper, handleAdvanceDialogue]);

  // Handle ship movement based on keys
  useEffect(() => {
    if (!gameState?.isRunning || gameState.gameOver || gameState.currentDialogue || isPaused) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        let direction: "left" | "right" | "stop" = "stop";
        if (keysPressed.has("left")) direction = "left";
        else if (keysPressed.has("right")) direction = "right";
        return moveShip(prev, direction);
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [gameState?.isRunning, gameState?.gameOver, gameState?.currentDialogue, isPaused, keysPressed]);

  // Handle touch input for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!gameState?.isRunning || gameState.gameOver || gameState.currentDialogue || isPaused) return;
    const touch = e.touches[0];
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      setGameState((prev) => prev ? setShipTarget(prev, x) : prev);
    }
  }, [gameState?.isRunning, gameState?.gameOver, gameState?.currentDialogue, isPaused]);

  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string };
    const render = () => JSON.stringify({
      phase: gameState?.gameOver ? "ended" : isPaused ? "paused" : gameState?.isRunning ? "playing" : "start",
      coordinates: "0-1; origin top-left, x right, y down",
      score: gameState?.score, lives: gameState?.lives, shipX: gameState?.shipX,
      wave: gameState?.waveNumber, waveStatus: gameState?.waveStatus, progress: gameState?.waveProgress,
      mission: gameState?.mission?.label,
      enemies: gameState?.enemies.map(enemy => ({ text: enemy.text, x: enemy.x, y: enemy.y })),
      bullets: gameState?.bullets.map(bullet => ({ x: bullet.x, y: bullet.y })),
      boss: gameState?.boss,
      dialogue: gameState?.currentDialogue?.lines[gameState.dialogueIndex], superBar: gameState?.superBar,
    });
    gameWindow.render_game_to_text = render;
    return () => { if (gameWindow.render_game_to_text === render) delete gameWindow.render_game_to_text; };
  }, [gameState, isPaused]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!gameState?.isRunning || gameState.gameOver || gameState.currentDialogue || isPaused) return;
    const touch = e.touches[0];
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      setGameState((prev) => prev ? setShipTarget(prev, x) : prev);
    }
  }, [gameState?.isRunning, gameState?.gameOver, gameState?.currentDialogue, isPaused]);

  // Game loop
  useEffect(() => {
    if (!gameState?.isRunning || gameState.gameOver || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min(50, now - lastUpdateRef.current);
      lastUpdateRef.current = now;

      setGameState((prevState) => {
        if (!prevState || !prevState.isRunning || prevState.gameOver) {
          return prevState;
        }

        // Stop updates if dialogue is active
        if (prevState.currentDialogue) return prevState;

        // Update ship position
        let newState = updateShipPosition(prevState, deltaTime);

        // Update Wave Lifecycle
        newState = updateWaveLifecycle(newState);

        // Update super state
        newState = updateSuperState(newState);

        // Auto-fire bullets
        newState = fireBullet(newState);

        // Spawn enemies
        newState = spawnEnemiesIfNeeded(newState, newState.mission);

        // Update enemies
        newState = updateEnemies(newState, deltaTime);

        // Update bullets
        newState = updateBullets(newState, deltaTime);

        // Update explosions
        newState = updateExplosions(newState, deltaTime);

        // Update feedback messages
        newState = updateFeedbackMessages(newState, deltaTime);

        // Power-ups
        newState = spawnPowerUpIfNeeded(newState);
        newState = updatePowerUps(newState, deltaTime);
        newState = collectPowerUp(newState);
        newState = updateActivePowerUps(newState);

        // Check collisions
        const beforeLives = newState.lives;
        const beforeScore = newState.score;
        newState = checkCollisions(newState, newState.mission);
        if (newState.lives < beforeLives) {
          setBackgroundFlash("red");
          triggerShake();
          setTimeout(() => setBackgroundFlash(null), 600);
        } else if (newState.score > beforeScore) {
          setBackgroundFlash("green");
          if (newState.comboCount > 0 && newState.comboCount % 5 === 0) {
            setComboBurst(true);
            setTimeout(() => setComboBurst(false), 1000);
          }
          setTimeout(() => setBackgroundFlash(null), 400);
        }

        // Check enemies reaching bottom
        const beforeLives2 = newState.lives;
        newState = checkEnemiesReachedBottom(newState, newState.mission);
        if (newState.lives < beforeLives2) {
          setBackgroundFlash("red");
          triggerShake();
          setTimeout(() => setBackgroundFlash(null), 600);
        }

        // Update level
        newState = updateLevel(newState);

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState?.isRunning, gameState?.gameOver, isPaused, triggerShake]);

  if (!gameState) {
    return null;
  }

  const rewardStatus = !isLoggedIn ? "guest" : scoreError ? "error" : isSubmittingScore ? "saving" : scoreResult ? "saved" : "saving";

  if (!gameState.isRunning && !gameState.gameOver) {
    return (
      <GameStart
        title="Paré au décollage ?"
        intro="Des mots arrivent du fond de l'espace. La mission en haut de l'écran dit lesquels viser : les mots d'un thème, des synonymes ou des connecteurs. Tire sur les bons, laisse passer les autres."
        rules={[
          "Tirer sur un mot hors mission ou laisser passer un bon mot coûte une vie.",
          "Les mots touchés remplissent la barre EMP : à 100 %, espace déclenche une onde qui nettoie l'écran.",
          "Ordinateur : flèches ou A/D pour bouger, tir automatique. Mobile : glisse le doigt.",
          missionTarget ? `Objectif de mission : ${missionTarget} points.` : "Les vagues s'enchaînent, avec un boss régulièrement.",
          isBeginnerLevel(level)
            ? "Niveaux Débutant et Élémentaire : consignes en français, mots courants, pas de connecteurs."
            : "À partir du niveau Intermédiaire : consignes en anglais et connecteurs logiques.",
        ]}
        onStart={handleStartGame}
        startLabel="Décoller"
      >
        <LevelPicker
          value={level}
          onChange={(next) => {
            setLevel(next);
            setGameState(createGameState(next));
          }}
          suggested={suggestedLevel}
        />
      </GameStart>
    );
  }

  if (gameState.gameOver) {
    return (
      <GameEnd
        title="Fin de partie"
        score={gameState.score}
        scoreLabel="points"
        lines={[
          `Vague ${gameState.waveNumber}, niveau ${gameState.level}`,
          `Combo max x${gameState.maxCombo}`,
          `${gameState.learnedWords.length} mot${gameState.learnedWords.length > 1 ? "s" : ""} maîtrisé${gameState.learnedWords.length > 1 ? "s" : ""}, ${gameState.missedWords.length} à revoir`,
        ]}
        rewards={scoreResult}
        rewardStatus={rewardStatus}
        missionReached={missionTarget != null ? gameState.score >= missionTarget : null}
        onReplay={handleReset}
      >
        {gameState.missedWords.length > 0 ? (
          <div>
            <p className="eq-kicker">À revoir</p>
            <p className="eq-fall-used">
              {gameState.missedWords.slice(0, 20).map((word, index) => (
                <span key={`${word}-${index}`} className="eq-chip eq-chip-coral">
                  {word}
                </span>
              ))}
            </p>
          </div>
        ) : null}
        {gameState.learnedWords.length > 0 ? (
          <div>
            <p className="eq-kicker">Maîtrisés</p>
            <p className="eq-fall-used">
              {gameState.learnedWords.slice(0, 20).map((word, index) => (
                <span key={`${word}-${index}`} className="eq-chip eq-chip-mint">
                  {word}
                </span>
              ))}
            </p>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  return (
    <div className="eq-game-play">
      <GameHud onQuit={handleReset}>
        <HudStat label="Score" value={gameState.score} tone="gold" />
        <HudStat label="Vies" value={"●".repeat(Math.max(0, gameState.lives))} tone={gameState.lives <= 1 ? "coral" : "mint"} />
        <HudStat label="Vague" value={gameState.waveNumber} tone="cyan" hint={`niveau ${gameState.level}`} />
        <HudStat label="Combo" value={`x${gameState.comboCount}`} hint={gameState.maxCombo > 1 ? `max x${gameState.maxCombo}` : undefined} />
      </GameHud>

      {gameState.mission ? (
        <p className="eq-space-mission" role="status">
          <span className="eq-chip eq-chip-gold">Mission</span> {gameState.mission.label}
        </p>
      ) : null}

      <div className="eq-space-super" aria-label="Barre EMP">
        <span className={gameState.superBar >= 100 ? "is-ready" : ""}>EMP</span>
        <i>
          <b style={{ width: `${Math.min(100, gameState.superBar)}%` }} />
        </i>
        {gameState.superBar >= 100 ? (
          <button type="button" className="eq-btn eq-btn-gold eq-btn-sm" onClick={handleActivateSuper}>
            Activer (espace)
          </button>
        ) : (
          <small>{Math.round(gameState.superBar)} %</small>
        )}
      </div>

        {/* Game Area */}
        <motion.div
          ref={gameAreaRef}
          animate={screenShake ? {
            x: [0, -5, 5, -5, 5, 0],
            y: [0, 5, -5, 5, -5, 0],
          } : { x: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`eq-game-arcade eq-space eq-space-stage ${comboBurst ? "is-right" : ""}`}
          style={{ touchAction: "none" }}
          data-testid="space-stage"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Animated Star Field Background */}
          <div className="star-field-vector" />

          {/* Active Power-ups Overlay - ABSOLUTE to prevent layout shift */}
          {(gameState.hasShield || gameState.activePowerUps.length > 0) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex gap-2 pointer-events-none">
              {gameState.hasShield && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/90 border border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                  <span>🛡️</span>
                  <span className="text-xs text-white font-bold">SHIELD</span>
                </div>
              )}
              {gameState.activePowerUps.map((p) => {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((p.endTime - now) / 1000));
                const config: Record<string, { icon: string; label: string; color: string }> = {
                  slowmo: { icon: "⏳", label: "SLOW", color: "bg-purple-600/90 border-purple-400" },
                  double_xp: { icon: "⭐", label: "2X", color: "bg-yellow-600/90 border-yellow-400" },
                };
                const c = config[p.type];
                if (!c) return null;
                return (
                  <div key={p.type} className={`flex items-center gap-1 px-2 py-1 rounded-full ${c.color} border shadow-lg`}>
                    <span>{c.icon}</span>
                    <span className="text-xs text-white font-bold">{c.label}</span>
                    <span className="text-xs text-white/80">{remaining}s</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Background Flash Effect */}
          <AnimatePresence>
            {backgroundFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0.2, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute inset-0 z-0 pointer-events-none ${backgroundFlash === "green" ? "bg-green-400" : "bg-red-400"
                  }`}
                style={{ mixBlendMode: "screen" }}
              />
            )}
          </AnimatePresence>

          {/* EMP Blast Visual Effect */}
          {gameState.superActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.8 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-400 mix-blend-screen z-40 pointer-events-none"
              style={{ filter: "blur(20px)" }}
            />
          )}

          {/* Boss HP Bar Overlay */}
          {gameState.boss && gameState.isRunning && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 md:w-64 z-35">
              <div className="text-center font-black text-red-500 text-[10px] md:text-xs mb-1 uppercase tracking-tighter text-outline-sm italic">
                {gameState.boss.name}
              </div>
              <div className="h-3 bg-slate-900 border-2 border-black rounded-sm overflow-hidden shadow-lg">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400"
                  animate={{ width: `${(gameState.boss.hp / gameState.boss.maxHp) * 100}%` }}
                />
              </div>
            </div>
          )}


          {/* Upcoming Enemy Preview - Neutral Color - Hidden during Boss */}
          {gameState.upcomingEnemy && !gameState.boss && gameState.isRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute z-35 upcoming-enemy-preview"
              style={{
                left: `${gameState.upcomingEnemy.baseX * 100}%`,
                top: "120px", // consistent 120px from top to clear all UI
                transform: "translateX(-50%)",
              }}
            >
              <div className="relative">
                {/* Preview indicator arrow */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-cyan-400 animate-pulse" />
                </div>
                {/* Preview box - Neutral color */}
                <div
                  className="px-3 py-2 rounded-lg border-2 bg-slate-800/90 border-cyan-500"
                  style={{
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    className="text-xs font-bold text-cyan-100"
                    style={{
                      textShadow: "1px 1px 0 rgba(0, 0, 0, 0.8)",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {gameState.upcomingEnemy.text}
                  </div>
                  {/* Countdown indicator */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-cyan-500/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan-400"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{
                        duration: 2,
                        ease: "linear",
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enemies - Neutral Color, Dynamic Size, Sine Wave Movement */}
          {gameState.enemies.map((enemy) => {
            // Calculate dynamic padding based on word length
            const textLength = enemy.text.length;
            const basePaddingX = 8;
            const basePaddingY = 8;
            // Add padding based on character count (more characters = more padding)
            const charPadding = 1.5;
            const paddingX = basePaddingX + Math.max(0, (textLength - 4) * charPadding);

            return (
              <motion.div
                key={enemy.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-10 enemy-neutral-pixel"
                style={{
                  left: `${enemy.x * 100}%`,
                  top: `${enemy.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  padding: `${basePaddingY}px ${paddingX}px`,
                  borderRadius: "6px",
                  border: "3px solid",
                  whiteSpace: "nowrap",
                  display: "inline-block", // Important: makes width fit content
                }}
              >
                <div
                  className="text-xs md:text-sm font-bold text-white"
                  style={{
                    textShadow: "2px 2px 0 rgba(0, 0, 0, 0.8), -1px -1px 0 rgba(0, 0, 0, 0.5), 1px -1px 0 rgba(0, 0, 0, 0.5), -1px 1px 0 rgba(0, 0, 0, 0.5)",
                    letterSpacing: "0.05em",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {enemy.text}
                </div>
              </motion.div>
            );
          })}

          {/* Bullets */}
          {gameState.bullets.map((bullet) => (
            <motion.div
              key={bullet.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bullet-vector absolute z-15"
              style={{
                left: `${bullet.x * 100}%`,
                top: `${bullet.y * 100}%`,
                transform: "translate(-50%, -50%)",
                width: "12px",
                height: "35px",
              }}
            />
          ))}

          {/* Power-ups */}
          {gameState.powerups.map((powerup) => {
            const powerupConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
              shield: { icon: "🛡️", color: "text-blue-300", bgColor: "from-blue-600 to-cyan-600" },
              slowmo: { icon: "⏳", color: "text-purple-300", bgColor: "from-purple-600 to-pink-600" },
              double_xp: { icon: "⭐", color: "text-yellow-300", bgColor: "from-yellow-500 to-amber-500" },
              extra_life: { icon: "❤️", color: "text-red-300", bgColor: "from-red-500 to-rose-500" },
            };
            const config = powerupConfig[powerup.type] || powerupConfig.shield;

            return (
              <motion.div
                key={powerup.id}
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
                className="absolute z-20"
                style={{
                  left: `${powerup.x * 100}%`,
                  top: `${powerup.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center border-2 border-white/50`}
                  style={{
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <span className="text-lg md:text-xl">{config.icon}</span>
                </div>
              </motion.div>
            );
          })}

          {/* Explosions */}
          {gameState.explosions.map((explosion) => {
            const progress = explosion.life / explosion.maxLife;
            const size = 40 + progress * 60;
            return (
              <motion.div
                key={explosion.id}
                className={`explosion-vector ${explosion.type === "hit" ? "explosion-hit-vector" : "explosion-miss-vector"}`}
                style={{
                  left: `${explosion.x * 100}%`,
                  top: `${explosion.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: 1 - progress,
                }}
              />
            );
          })}

          {/* Educational Feedback Messages */}
          {gameState.feedbackMessages.map((msg) => {
            const progress = msg.life / msg.maxLife;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1 - progress * 0.8, scale: 1 }}
                className="absolute z-25 pointer-events-none"
                style={{
                  left: `${msg.x * 100}%`,
                  top: `${msg.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`px-3 py-2 rounded-lg border-2 ${msg.isCorrect
                    ? "bg-green-900/90 border-green-400 text-green-200"
                    : "bg-red-900/90 border-red-400 text-red-200"
                    }`}
                  style={{
                    boxShadow: msg.isCorrect
                      ? "0 0 15px rgba(34, 197, 94, 0.5)"
                      : "0 0 15px rgba(239, 68, 68, 0.5)",
                    fontSize: isMobile ? "10px" : "12px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    textShadow: "1px 1px 0 rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {msg.explanation}
                </div>
              </motion.div>
            );
          })}

          {/* Dialogue Overlay */}
          <AnimatePresence>
            {gameState.currentDialogue && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-55 pointer-events-auto"
              >
                <div className="eq-space-overlay-card is-cyan">
                  <div className="flex items-start gap-4">
                    <div className="eq-space-speaker" aria-hidden="true">
                      {gameState.currentDialogue.lines[gameState.dialogueIndex].speaker === "COMMANDER" ? "CDT" : "IA"}
                    </div>
                    <div className="flex-1">
                      <div className="text-cyan-400 font-black text-xs md:text-sm tracking-widest mb-1 italic">
                        {gameState.currentDialogue.lines[gameState.dialogueIndex].speaker}
                      </div>
                      <div className="text-white text-sm md:text-base font-bold leading-tight min-h-[3em]" lang="en">
                        {gameState.currentDialogue.lines[gameState.dialogueIndex].text}
                      </div>
                      {gameState.currentDialogue.lines[gameState.dialogueIndex].subtitle ? (
                        <p className="eq-space-subtitle" lang="fr">
                          {gameState.currentDialogue.lines[gameState.dialogueIndex].subtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseDialogue}
                      className="text-xs font-black text-slate-400 hover:text-white transition-colors"
                    >
                      Passer
                    </button>
                    <button
                      type="button"
                      onClick={handleAdvanceDialogue}
                      className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white font-black text-xs md:text-sm shadow-[2px_2px_0_#083344] active:translate-y-0.5 active:shadow-none"
                    >
                      {gameState.dialogueIndex < (gameState.currentDialogue.lines.length - 1) ? "Suite" : "C'est parti"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wave Overlays */}
          <AnimatePresence>
            {gameState.waveStatus === "intro" && gameState.isRunning && !gameState.currentDialogue && (
              <motion.div
                key="wave-intro"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute inset-0 z-40 flex items-center justify-center flex-col p-4 text-center pointer-events-none"
              >
                <div className="eq-space-overlay-card is-cyan">
                  <p className="eq-kicker">Vague {gameState.waveNumber}</p>
                  <h2 className="eq-space-overlay-title">{gameState.mission?.label}</h2>
                  <p className="eq-space-overlay-sub">Objectif : {gameState.waveTarget} mots</p>
                </div>
              </motion.div>
            )}

            {gameState.waveStatus === "boss_intro" && gameState.isRunning && !gameState.currentDialogue && (
              <motion.div
                key="boss-intro"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute inset-0 z-40 flex items-center justify-center flex-col p-4 text-center pointer-events-none"
              >
                <div className="eq-space-overlay-card is-coral">
                  <p className="eq-kicker eq-space-warning">Alerte</p>
                  <h2 className="eq-space-overlay-title">Boss du secteur</h2>
                  <p className="eq-space-overlay-sub">{gameState.mission?.label}</p>
                  <p className="eq-space-overlay-note">Prépare-toi au combat.</p>
                </div>
              </motion.div>
            )}

            {gameState.waveStatus === "cleared" && gameState.isRunning && !gameState.currentDialogue && (
              <motion.div
                key="wave-cleared"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute inset-0 z-40 flex items-center justify-center flex-col pointer-events-none"
              >
                <div className="eq-space-overlay-card is-mint">
                  <p className="eq-kicker">Vague nettoyée</p>
                  <h2 className="eq-space-overlay-title">Beau travail</h2>
                  <p className="eq-space-overlay-sub">Bonus : + {gameState.waveNumber * 100} points</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wave Progress Bar */}
          {gameState.waveStatus === "playing" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/3 max-w-md h-5 bg-black/50 border border-white/30 rounded-full overflow-hidden z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.waveProgress / gameState.waveTarget) * 100}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-black text-white text-outline-sm uppercase tracking-wider">
                  {gameState.waveProgress} / {gameState.waveTarget} cibles
                </span>
              </div>
            </div>
          )}

          {/* Combo Badge */}
          <AnimatePresence>
            {gameState.comboCount >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: "-50%", y: 20 }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
                exit={{ opacity: 0, scale: 1.5, x: "-50%" }}
                className="absolute z-32 pointer-events-none"
                style={{
                  left: `${gameState.shipX * 100}%`,
                  bottom: "25%", // raised to clear dialogue box
                }}
              >
                <div className="bg-yellow-500 text-black px-3 py-1 rounded-sm font-black italic text-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black flex flex-col items-center">
                  <span className="text-xs uppercase leading-none">Combo</span>
                  <motion.span
                    key={gameState.comboCount}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="leading-none text-2xl"
                  >
                    X{gameState.comboCount}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boss Rendering */}
          {gameState.boss && (
            <motion.div
              initial={{ y: -100 }}
              animate={{
                y: 0,
                x: "-50%"
              }}
              style={{
                left: `${gameState.boss.x * 100}%`,
                top: "25%", // Lower than HP bar
                width: "120px",
                height: "80px",
              }}
              className="absolute z-20"
            >
              <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <path d="M10,20 L50,10 L90,20 L80,50 L20,50 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                <path d="M30,50 L10,60 L50,55 L90,60 L70,50 Z" fill="#ef4444" />
                <rect x="35" y="25" width="30" height="15" fill="#ef4444" opacity="0.8" rx="2" />
                <circle cx="50" cy="35" r="5" fill="#fecaca" />
                <motion.circle
                  cx="50" cy="35" r="15"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </svg>
            </motion.div>
          )}

          {/* Ship */}
          <SpaceShip x={gameState.shipX} isRunning={gameState.isRunning} skinImageUrl={shipSkinImageUrl} />

          {/* Pause Overlay */}
          {isPaused && !gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/85 z-[60] flex items-center justify-center backdrop-blur-sm"
            >
              <div className="eq-space-overlay-card text-center">
                <p className="eq-kicker">Pause</p>
                <p className="eq-space-overlay-sub">Le vaisseau attend tes ordres.</p>
                <button
                  onClick={handlePauseToggle}
                  className="eq-btn eq-btn-gold"
                >
                  Reprendre
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>

      <div className="eq-game-actions">
        <button type="button" className="eq-btn eq-btn-ghost" onClick={handlePauseToggle}>
          {isPaused ? "Reprendre" : "Pause (Échap)"}
        </button>
      </div>
    </div>
  );
}
