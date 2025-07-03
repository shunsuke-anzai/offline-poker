import type { NextPage } from 'next';
import Link from 'next/link';

const HomePage: NextPage = () => {
  return (
    // font-cinzelクラスを適用
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-cinzel">
      
      <div className="w-full max-w-xs mx-auto flex flex-col items-center">

        {/* タイトル */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold tracking-widest bg-gold-gradient bg-clip-text text-transparent">
            OFFLINE
          </h1>
          {/* タイトル間の線 */}
          <div className="w-2/3 h-px bg-gold-gradient mx-auto my-4"></div>
          <h1 className="text-6xl font-bold tracking-widest bg-gold-gradient bg-clip-text text-transparent">
            POKER
          </h1>
        </div>

        {/* ボタンコンテナ */}
        <div className="w-full flex flex-col space-y-8">
          <Link href="/make-room">
            {/* MAKE ROOM ボタン */}
            <button 
              className="w-full py-4 px-8 text-xl font-bold text-black bg-gold-gradient rounded-full shadow-gold transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-yellow-300/50 hover:-translate-y-1 focus:outline-none"
              >
              MAKE ROOM
            </button>
          </Link>
          <Link href="/search-room">
            {/* SEARCH ROOM ボタン */}
            <button 
              className="w-full py-4 px-8 text-xl font-bold text-black bg-gold-gradient rounded-full shadow-gold transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-yellow-300/50 hover:-translate-y-1 focus:outline-none"
              >
              SEARCH ROOM
            </button>
          </Link>

        </div>
      </div>
    </main>
  );
};

export default HomePage;