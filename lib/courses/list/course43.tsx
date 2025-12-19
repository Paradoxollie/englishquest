import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course43: LessonContent = { courseNumber: 43, title: "Future Perfect", objective: "J'aurai fini...", sections: [{ title: "En construction", content: <PlaceholderContent /> }] };