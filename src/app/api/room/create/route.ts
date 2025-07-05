// app/api/room/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // ここでSupabaseのサーバーサイドクライアントを初期化

// 環境変数からSupabaseのキーを取得（サーバーサイドでのみ安全に使用できるキー）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // publicキーは通常クライアント用だが、サーバーでも使える
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // より安全なservice_roleキー

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(request: Request) {
  try {
    const { max_members, stack, bb, keyword, playerName } =
      await request.json();

    if (!playerName || !bb || !keyword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const initialPlayerNames = [playerName.trim()];
    const roomData = {
      max_members: parseInt(max_members, 10),
      stack: parseInt(stack, 10),
      bb: parseInt(bb, 10),
      keyword,
      current_members: initialPlayerNames.length,
      status: "waiting",
      player_names: initialPlayerNames,
    };

    const { data, error } = await supabaseServer
      .from("rooms")
      .insert([roomData])
      .select();

    if (error) {
      console.error("Error creating room on server:", error);
      return NextResponse.json(
        { message: "Failed to create room", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { roomId: data[0].id, playerName: playerName },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
