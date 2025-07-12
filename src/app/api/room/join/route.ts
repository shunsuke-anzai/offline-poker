import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // ここでSupabaseのサーバーサイドクライアントを初期化

// 環境変数からSupabaseのキーを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(request: Request) {
  try {
    const { roomId, playerName } = await request.json();

    if (!roomId || !playerName) {
      return NextResponse.json(
        { message: "Room ID or Player Name is missing." },
        { status: 400 }
      );
    }

    // まず現在のルーム情報を取得
    const { data: room, error: fetchError } = await supabaseServer
      .from("rooms")
      .select("player_names, max_members, current_members")
      .eq("id", roomId)
      .single();

    if (fetchError || !room) {
      console.error("Error fetching room for join:", fetchError);
      return NextResponse.json(
        { message: "Room not found or error fetching room data." },
        { status: 404 }
      );
    }

    // バリデーション
    if (room.player_names.includes(playerName.trim())) {
      return NextResponse.json(
        { message: "Player name already exists in this room." },
        { status: 409 } // Conflict
      );
    }
    if (room.current_members >= room.max_members) {
      return NextResponse.json(
        { message: "Room is full." },
        { status: 410 } // Gone (Resource no longer available)
      );
    }

    // プレイヤー名を追加して更新
    const updatedPlayerNames = [...room.player_names, playerName.trim()];
    const { data, error } = await supabaseServer
      .from("rooms")
      .update({
        player_names: updatedPlayerNames,
        current_members: updatedPlayerNames.length,
      })
      .eq("id", roomId)
      .select(); // 更新されたデータを返す

    if (error) {
      console.error("Error updating room on server:", error);
      return NextResponse.json(
        { message: "Failed to join room.", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully joined room.", room: data[0] },
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
