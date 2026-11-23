import type { ProfileRole } from "@/types/profile";

export type HeaderFocusCourse = {
  courseId: number;
  title: string;
  href: string;
};

export type HeaderFocusGame = {
  slug: string;
  name: string;
  href: string;
};

export type HeaderState = {
  isAuthenticated: boolean;
  username: string | null;
  avatarUrl: string | null;
  role: ProfileRole | null;
  completionRate: number;
  canAccessDashboard: boolean;
  contactReplies: number;
  canAccessTeachers: boolean;
  focusCourse: HeaderFocusCourse | null;
  focusGame: HeaderFocusGame | null;
};

export const guestHeaderState: HeaderState = {
  isAuthenticated: false,
  username: null,
  avatarUrl: null,
  role: null,
  completionRate: 0,
  canAccessDashboard: false,
  contactReplies: 0,
  canAccessTeachers: false,
  focusCourse: null,
  focusGame: null,
};
