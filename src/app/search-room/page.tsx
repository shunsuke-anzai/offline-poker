'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type MouseEvent } from 'react';

export default function SearchRoomPage() {
  const [name, setName] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  const labelClasses = "text-yellow-400 text-3xl font-semibold";
  const inputBaseClasses = "bg-transparent border-2 border-yellow-400 text-yellow-400 text-center text-xl focus:outline-none focus:ring-2 focus:ring-yellow-300";
  const buttonClasses = "w-full py-4 px-8 text-xl font-bold text-black bg-gold-gradient rounded-full shadow-gold transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-yellow-300/50 hover:-translate-y-1 focus:outline-none";

  const handleSearch = (event: MouseEvent<HTMLButtonElement>) => {
    if (name.trim() === '' || keyword.trim() === '') {
      alert('「NAME」と「KEY WORD」は入力必須項目です。');
      return;
    }
    // ここに検索ロジックを実装します
    console.log("Searching for room with:", { name, keyword });
    alert(`「${name}」と「${keyword}」でルームを検索中...`);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'name') {
      setName(value);
    } else if (id === 'keyword') {
      setKeyword(value);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-10">
        {/* NAME */}
        <div className="w-full flex flex-col items-center space-y-4">
          <label htmlFor="name" className={labelClasses}>NAME</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleInputChange}
            className={`${inputBaseClasses} rounded-full w-64 h-12 px-4`}
          />
        </div>

        {/* KEY WORD */}
        <div className="w-full flex flex-col items-center space-y-4">
          <label htmlFor="keyword" className={labelClasses}>KEY WORD</label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={handleInputChange}
            className={`${inputBaseClasses} rounded-full w-full h-12 px-4`}
          />
        </div>

        {/* SEARCH ボタン */}
        <div className="w-full flex justify-center pt-8">
          <button
            type="button"
            onClick={handleSearch}
            className={`${buttonClasses} w-64 h-16`}
          >
            SEARCH
          </button>
        </div>
        
        {/* RETURN ボタン (任意: トップページに戻るためのボタン) */}
        <div className="w-full flex justify-center pt-4">
          <Link href="/" className="w-64 h-16 flex items-center justify-center rounded-full border-2 border-yellow-400 text-yellow-400 text-xl font-bold transition-colors hover:bg-yellow-400 hover:text-black">
              RETURN
          </Link>
        </div>
      </div>
    </main>
  );
}