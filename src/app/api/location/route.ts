import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const key = searchParams.get("key");

  if (key !== process.env.LOCATION_API_KEY || isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await supabase.from("locations").insert({ lat, lng });
  return NextResponse.json({ ok: true });
}