import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { message: "Keyword is required" },
        { status: 400 }
      );
    }

    // waiting状態のルームのみを検索対象とする
    const { data: rooms, error } = await supabaseServer
      .from("rooms")
      .select("id, max_members, current_members, stack, bb, created_at")
      .eq("keyword", keyword)
      .eq("status", "waiting");

    if (error) {
      console.error("Error searching rooms:", error);
      return NextResponse.json(
        { message: "Failed to search rooms", error: error.message },
        { status: 500 }
      );
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json(
        { message: "No rooms found with the specified keyword." },
        { status: 404 }
      );
    }

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
