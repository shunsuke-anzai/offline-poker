'use client'; 

import Link from 'next/link';
import { useState, type ChangeEvent, type MouseEvent } from 'react';

export default function MakeRoomPage() {
  const [name, setName] = useState<string>('');
  const [members, setMembers] = useState<string>('2');
  const [stack, setStack] = useState<string>('50');
  const [bb, setBb] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  const labelClasses = "text-yellow-400 text-3xl font-semibold";
  const inputBaseClasses = "bg-transparent border-2 border-yellow-400 text-yellow-400 text-center text-xl focus:outline-none focus:ring-2 focus:ring-yellow-300";

  const handleMakeRoom = (event: MouseEvent<HTMLButtonElement>) => {
    if (name.trim() === '' || bb.trim() === '' || keyword.trim() === '') {
      alert('「NAME」「BB」「KEY WORD」は入力必須項目です。');
      return; 
    }

    const roomData = { name, members, stack, bb, keyword };
    console.log("Room Data Submitted:", roomData); 
    alert(`ルームが作成されました！\nデータ: ${JSON.stringify(roomData, null, 2)}`);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    switch (id) {
      case 'name':
        setName(value);
        break;
      case 'members':
        setMembers(value);
        break;
      case 'stack':
        setStack(value);
        break;
      case 'bb':
        setBb(value);
        break;
      case 'keyword':
        setKeyword(value);
        break;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
      
      <form className="w-full max-w-md mx-auto flex flex-col items-center space-y-10">

        <div className="w-full space-y-6">
          {/* NAME */}
          <div className="flex items-center justify-between">
            <label htmlFor="name" className={labelClasses}>NAME</label>
            <input id="name" type="text" value={name} onChange={handleInputChange} className={`${inputBaseClasses} rounded-full w-48 h-12 px-4`} />
          </div>

          {/* MEMBERS */}
          <div className="flex items-center justify-between">
            <label htmlFor="members" className={labelClasses}>MEMBERS</label>
            <div className="relative">
              <select id="members" value={members} onChange={handleInputChange} className={`${inputBaseClasses} rounded-full w-24 h-12 appearance-none pr-10`}>
                <option className="bg-black text-white" value="2">2</option>
                <option className="bg-black text-white" value="3">3</option>
                <option className="bg-black text-white" value="4">4</option>
                <option className="bg-black text-white" value="5">5</option>
                <option className="bg-black text-white" value="6">6</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="fill-current h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* スタック */}
          <div className="flex items-center justify-between">
            <label htmlFor="stack" className={labelClasses}>スタック</label>
            <div className="relative">
              <select id="stack" value={stack} onChange={handleInputChange} className={`${inputBaseClasses} rounded-full w-48 h-12 appearance-none px-4`}>
                <option className="bg-black text-white" value="50">50 BB</option>
                <option className="bg-black text-white" value="80">80 BB</option>
                <option className="bg-black text-white" value="100">100 BB</option>
                <option className="bg-black text-white" value="150">150 BB</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="fill-current h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* BB */}
          <div className="flex items-center justify-between">
            <label htmlFor="bb" className={labelClasses}>BB</label>
            <input id="bb" type="number" value={bb} onChange={handleInputChange} className={`${inputBaseClasses} rounded-full w-48 h-12 px-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
          </div>
        </div>

        {/* KEY WORD のセクション */}
        <div className="w-full flex flex-col items-center space-y-4">
          <label htmlFor="keyword" className={labelClasses}>KEY WORD</label>
          <input id="keyword" type="text" value={keyword} onChange={handleInputChange} className={`${inputBaseClasses} rounded-full w-full h-12 px-4`} />
        </div>

        {/* RETURN, MAKE ボタンのセクション */}
        <div className="w-full flex justify-center items-center gap-8 pt-8">
          <Link href="/" className="w-32 h-32">
            <div className="w-full h-full rounded-full border-2 border-yellow-400 text-yellow-400 flex items-center justify-center text-2xl font-bold transition-colors hover:bg-yellow-400 hover:text-black">
              RETURN
            </div>
          </Link>
          <button type="button" onClick={handleMakeRoom} className="w-32 h-32 rounded-full border-2 border-yellow-400 text-yellow-400 flex items-center justify-center text-2xl font-bold transition-colors hover:bg-yellow-400 hover:text-black">
            MAKE
          </button>
        </div>
      </form>
    </main>
  );
}