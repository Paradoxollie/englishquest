import "server-only";
import { cache } from "react";
import { getUserCourseRoadmap } from "@/lib/courses/progress";

/** Déduplique la lecture de la progression des cours dans une même requête serveur. */
export const getCachedUserCourseRoadmap = cache((userId: string) => getUserCourseRoadmap(userId));
