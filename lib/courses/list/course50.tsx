import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course50: LessonContent = { courseNumber: 50, title: "Phrasal Verbs (Advanced)", objective: "Les plus utiles.", sections: [{ title: "En construction", content: <PlaceholderContent /> }] };