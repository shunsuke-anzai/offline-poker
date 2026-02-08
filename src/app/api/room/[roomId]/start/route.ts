import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(
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
    // 実際にはホストかどうかを確認するロジックが必要ですが、ここでは省略します。
    // 例：リクエストに認証情報を含め、player_names[0]と一致するか確認するなど
    const { data, error } = await supabaseServer
      .from("rooms")
      .update({ status: "playing" })
      .eq("id", roomId)
      .select();

    if (error) {
      console.error("Error starting game:", error);
      return NextResponse.json(
        { message: "Failed to start game.", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Game started successfully.", room: data[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
