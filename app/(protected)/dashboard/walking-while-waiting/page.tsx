import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import GameScene from "./game-scene";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WalkingWhileWaitingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Restrict access to admins only
  if (!(await isAdmin())) {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 text-outline">Walking While Waiting</h1>
        <p className="text-slate-300">
          Ollie vous accompagne.
        </p>
      </div>

      <GameScene />
    </section>
  );
}
