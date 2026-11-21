"use client";

import { createContext, useContext } from "react";
import type { ExerciseAnswer } from "@/lib/courses/exercise-check";

export const ClassActivityContext = createContext<{ runKey: string; initialAnswers: ExerciseAnswer[] } | null>(null);
export const useClassActivity = () => useContext(ClassActivityContext);
