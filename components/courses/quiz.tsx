"use client";

import { useState } from "react";
import {
  CheckIcon,
  XIcon,
  ArrowRightIcon,
  RefreshIcon,
  TrophyIcon,
  QuestIcon,
} from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";

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
    // Placeholder for future audio.
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      playSound();

      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      setScore((prev) => prev + 1);
      setGainedXP((prev) => prev + 100 + newCombo * 10);
    } else {
      playSound();
      setCombo(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      playSound();
      setShowResult(true);
    }
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
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="comic-panel-dark relative overflow-hidden border-2 border-slate-700 bg-slate-900 p-8 text-center">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

        <div className="relative z-10 mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-yellow-500/20 blur-xl" />
            <TrophyIcon className="h-20 w-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>
        </div>

        <h3 className="mb-2 text-3xl font-bold uppercase tracking-wider text-white text-outline">
          Mission terminee
        </h3>

        <div className="mx-auto mb-8 grid max-w-md gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-600 bg-slate-800/80 p-4">
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Score</p>
            <p className="text-2xl font-black text-white">
              {score} <span className="text-lg text-slate-500">/ {questions.length}</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-600 bg-slate-800/80 p-4">
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Precision</p>
            <p className="text-2xl font-black text-cyan-300">{accuracy}%</p>
          </div>
          <div className="rounded-xl border border-slate-600 bg-slate-800/80 p-4">
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">XP gagnee</p>
            <p className="text-2xl font-black text-emerald-400">+{gainedXP}</p>
          </div>
          <div className="rounded-xl border border-slate-600 bg-slate-800/80 p-4 md:col-span-3">
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Meilleur combo</p>
            <p className="text-2xl font-black text-indigo-400">
              {maxCombo} <span className="text-sm font-normal text-slate-500">reponses d'affilee</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 mb-8">
          {score === questions.length ? (
            <p className="text-lg font-bold text-emerald-300">Legendaire. Sans-faute absolu.</p>
          ) : score >= questions.length * 0.8 ? (
            <p className="text-lg font-bold text-cyan-300">Excellent. Le point est presque verrouille.</p>
          ) : score >= questions.length * 0.5 ? (
            <p className="text-lg font-bold text-yellow-300">Bien joue. Encore un peu d'entrainement.</p>
          ) : (
            <p className="text-lg font-bold text-orange-400">Encore une passe de revision et cela va monter vite.</p>
          )}
        </div>

        <button
          onClick={resetQuiz}
          className="comic-button inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold uppercase tracking-wide text-white shadow-[0_4px_0_rgb(49,46,129)] transition-all hover:translate-y-[2px] hover:bg-indigo-700 hover:shadow-[0_2px_0_rgb(49,46,129)]"
        >
          <RefreshIcon className="h-5 w-5" />
          Recommencer la mission
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="comic-panel-dark relative flex flex-col overflow-hidden border-2 border-indigo-500/30 bg-slate-900 p-0">
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            key="combo-badge"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute top-4 right-4 z-20 rounded-lg border-2 border-white/20 bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-xl font-black italic text-white shadow-lg rotate-3"
          >
            {combo} COMBO !
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-b border-slate-700 bg-slate-950/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white text-outline">
            <QuestIcon className="h-5 w-5 text-indigo-400" />
            <span className="opacity-90">{title}</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="relative p-6 md:p-8">
        <h4 className="mb-8 text-xl font-bold leading-relaxed text-white drop-shadow-md md:text-2xl">
          {question.question}
        </h4>

        <div className="grid gap-3">
          {question.options.map((option, index) => {
            let buttonStyle =
              "bg-slate-800 border-b-4 border-slate-700 hover:border-slate-600 hover:bg-slate-750 active:translate-y-1 active:border-b-0";
            let icon = null;

            if (isAnswered) {
              if (index === question.correctAnswer) {
                buttonStyle = "border-b-4 border-emerald-600 bg-emerald-900/60 text-emerald-100";
                icon = <CheckIcon className="h-6 w-6 text-emerald-400 drop-shadow-md" />;
              } else if (index === selectedOption) {
                buttonStyle = "border-b-4 border-red-600 bg-red-900/60 text-red-100";
                icon = <XIcon className="h-6 w-6 text-red-400 drop-shadow-md" />;
              } else {
                buttonStyle = "border-slate-700/50 bg-slate-800/40 text-slate-500 opacity-50";
              }
            } else if (selectedOption === index) {
              buttonStyle = "border-indigo-500 bg-indigo-900/60 text-indigo-100";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={`group relative flex w-full items-center justify-between overflow-hidden rounded-xl p-4 text-left text-lg font-medium transition-all duration-100 md:p-5 ${buttonStyle}`}
              >
                <span className="relative z-10">{option}</span>
                {icon}
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
            className="border-t border-slate-700 bg-slate-800/50"
          >
            <div className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
              <div className="flex-1">
                <p className="border-l-4 border-indigo-500 py-1 pl-4 text-sm italic text-slate-300 md:text-base">
                  <strong className="mb-1 block text-xs uppercase tracking-wider text-white not-italic opacity-70">
                    Explication
                  </strong>
                  {question.explanation}
                </p>
              </div>
              <button
                onClick={nextQuestion}
                className="comic-button inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold uppercase tracking-wide text-white shadow-[0_4px_0_rgb(5,150,105)] transition-all hover:translate-y-[2px] hover:bg-emerald-700 hover:shadow-[0_2px_0_rgb(5,150,105)] md:w-auto"
              >
                <span>{currentQuestion < questions.length - 1 ? "Suite" : "Terminer"}</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
