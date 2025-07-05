'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // RealtimePayloadの型をインポート

interface Room {
  id: string;
  max_members: number;
  stack: number;
  bb: number;
  keyword: string;
  current_members: number;
  status: string;
  player_names: string[];
  created_at: string;
}

export default function WaitingRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  // const creatorPlayerName = searchParams.get('playerName'); // 現在は使用しないためコメントアウト

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [joinPlayerName, setJoinPlayerName] = useState<string>(''); // 新しく参加するプレイヤー名

  useEffect(() => {
    if (!roomId) {
      console.error('Room ID is missing.');
      router.push('/'); // ルームIDがない場合はホームへリダイレクト
      return;
    }

    const fetchRoom = async () => {
      setLoading(true);
      try {
        // ルーム情報の取得をAPIルート経由で行う
        const response = await fetch(`/api/room/${roomId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'ルーム情報の取得に失敗しました。');
        }

        setRoom(result.room); // APIからのレスポンスのroomオブジェクトを使用
      } catch (error: any) {
        console.error('Error fetching room via API:', error.message);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    // リアルタイムリスナーを設定 (部屋の状態をリアルタイムで監視するため、supabaseクライアントは引き続き使用)
    const channel = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
      }, (payload: RealtimePostgresChangesPayload<Room>) => { // ここを修正: payloadに型を指定
        console.log('Room update received:', payload);
        setRoom(payload.new as Room); // 最新の部屋情報で状態を更新
      })
      .subscribe();

    // クリーンアップ関数
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, router]);

  const handleJoinRoom = async () => {
    if (!roomId || !joinPlayerName.trim()) {
      alert('プレイヤー名を入力してください。');
      return;
    }

    if (room) {
      const requestData = {
        roomId,
        playerName: joinPlayerName.trim(),
      };

      try {
        const response = await fetch('/api/room/join', { // 新しいAPIルートを呼び出す
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'ルームへの参加に失敗しました。');
        }

        // 成功時の処理（リアルタイムリスナーがroom状態を更新してくれるはず）
        setJoinPlayerName('');
        alert('ルームに参加しました！');

      } catch (error: any) {
        console.error('Error joining room via API:', error.message);
        alert(`ルームへの参加中にエラーが発生しました: ${error.message}`);
      }
    }
  };

  const canStartGame = room && room.current_members === room.max_members && room.current_members > 1; // 2人以上で満員なら開始可能

  const handleStartGame = () => {
    if (canStartGame) {
      // TODO: ゲーム開始の処理を実装（例: /game ページへの遷移、ルームステータスの変更など）
      console.log('Game started for room:', roomId);
      alert('ゲームを開始します！');
      // router.push('/game-start'); // ゲーム画面へ遷移する場合
    } else {
      alert('参加者が揃っていません。');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
        <p className="text-yellow-400 text-3xl font-semibold">ルーム情報を読み込み中...</p>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
        <p className="text-red-400 text-3xl font-semibold">指定されたルームは見つかりませんでした。</p>
        <Link href="/" className="mt-8 px-6 py-3 rounded-full border-2 border-yellow-400 text-yellow-400 text-lg font-bold transition-colors hover:bg-yellow-400 hover:text-black">
          ホームに戻る
        </Link>
      </main>
    );
  }

  // プレイヤー名表示スロットを動的に生成
  const playerSlots = Array.from({ length: room.max_members }, (_, index) => (
    <div key={index} className="w-full py-3 px-6 bg-gray-800 rounded-full text-center text-lg font-semibold border-2 border-transparent">
      {room.player_names[index] ? (
        <span className="text-yellow-400">{room.player_names[index]}</span>
      ) : (
        <span className="text-gray-500">参加者募集中 ({index + 1}/{room.max_members})</span>
      )}
    </div>
  ));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
      <div className="w-full max-w-md flex flex-col items-center space-y-6 pt-8">
        <h1 className="text-yellow-400 text-4xl sm:text-5xl font-bold tracking-wider mb-8">
          WAITING ROOM
        </h1>

        {playerSlots}

        {/* プレイヤー参加用入力欄とボタン */}
        {room.current_members < room.max_members && ( // 部屋が満員でない場合のみ表示
          <div className="w-full flex flex-col items-center space-y-4 mt-4">
            <input
              type="text"
              placeholder="あなたのプレイヤー名を入力"
              value={joinPlayerName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setJoinPlayerName(e.target.value)}
              className="w-full py-3 px-6 bg-transparent border-2 border-yellow-400 rounded-full text-yellow-400 text-center text-lg font-semibold focus:outline-none"
            />
            <button
              onClick={handleJoinRoom}
              className="w-48 py-3 bg-yellow-400 text-black rounded-full text-lg font-bold shadow-md transition-colors hover:bg-yellow-300 focus:outline-none"
            >
              参加する
            </button>
          </div>
        )}

        {/* START ボタン */}
        <button
          onClick={handleStartGame}
          disabled={!canStartGame}
          className={`w-full py-4 text-xl font-bold text-black bg-gold-gradient rounded-full shadow-gold transition-all duration-300 ease-in-out ${
            canStartGame ? 'hover:shadow-lg hover:shadow-yellow-300/50 hover:-translate-y-1 focus:outline-none' : 'opacity-50 cursor-not-allowed'
          } mt-8`}
        >
          START
        </button>

        {/* ホームに戻るボタン */}
        <Link href="/" className="mt-4 px-6 py-3 rounded-full border-2 border-yellow-400 text-yellow-400 text-lg font-bold transition-colors hover:bg-yellow-400 hover:text-black">
          ホームに戻る
        </Link>
      </div>
    </main>
  );
}