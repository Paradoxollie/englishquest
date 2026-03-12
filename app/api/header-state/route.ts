import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getHeaderState } from "@/lib/navigation/header-state";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headerState = await getHeaderState(user?.id ?? null);
  return NextResponse.json(headerState);
}
