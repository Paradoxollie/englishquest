import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course25: LessonContent = { courseNumber: 25, title: "How long...?", objective: "Depuis combien de temps ?", sections: [{ title: "En construction", content: <PlaceholderContent /> }] };