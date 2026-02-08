import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServer = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export async function POST(request: Request) {
  try {
    const { playerName, maxMembers, stack, bb, keyword } = await request.json();

    if (!playerName || !maxMembers || !stack || !bb || !keyword) {
      return NextResponse.json(
        { message: "すべてのフィールドを入力してください。" },
        { status: 400 }
      );
    }

    

    // 新しく作成したRPC関数を呼び出す
    const { data, error } = await supabaseServer.rpc(
      "create_room_and_add_host",
      {
        p_player_name: playerName,
        p_max_members: maxMembers,
        p_stack: stack,
        p_bb: bb,
        p_keyword: keyword,
      }
    );

    if (error) {
      console.error("RPC create_room_and_add_host error:", error);
      return NextResponse.json(
        { message: error.message || "ルームの作成に失敗しました。" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "ルームの作成に失敗しました(データなし)。" },
        { status: 500 }
      );
    }
    // RPCは配列を返すので、最初の要素を取得する
    const newRoom = data[0];

    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "サーバー内部エラーです。" },
      { status: 500 }
    );
  }
}
