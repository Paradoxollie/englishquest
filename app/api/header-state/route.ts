import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { getHeaderState } from "@/lib/navigation/header-state";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await getServerUser();
  const headerState = await getHeaderState(user?.id ?? null);
  return NextResponse.json(headerState);
}
