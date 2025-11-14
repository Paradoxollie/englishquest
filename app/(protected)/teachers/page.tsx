import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TeachersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    redirect("/");
  }

  return (
    <section className="space-y-4 text-slate-200">
      <div>
        <h2 className="text-2xl font-semibold text-white">Teachers</h2>
        <p className="text-sm text-slate-400">
          Curate lesson plans, printable missions, and class leaderboards here for French teachers.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-slate-300">
        <p>
          Hi {profile.username}, you&apos;re seeing the teacher tools preview because your role is{" "}
          <span className="font-semibold text-amber-300">{profile.role}</span>. Once we ship the full teacher CMS, this
          area will host downloadable resources, quest pacing guides, and class dashboards.
        </p>
      </div>
    </section>
  );
}

