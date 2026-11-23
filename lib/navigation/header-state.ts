import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { getGameBySlug } from "@/lib/games/config";
import { getEquippedPortraitUrl } from "@/lib/shop/equipped-portrait";
import type { ProfileRole } from "@/types/profile";
import { guestHeaderState, type HeaderState } from "./header-state-types";
export { guestHeaderState } from "./header-state-types";
export type { HeaderState, HeaderFocusCourse, HeaderFocusGame } from "./header-state-types";

export async function getHeaderState(userId: string | null): Promise<HeaderState> {
  if (!userId) {
    return guestHeaderState;
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const [{ data: profile }, avatarUrl, roadmap, contactReplies] = await Promise.all([
      adminClient.from("profiles").select("username, role").eq("id", userId).maybeSingle(),
      getEquippedPortraitUrl(adminClient, userId).catch(() => null),
      getUserCourseRoadmap(userId).catch(() => null),
      adminClient.from("contact_messages").select("id", { head: true, count: "exact" })
        .eq("user_id", userId).eq("replied", true).not("reply_notice", "is", null)
        .then(({ count }) => count ?? 0, () => 0),
    ]);
    const focusCourse = roadmap?.currentCourse ?? roadmap?.recommendedCourse;
    const focusGameSlug = roadmap?.recommendedGameSlugs[0] ?? null;
    const focusGameConfig = focusGameSlug ? getGameBySlug(focusGameSlug) : null;
    const role = (profile?.role as ProfileRole | undefined) ?? null;

    return {
      isAuthenticated: true,
      username: profile?.username ?? null,
      avatarUrl,
      role,
      completionRate: roadmap?.completionRate ?? 0,
      canAccessDashboard: role === "admin",
      contactReplies,
      canAccessTeachers: role === "teacher" || role === "admin",
      focusCourse: focusCourse
        ? {
            courseId: focusCourse.courseId,
            title: focusCourse.title,
            href: `/cours/${focusCourse.courseId}`,
          }
        : null,
      focusGame: focusGameConfig
        ? {
            slug: focusGameConfig.slug,
            name: focusGameConfig.name,
            href: `/play/${focusGameConfig.slug}`,
          }
        : null,
    };
  } catch {
    return {
      ...guestHeaderState,
      isAuthenticated: true,
    };
  }
}
