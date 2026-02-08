import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 環境変数からSupabaseのキーを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(request: Request) {
  try {
    const { roomId, playerName } = await request.json();

    if (!roomId || !playerName) {
      return NextResponse.json(
        { message: "ルームIDまたはプレイヤー名がありません。" },
        { status: 400 }
      );
    }

    // 作成したPostgreSQL関数を呼び出す
    const { data, error } = await supabaseServer.rpc("append_player_to_room", {
      p_room_id: roomId,
      p_player_name: playerName.trim(),
    });

    if (error) {
      console.error("RPCエラー:", error);
      // DB関数からのエラーメッセージをクライアントに返す
      return NextResponse.json(
        { message: error.message || "ルームへの参加に失敗しました。" },
        { status: 400 } // 「満員です」などのエラーは400番台が適切
      );
    }

    // RPCは配列を返すので、最初の要素を取得
    if (!data || data.length === 0) {
      throw new Error("ルーム情報の更新に失敗しました。");
    }
    const updatedRoom = data[0];

    return NextResponse.json(
      { message: "ルームに成功しました。", room: updatedRoom },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("APIエラー:", error);
    return NextResponse.json(
      { message: error.message || "サーバー内部エラー" },
      { status: 500 }
    );
  }
}
