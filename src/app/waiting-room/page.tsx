"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

interface Room {
  id: number;
  max_members: number;
  current_members: number;
  status: string;
  player_names: string[];
}

function WaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const playerNameFromUrl = searchParams.get("playerName");

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // URLにplayerNameが含まれていたら自動で参加するロジック
  useEffect(() => {
    if (room && playerNameFromUrl && !isJoining) {
      const isPlayerInRoom = room.player_names.includes(playerNameFromUrl);

      // プレイヤーがまだルームにいない場合、参加処理を開始
      if (!isPlayerInRoom) {
        const joinRoom = async () => {
          setIsJoining(true);
          try {
            const response = await fetch("/api/room/join", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId, playerName: playerNameFromUrl }),
            });
            const result = await response.json();
            if (!response.ok) {
              throw new Error(result.message || "参加に失敗しました。");
            }
            // 成功した場合、リアルタイム更新がUIを更新する
          } catch (err: any) {
            console.error("Auto-join error:", err);
            alert(`参加エラー: ${err.message}`);
            setError(err.message);
          } finally {
            setIsJoining(false);
          }
        };
        joinRoom();
      }
    }
  }, [room, playerNameFromUrl, roomId, isJoining]);

  // ルーム情報を取得し、リアルタイム更新を購読する
  useEffect(() => {
    if (!roomId) {
      router.push("/");
      return;
    }

    const fetchRoom = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/room/${roomId}`);
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Failed to fetch room");
        setRoom(result.room);
      } catch (err: any) {
        console.error("Error fetching room:", err.message);
        setRoom(null);
        setError("ルームの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    const channel = supabase
      .channel(`room_${roomId}`)
      .on<Room>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as Room;
          setRoom(updatedRoom);
          if (updatedRoom.status === "playing") {
            router.push(`/game/${roomId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, router]);

  const handleStartGame = async () => {
    // 現在のプレイヤーがホスト（リストの最初のプレイヤー）か確認
    if (
      !room ||
      !playerNameFromUrl ||
      room.player_names[0] !== playerNameFromUrl
    ) {
      alert("ホストのみがゲームを開始できます。");
      return;
    }
    if (room.current_members >= 2) {
      try {
        await fetch(`/api/room/${roomId}/start`, { method: "POST" });
        // リアルタイム更新がゲーム画面への遷移を処理する
      } catch (err: any) {
        alert(`エラー: ${err.message}`);
      }
    } else {
      alert("2人以上の参加者が必要です。");
    }
  };

  if (loading) return <LoadingFallback />;
  if (!room || error)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
        <p className="text-red-400 text-3xl font-semibold">
          {error || "ルームが見つかりません。"}
        </p>
        <Link
          href="/"
          className="mt-8 px-6 py-3 rounded-full border-2 border-yellow-400 text-yellow-400 text-lg font-bold transition-colors hover:bg-yellow-400 hover:text-black"
        >
          ホームに戻る
        </Link>
      </main>
    );

  const playerSlots = Array.from({ length: room.max_members }, (_, index) => (
    <div
      key={index}
      className="w-full py-3 px-6 bg-gray-800 rounded-full text-center text-lg font-semibold border-2 border-transparent"
    >
      {room.player_names[index] ? (
        <span className="text-yellow-400">{room.player_names[index]}</span>
      ) : (
        <span className="text-gray-500">参加者募集中...</span>
      )}
    </div>
  ));

  const isHost = playerNameFromUrl === room.player_names[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
      <div className="w-full max-w-md flex flex-col items-center space-y-6 pt-8">
        <h1 className="text-yellow-400 text-4xl sm:text-5xl font-bold tracking-wider mb-8">
          WAITING ROOM
        </h1>

        {playerSlots}

        {isJoining && <p className="text-yellow-400 mt-4">参加処理中...</p>}

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={room.current_members < 2}
            className={`w-full py-4 text-xl font-bold text-black bg-gold-gradient rounded-full shadow-gold transition-all duration-300 ease-in-out mt-8 ${
              room.current_members >= 2
                ? "hover:shadow-lg hover:shadow-yellow-300/50 hover:-translate-y-1"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            START
          </button>
        )}

        <Link
          href="/"
          className="mt-4 px-6 py-3 rounded-full border-2 border-yellow-400 text-yellow-400 text-lg font-bold transition-colors hover:bg-yellow-400 hover:text-black"
        >
          ホームに戻る
        </Link>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
      <p className="text-yellow-400 text-3xl font-semibold">読み込み中...</p>
    </main>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WaitingRoomContent />
    </Suspense>
  );
}
