import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;

  if (!roomId) {
    return NextResponse.json(
      { message: "Room ID is missing." },
      { status: 400 }
    );
  }

  try {
    const { data: room, error } = await supabaseServer
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single(); // 単一の部屋情報を取得

    if (error || !room) {
      console.error("Error fetching room on server:", error);
      return NextResponse.json(
        { message: "Room not found or error fetching room data." },
        { status: 404 }
      );
    }

    return NextResponse.json({ room }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
