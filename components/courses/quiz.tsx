"use client";

import { useState, useEffect } from "react";
import {
    CheckIcon,
    XIcon,
    ArrowRightIcon,
    RefreshIcon,
    TrophyIcon,
    QuestIcon,
    GoldIcon,
    XPIcon
} from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export type Question = {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
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

    // Gamification State
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [gainedXP, setGainedXP] = useState(0);

    // Sound effect placeholder
    const playSound = (type: 'correct' | 'wrong' | 'complete') => {
        // Future audio implementation
    };

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const isCorrect = index === questions[currentQuestion].correctAnswer;

        if (isCorrect) {
            playSound('correct');
            // Combo Logic
            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo > maxCombo) setMaxCombo(newCombo);

            // Score & XP Logic (Base 100 XP + 50 XP per combo step)
            setScore((prev) => prev + 1);
            setGainedXP((prev) => prev + 100 + (newCombo * 10));

            // Confetti for correct answer
            const colors = ['#34d399', '#10b981', '#059669']; // Emerald greens
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { x: 0.5, y: 0.7 },
                colors: colors,
                disableForReducedMotion: true,
                scalar: 0.8
            });

        } else {
            playSound('wrong');
            setCombo(0); // Combo Breaker
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            playSound('complete');
            setShowResult(true);
            // Big Confetti for completion
            if (score > questions.length / 2) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
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
        return (
            <div className="comic-panel-dark p-8 text-center bg-slate-900 border-2 border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>

                <div className="mb-6 flex justify-center relative z-10">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
                        <TrophyIcon className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-2 text-outline tracking-wider uppercase">Mission Terminée</h3>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Score</p>
                        <p className="text-2xl font-black text-white">{score} <span className="text-slate-500 text-lg">/ {questions.length}</span></p>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">XP Gagné</p>
                        <p className="text-2xl font-black text-emerald-400">+{gainedXP}</p>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 col-span-2">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Meilleur Combo</p>
                        <p className="text-2xl font-black text-indigo-400">{maxCombo} <span className="text-sm text-slate-500 font-normal">réponses d'affilée</span></p>
                    </div>
                </div>

                <div className="mb-8 relative z-10">
                    {score === questions.length ? (
                        <p className="text-emerald-300 font-bold text-lg animate-bounce">👑 LÉGENDAIRE ! Un sans-faute absolu !</p>
                    ) : score >= questions.length * 0.8 ? (
                        <p className="text-cyan-300 font-bold text-lg">EXCELLENT ! Vous maîtrisez votre sujet.</p>
                    ) : score >= questions.length * 0.5 ? (
                        <p className="text-yellow-300 font-bold text-lg">BIEN JOUÉ ! Encore un peu d'entraînement.</p>
                    ) : (
                        <p className="text-orange-400 font-bold text-lg">COURAGE ! La répétition fixe la notion.</p>
                    )}
                </div>

                <button
                    onClick={resetQuiz}
                    className="comic-button bg-indigo-600 text-white px-8 py-4 font-bold rounded-xl shadow-[0_4px_0_rgb(49,46,129)] hover:shadow-[0_2px_0_rgb(49,46,129)] hover:translate-y-[2px] transition-all inline-flex items-center gap-2 text-lg uppercase tracking-wide"
                >
                    <RefreshIcon className="w-5 h-5" />
                    Recommencer la mission
                </button>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="comic-panel-dark p-0 bg-slate-900 border-2 border-indigo-500/30 overflow-hidden flex flex-col relative">
            {/* Combo Display (Absolute) */}
            <AnimatePresence>
                {combo > 1 && (
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        key="combo-badge"
                        className="absolute top-4 right-4 z-20 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-xl italic px-4 py-2 rounded-lg shadow-lg rotate-3 border-2 border-white/20"
                    >
                        {combo} COMBO !
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header with Progress */}
            <div className="bg-slate-950/50 p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white text-outline flex items-center gap-2">
                        <QuestIcon className="w-5 h-5 text-indigo-400" />
                        <span className="opacity-90">{title}</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                        {currentQuestion + 1} / {questions.length}
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <div className="p-6 md:p-8 relative">
                {/* Question */}
                <h4 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed drop-shadow-md">
                    {question.question}
                </h4>

                {/* Options Grid */}
                <div className="grid gap-3">
                    {question.options.map((option, index) => {
                        let buttonStyle = "bg-slate-800 border-b-4 border-slate-700 hover:bg-slate-750 hover:border-slate-600 active:border-b-0 active:translate-y-1";
                        let icon = null;

                        if (isAnswered) {
                            if (index === question.correctAnswer) {
                                buttonStyle = "bg-emerald-900/60 border-b-4 border-emerald-600 text-emerald-100";
                                icon = <CheckIcon className="w-6 h-6 text-emerald-400 drop-shadow-md" />;
                            } else if (index === selectedOption) {
                                buttonStyle = "bg-red-900/60 border-b-4 border-red-600 text-red-100";
                                icon = <XIcon className="w-6 h-6 text-red-400 drop-shadow-md" />;
                            } else {
                                buttonStyle = "bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-50";
                            }
                        } else if (selectedOption === index) {
                            // Selected but not confirmed (if we had a confirm step, but here it's instant)
                            buttonStyle = "bg-indigo-900/60 border-indigo-500 text-indigo-100";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 md:p-5 rounded-xl transition-all duration-100 flex items-center justify-between group text-lg font-medium relative overflow-hidden ${buttonStyle}`}
                            >
                                <span className="z-10 relative">{option}</span>
                                {icon}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Explanation / Next Button Area */}
            <AnimatePresence mode="wait">
                {isAnswered && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-800/50 border-t border-slate-700"
                    >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex-1">
                                <p className="text-slate-300 italic text-sm md:text-base border-l-4 border-indigo-500 pl-4 py-1">
                                    <strong className="text-white block mb-1 not-italic text-xs tracking-wider uppercase opacity-70">Explication</strong>
                                    {question.explanation}
                                </p>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="w-full md:w-auto comic-button bg-emerald-600 text-white px-8 py-3 font-bold rounded-xl shadow-[0_4px_0_rgb(5,150,105)] hover:shadow-[0_2px_0_rgb(5,150,105)] hover:translate-y-[2px] transition-all inline-flex items-center justify-center gap-2 uppercase tracking-wide shrink-0"
                            >
                                <span>{currentQuestion < questions.length - 1 ? "Suite" : "Terminer"}</span>
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
