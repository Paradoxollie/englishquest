"use client";

import { useState } from "react";
import {
  CheckIcon,
  XIcon,
  ArrowRightIcon,
  RefreshIcon,
  TrophyIcon,
  QuestIcon,
  XPIcon,
} from "@/components/ui/icons";
import { AnimatePresence, motion } from "framer-motion";

export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

interface QuizProps {
  title?: string;
  questions: Question[];
}

function getQuizVerdict(score: number, total: number) {
  const ratio = total === 0 ? 0 : score / total;

  if (ratio === 1) {
    return {
      title: "Sans-faute legendaire",
      body: "Tu as verrouille la notion sans aucune erreur. On est sur une vraie maitrise.",
      accent: "text-emerald-300",
      chip: "bg-emerald-600",
    };
  }

  if (ratio >= 0.8) {
    return {
      title: "Tres solide",
      body: "Le point de grammaire est bien compris. Une petite revision et c'est ancre.",
      accent: "text-cyan-300",
      chip: "bg-cyan-600",
    };
  }

  if (ratio >= 0.5) {
    return {
      title: "Bonne base",
      body: "La logique est la, mais certaines formes demandent encore de la repetition.",
      accent: "text-amber-300",
      chip: "bg-amber-500",
    };
  }

  return {
    title: "A consolider",
    body: "La structure commence a emerger, mais il faut revoir le cours et refaire le quiz.",
    accent: "text-orange-300",
    chip: "bg-orange-500",
  };
}

export function Quiz({ title = "Mission Validation", questions }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gainedXP, setGainedXP] = useState(0);

  const playSound = () => {
    // Reserved for future audio polish.
  };

  const question = questions[currentQuestion];
  const accuracy = questions.length === 0 ? 0 : Math.round((score / questions.length) * 100);
  const verdict = getQuizVerdict(score, questions.length);

  const handleOptionClick = (index: number) => {
    if (isAnswered) {
      return;
    }

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctAnswer;

    if (isCorrect) {
      playSound();

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((previous) => Math.max(previous, newCombo));
      setScore((previous) => previous + 1);
      setGainedXP((previous) => previous + 100 + newCombo * 10);
      return;
    }

    playSound();
    setCombo(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      return;
    }

    playSound();
    setShowResult(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setGainedXP(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="comic-panel-dark relative overflow-hidden border-2 border-cyan-500/30 bg-slate-950/90 p-8 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/2 top-10 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-8 right-10 h-36 w-36 rounded-full bg-violet-500 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-5 rounded-full bg-yellow-500/20 blur-2xl" />
              <div className="comic-panel flex h-24 w-24 items-center justify-center border-2 border-black bg-slate-900 text-yellow-300">
                <TrophyIcon className="h-12 w-12" />
              </div>
            </div>
          </div>

          <span className={`inline-flex rounded-full border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-white ${verdict.chip}`}>
            Mission terminee
          </span>

          <h3 className="mt-5 text-3xl font-black uppercase tracking-[0.08em] text-white text-outline">
            {verdict.title}
          </h3>
          <p className={`mx-auto mt-3 max-w-2xl text-base font-semibold ${verdict.accent}`}>
            {verdict.body}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="comic-panel border-2 border-black bg-slate-900/80 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Score</p>
              <p className="mt-2 text-3xl font-black text-white">
                {score}
                <span className="text-lg text-slate-500"> / {questions.length}</span>
              </p>
            </div>

            <div className="comic-panel border-2 border-black bg-slate-900/80 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Precision</p>
              <p className="mt-2 text-3xl font-black text-cyan-300">{accuracy}%</p>
            </div>

            <div className="comic-panel border-2 border-black bg-slate-900/80 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">XP gagnee</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-3xl font-black text-emerald-300">
                <XPIcon className="h-6 w-6" />
                <span>+{gainedXP}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="comic-panel border-2 border-black bg-slate-900/70 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Serie max</p>
              <p className="mt-2 text-2xl font-black text-violet-300">{maxCombo}</p>
            </div>
            <div className="comic-panel border-2 border-black bg-slate-900/70 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Prochaine action</p>
              <p className="mt-2 text-sm font-semibold text-slate-200">
                Reprends le cours puis relance le quiz pour verrouiller les automatismes.
              </p>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="comic-button mt-8 inline-flex items-center gap-2 bg-indigo-600 px-8 py-4 text-lg font-black uppercase tracking-[0.08em] text-white hover:bg-indigo-700"
          >
            <RefreshIcon className="h-5 w-5" />
            Rejouer la mission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comic-panel-dark relative overflow-hidden border-2 border-cyan-500/20 bg-slate-950/90">
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            key="combo-badge"
            initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute right-4 top-4 z-20 rounded-xl border-2 border-black bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_4px_0_0_#000]"
          >
            {combo} combo
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-b border-white/10 bg-slate-950/60 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="comic-panel border-2 border-black bg-indigo-600 p-2">
                <QuestIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
                  Validation active
                </p>
                <h3 className="text-2xl font-black text-white text-outline">{title}</h3>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Question</p>
              <p className="mt-1 text-sm font-black text-white">
                {currentQuestion + 1} / {questions.length}
              </p>
            </div>
            <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Score</p>
              <p className="mt-1 text-sm font-black text-cyan-300">{score}</p>
            </div>
            <div className="comic-panel border-2 border-black bg-slate-900/80 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">XP cumulee</p>
              <p className="mt-1 text-sm font-black text-emerald-300">+{gainedXP}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.45 }}
          />
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-8 rounded-[1.4rem] border border-white/8 bg-slate-900/55 p-5 md:p-6">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
            Defi en cours
          </p>
          <h4 className="text-xl font-black leading-relaxed text-white md:text-2xl">{question.question}</h4>
        </div>

        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index);
            const isCorrect = index === question.correctAnswer;
            const isSelected = index === selectedOption;

            let buttonStyle =
              "bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600 text-white";

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle =
                  "bg-emerald-900/70 border-emerald-500 text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.28)]";
              } else if (isSelected) {
                buttonStyle =
                  "bg-rose-900/70 border-rose-500 text-rose-50 shadow-[0_0_0_1px_rgba(244,63,94,0.28)]";
              } else {
                buttonStyle = "bg-slate-900/70 border-slate-800 text-slate-400 opacity-70";
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={`group rounded-[1.25rem] border-2 p-4 text-left transition-all duration-150 md:p-5 ${buttonStyle}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-slate-950/80 text-sm font-black text-cyan-300 shadow-[0_4px_0_0_#000]">
                      {optionLabel}
                    </div>
                    <span className="pt-1 text-base font-semibold leading-relaxed md:text-lg">{option}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckIcon className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />}
                  {isAnswered && isSelected && !isCorrect && <XIcon className="mt-1 h-6 w-6 shrink-0 text-rose-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAnswered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-slate-900/70"
          >
            <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border-2 border-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white ${
                      selectedOption === question.correctAnswer ? "bg-emerald-600" : "bg-rose-600"
                    }`}
                  >
                    {selectedOption === question.correctAnswer ? "Bonne reponse" : "A revoir"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                    Reponse juste: {String.fromCharCode(65 + question.correctAnswer)}
                  </span>
                </div>

                <p className="rounded-[1.2rem] border border-white/8 bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-200 md:text-base">
                  <strong className="mr-2 text-white">Explication:</strong>
                  {question.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={nextQuestion}
                className="comic-button inline-flex w-full items-center justify-center gap-2 bg-emerald-600 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-emerald-700 md:w-auto"
              >
                <span>{currentQuestion < questions.length - 1 ? "Question suivante" : "Voir le resultat"}</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
