export type ProfileRole = "student" | "teacher" | "admin";

export type Profile = {
  id: string;
  username: string;
  role: ProfileRole;
  xp: number;
  gold: number;
  level: number;
  avatar_id: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

