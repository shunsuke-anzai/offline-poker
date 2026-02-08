"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: number; // IDは数値型
  max_members: number;
  current_members: number;
  stack: number;
  bb: number;
  created_at: string;
}

export default function SearchRoomPage() {
  const [name, setName] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [searchedRooms, setSearchedRooms] = useState<Room[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const labelClasses = "text-yellow-400 text-3xl font-semibold";
  const inputBaseClasses =
    "bg-transparent border-2 border-yellow-400 text-yellow-400 text-center text-xl focus:outline-none focus:ring-2 focus:ring-yellow-300";
  const buttonClasses =
    "w-full py-4 px-8 text-xl font-bold text-black bg-gold-gradient rounded-full shadow-gold transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-yellow-300/50 hover:-translate-y-1 focus:outline-none";

  const handleSearch = async () => {
    if (name.trim() === "" || keyword.trim() === "") {
      alert("「NAME」と「KEY WORD」は入力必須項目です。");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchedRooms([]);

    try {
      const response = await fetch("/api/room/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "ルームの検索に失敗しました。");
      }

      setSearchedRooms(result.rooms);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRoom = (roomId: number) => {
    if (name.trim() === "") {
      alert("参加するための「NAME」を入力してください。");
      return;
    }
    router.push(
      `/waiting-room?roomId=${roomId}&playerName=${encodeURIComponent(
        name.trim()
      )}`
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-black p-4 font-cinzel pt-20">
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-10">
        {/* NAME */}
        <div className="w-full flex flex-col items-center space-y-4">
          <label htmlFor="name" className={labelClasses}>
            NAME
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            className={`${inputBaseClasses} rounded-full w-64 h-12 px-4`}
          />
        </div>

        {/* KEY WORD */}
        <div className="w-full flex flex-col items-center space-y-4">
          <label htmlFor="keyword" className={labelClasses}>
            KEY WORD
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setKeyword(e.target.value)
            }
            className={`${inputBaseClasses} rounded-full w-full h-12 px-4`}
          />
        </div>

        {/* SEARCH ボタン */}
        <div className="w-full flex justify-center pt-8">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className={`${buttonClasses} w-64 h-16`}
          >
            {isSearching ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        {/* 検索結果表示 */}
        <div className="w-full mt-10 space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          {searchedRooms.length > 0 && (
            <div>
              <h2 className="text-yellow-400 text-2xl font-semibold text-center mb-4">
                SEARCH RESULTS
              </h2>
              {searchedRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 bg-gray-800 rounded-lg flex justify-between items-center"
                >
                  <div>
                    {/* 修正点: room.idを文字列に変換してからsubstringを呼び出す */}
                    <p className="text-yellow-400">
                      Room ID: {String(room.id)}
                    </p>
                    <p className="text-white">
                      Players: {room.current_members} / {room.max_members}
                    </p>
                    <p className="text-white">BB: {room.bb}</p>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="py-2 px-4 bg-yellow-400 text-black rounded-full font-bold hover:bg-yellow-300"
                  >
                    JOIN
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RETURN ボタン */}
        <div className="w-full flex justify-center pt-4">
          <Link
            href="/"
            className="w-64 h-16 flex items-center justify-center rounded-full border-2 border-yellow-400 text-yellow-400 text-xl font-bold transition-colors hover:bg-yellow-400 hover:text-black"
          >
            RETURN
          </Link>
        </div>
      </div>
    </main>
  );
}
