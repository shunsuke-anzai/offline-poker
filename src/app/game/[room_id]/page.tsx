'use client';

import React, { useState, useMemo, useEffect } from 'react';


// --- 型定義 ---
export type Player = {
  id: string;
  name: string;
  stack: number;
  isBB: boolean;
  isTurn: boolean;
  seatIndex: number;
  visualSeatIndex?: number;
  // アクション機能用のプロパティ
  hasFolded: boolean;
  currentBet: number; // このラウンドでのベット額
  lastAction?: string; // 最後に行ったアクション（表示用）
  isAllIn?: boolean; // ALL-IN状態かどうか
};

type ModalState = {
  type: 'none' | 'bet' | 'showdown' | 'next-hand';
  data?: any;
};

type GameStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';


// --- 定数 ---
const SEAT_POSITIONS: { [key: number]: string } = {
  0: 'bottom-[1%] left-1/2 -translate-x-1/2',
  1: 'bottom-1/3 left-2 translate-y-1/2',
  2: 'top-1/3 left-2 -translate-y-1/2',
  3: 'top-[1%] left-1/2 -translate-x-1/2',
  4: 'top-1/3 right-2 -translate-y-1/2',
  5: 'bottom-1/3 right-2 translate-y-1/2',
};

const MY_USER_ID = 'user-1';

// --- ゲーム設定 ---
const BB_SIZE = 10; // ビッグブラインドのサイズ

// --- 初期データ ---
const initialPlayersFromDB: Omit<Player, 'hasFolded' | 'currentBet' | 'lastAction' | 'isBB' | 'isTurn'>[] = [
  { id: 'user-4', name: 'ゆうき', stack: 300, seatIndex: 0 },
  { id: 'user-1', name: 'たけし', stack: 185, seatIndex: 2 },
  { id: 'user-2', name: 'さやか', stack: 210, seatIndex: 3 },
  { id: 'user-3', name: 'けんじ', stack: 150, seatIndex: 5 },
];

// --- カスタムフック ---
const useRelativePlayerPositions = (players: Player[], myUserId: string): Player[] => {
  return useMemo(() => {
    const mainPlayer = players.find(p => p.id === myUserId);
    if (!mainPlayer) return players;

    const mainPlayerDbSeatIndex = mainPlayer.seatIndex;
    const totalSeats = 6;

    return players.map(player => {
      const offset = player.seatIndex - mainPlayerDbSeatIndex;
      const visualSeatIndex = (offset + totalSeats) % totalSeats;
      return { ...player, visualSeatIndex };
    });
  }, [players, myUserId]);
};


// --- 子コンポーネント ---

const PlayerDisplay = ({ player, isMainPlayer }: { player: Player, isMainPlayer: boolean }) => {
  const turnHighlightClass = player.isTurn ? 'shadow-yellow-400 shadow-[0_0_20px]' : '';
  const foldedClass = player.hasFolded ? 'opacity-40 grayscale' : '';
  const boxSizeClass = isMainPlayer ? 'px-10 py-7' : 'px-4 py-2';
  const nameSizeClass = isMainPlayer ? 'text-4xl' : 'text-lg';
  const stackSizeClass = isMainPlayer ? 'text-4xl' : 'text-xl';
  const borderClass = player.isAllIn ? 'border-red-600' : 'border-yellow-400';

  return (
    <div className={`relative flex items-center justify-center transition-all duration-300 ${foldedClass}`}>
      <img
        src="/pokerstack.png"
        alt="Poker Chip Stack"
        className="absolute left-1/2 top-0 w-40 h-32 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none"
        draggable={false}
      />      
      <div className={`relative z-10 bg-black border-2 ${borderClass} rounded-2xl text-center shadow-lg transition-all duration-300 ${boxSizeClass} ${turnHighlightClass}`}>
        <p className={`text-white font-bold ${nameSizeClass}`}>{player.name}</p>
        <p className={`text-yellow-400 font-bold ${stackSizeClass}`}>{player.stack}</p>
        {player.isBB && !player.hasFolded && (
          <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">BB</div>
        )}
        {/* アクション表示 */}
        {player.lastAction && (
          <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 \
            font-bold px-3 py-1 rounded-full border-2 border-gray-400 shadow-md \
            ${player.lastAction.startsWith('RAISE') || player.lastAction.startsWith('BET') ? 'text-red-400' : player.lastAction.startsWith('CALL') ? 'text-white' : player.lastAction.startsWith('ALL-IN') ? 'text-red-400' : 'text-white'} \
            text-sm`}>
            {player.lastAction}
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButtons = ({ currentBet, onAction, player }: { currentBet: number, onAction: (action: string, amount?: number) => void, player?: Player }) => {
  if (!player || player.isAllIn) return null; // オールイン者はアクション不可

  const hasBet = currentBet > 0;
  const isBBWithNoRaise = player?.isBB && player?.currentBet === currentBet && currentBet > 0;
  const callAmount = player ? currentBet - player.currentBet : 0;
  const isAllInSituation = player && hasBet && callAmount >= player.stack;

  if (isAllInSituation) {
    return (
      <div className="flex justify-center gap-3 w-full px-4 max-w-md mt-2">
        <button onClick={() => onAction('fold')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Fold</button>
        <button onClick={() => onAction('allin')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">ALL-IN</button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 w-full px-4 max-w-md mt-2">
      {hasBet && (
        <button onClick={() => onAction('fold')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Fold</button>
      )}
      {hasBet ? (
        <>
          {isBBWithNoRaise ? (
            <button onClick={() => onAction('check')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Check</button>
          ) : (
            <button onClick={() => onAction('call')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Call</button>
          )}
          <button onClick={() => onAction('raise')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Raise</button>
        </>
      ) : (
        <>
          <button onClick={() => onAction('check')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Check</button>
          <button onClick={() => onAction('bet')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg flex-1 transition-transform transform hover:scale-105">Bet</button>
        </>
      )}
    </div>
  );
};

const Modal = ({ modalState, setModal, onSubmitBet, onSelectWinner, onNextHand }: { modalState: ModalState, setModal: (state: ModalState) => void, onSubmitBet: (amount: number) => void, onSelectWinner: (winnerIds: string[]) => void, onNextHand: () => void }) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);

  useEffect(() => {
    // ショーダウンモーダルが開くたびにリセット
    if (modalState.type === 'showdown') setSelectedWinners([]);
  }, [modalState.type]);

  if (modalState.type === 'none') return null;

  const handleBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(betAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      onSubmitBet(amount);
    }
  };

  const handleWinnerToggle = (id: string) => {
    setSelectedWinners(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const handleWinnersOk = () => {
    if (selectedWinners.length > 0) {
      onSelectWinner(selectedWinners);
      setSelectedWinners([]);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-yellow-500 text-white w-full max-w-sm">
        {modalState.type === 'bet' && (
          <form onSubmit={handleBetSubmit}>
            <h2 className="text-2xl font-bold text-center mb-4">INPUT YOUR BETTING</h2>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center text-2xl"
              autoFocus
            />
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setModal({ type: 'none' })} className="bg-gray-600 hover:bg-gray-700 w-full font-bold py-2 px-4 rounded-lg">キャンセル</button>
              <button type="submit" className="bg-red-600 hover:bg-red-700 w-full font-bold py-2 px-4 rounded-lg">決定</button>
            </div>
          </form>
        )}
        {modalState.type === 'showdown' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">WHO IS WINNER ?</h2>
            <div className="space-y-3 mb-4">
              {modalState.data.players.filter((p: Player) => !p.hasFolded).map((p: Player) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleWinnerToggle(p.id)}
                  className={`w-full font-bold py-3 px-4 rounded-lg border-2 transition-colors \
                    ${selectedWinners.includes(p.id) ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-800'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleWinnersOk}
              disabled={selectedWinners.length === 0}
              className={`w-full font-bold py-3 px-4 rounded-lg mt-2 \
                ${selectedWinners.length === 0 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >OK</button>
            <button onClick={() => setModal({ type: 'none' })} className="bg-gray-600 hover:bg-gray-700 w-full font-bold py-2 px-4 rounded-lg mt-4">キャンセル</button>
          </div>
        )}
        {modalState.type === 'next-hand' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">ハンド終了</h2>
            <p className="text-center mb-6">次のハンドを開始します</p>
            <button onClick={onNextHand} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
              次のハンドを開始
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// --- メインコンポーネント (ページ) ---
export default function PokerGamePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [gameStage, setGameStage] = useState<GameStage>('preflop');
  const [lastRaiserIndex, setLastRaiserIndex] = useState<number>(-1); // 最後にレイズ/ベットしたプレイヤーのインデックス
  const [bbSeatIndex, setBbSeatIndex] = useState<number>(5); // 現在のBBの席番号
  const [currentUserId, setCurrentUserId] = useState<string>(MY_USER_ID); // テスト用のユーザーID
  const [pendingNextTurnIndex, setPendingNextTurnIndex] = useState<number|null>(null);

  // ゲーム開始時にプレイヤーの状態を初期化
  useEffect(() => {
    startNewHand();
  }, []);

  useEffect(() => {
    if (pendingNextTurnIndex !== null) {
      handleNextTurn(pendingNextTurnIndex);
      setPendingNextTurnIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  const startNewHand = () => {
    setPot(0);
    setCurrentBet(BB_SIZE);
    setGameStage('preflop');
    setLastRaiserIndex(-1);
    
    const newPlayers = initialPlayersFromDB.map(p => {
      const isCurrentBB = p.seatIndex === bbSeatIndex;
      
      if (isCurrentBB) {
        // BBプレイヤーは最初からBBサイズをベット
        return {
          ...p,
          isBB: true,
          hasFolded: false,
          currentBet: BB_SIZE,
          lastAction: `BET ${BB_SIZE}`,
          stack: p.stack - BB_SIZE,
          isTurn: false, // 最初はBBの左隣からスタート
        };
      } else {
        return {
          ...p,
          isBB: false,
          hasFolded: false,
          currentBet: 0,
          lastAction: undefined,
          isTurn: false,
        };
      }
    });
    
    // BBの左隣のプレイヤーを見つけてターンを設定
    const bbPlayerIndex = newPlayers.findIndex(p => p.seatIndex === bbSeatIndex);
    let firstPlayerIndex = (bbPlayerIndex + 1) % newPlayers.length;
    
    // BBの左隣のプレイヤーにターンを設定
    newPlayers[firstPlayerIndex].isTurn = true;
    
    setPlayers(newPlayers);
    
    // BBプレイヤーのインデックスを記録（最初のベッター）
    //setLastRaiserIndex(bbPlayerIndex);
  };

  const getStageDisplayName = (stage: GameStage): string => {
    switch (stage) {
      case 'preflop': return 'PREFLOP';
      case 'flop': return 'FLOP';
      case 'turn': return 'TURN';
      case 'river': return 'RIVER';
      case 'showdown': return 'SHOWDOWN';
      default: return 'PREFLOP';
    }
  };

  const handleNextTurn = (currentPlayerIndex: number) => {
    // アクティブなプレイヤー（フォールド・ALL-INしていない）のリスト
    const activePlayers = players.filter(p => !p.hasFolded && !p.isAllIn);
    const showdownCandidates = players.filter(p => !p.hasFolded); // 勝者選択用
    const hasAllIn = players.some(p => p.isAllIn);
    
    // --- 修正: アクティブプレイヤーが1人かつALL-IN者がいる場合はショーダウンへ ---
    if (activePlayers.length <= 1 && hasAllIn && showdownCandidates.length > 1) {
      // 現在のベットをPOTに加算
      const finalPot = pot + players.reduce((sum, p) => sum + p.currentBet, 0);
      setPot(finalPot);
      setPlayers(players.map(p => ({...p, currentBet: 0})));
      setGameStage('showdown');
      setTimeout(() => {
        setModalState({ type: 'showdown', data: { players: showdownCandidates } });
      }, 500);
      return;
    }
    // --- 既存: アクティブプレイヤーが1人だけの場合は即勝利 ---
    if (activePlayers.length <= 1) {
      const winner = activePlayers[0] || showdownCandidates[0];
      const finalPot = pot + players.reduce((sum, p) => sum + p.currentBet, 0);
      setPot(finalPot);
      setPlayers(players.map(p => ({...p, currentBet: 0})));
      setTimeout(() => {
        alert(`${winner.name}が${finalPot}を獲得しました！`);
        setModalState({ type: 'next-hand' });
      }, 500);
      return;
    }

    // 次のプレイヤーを探す
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    // フォールドまたはALL-INしているプレイヤーはスキップ
    while (players[nextPlayerIndex].hasFolded || players[nextPlayerIndex].isAllIn) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }

    // ベッティングラウンドが完了したかチェック
    const hasAnyBet = currentBet > 0;
    // アクション済み判定もALL-IN者は除外
    const allPlayersActed = activePlayers.every(p => p.lastAction !== undefined);
    
    // デバッグ用ログ
    console.log('--- Round Check ---');
    console.log('gameStage:', gameStage);
    console.log('currentBet:', currentBet);
    console.log('hasAnyBet:', hasAnyBet);
    console.log('lastRaiserIndex:', lastRaiserIndex);
    console.log('allPlayersActed:', allPlayersActed);
    console.log('activePlayers actions:', activePlayers.map(p => ({ name: p.name, lastAction: p.lastAction })));
    
    let roundComplete = false;
    
    if (!hasAnyBet) {
      // ベットがない場合：全員がチェックしたら終了
      roundComplete = allPlayersActed && activePlayers.every(p => p.lastAction === 'CHECK');
    } else {
      // ベットがある場合の終了条件
      if (gameStage === 'preflop') {
        const bbPlayer = activePlayers.find(p => p.isBB);
        if (bbPlayer && bbPlayer.lastAction) {
          if (lastRaiserIndex === -1) {
            // 誰もレイズしていない場合：BBがcheckしたらラウンド終了
            roundComplete = (bbPlayer.lastAction === 'CHECK') && allPlayersActed;
            console.log("--- Round Complete Check : ", roundComplete);
          } else {
            // 誰かがレイズした場合：最後にレイズした人の手前のプレイヤーまで
            let playerBeforeRaiserIndex = (lastRaiserIndex - 1 + players.length) % players.length;
            while (players[playerBeforeRaiserIndex].hasFolded || players[playerBeforeRaiserIndex].isAllIn) {
              playerBeforeRaiserIndex = (playerBeforeRaiserIndex - 1 + players.length) % players.length;
            }
            roundComplete = currentPlayerIndex === playerBeforeRaiserIndex && activePlayers.every(p => p.currentBet === currentBet) && allPlayersActed;
          }
        }
      } else {
        // フロップ以降：最後にbet/raiseした人の手前のプレイヤーのアクション後に終了
       
        if (lastRaiserIndex !== -1) {
          // 誰かが実際にbet/raiseした場合（BBの初期bet以外）
          const allCalledOrFolded = activePlayers.every(p => p.currentBet === currentBet);
          
          let playerBeforeRaiserIndex = (lastRaiserIndex - 1 + players.length) % players.length;
          while (players[playerBeforeRaiserIndex].hasFolded || players[playerBeforeRaiserIndex].isAllIn) {
            playerBeforeRaiserIndex = (playerBeforeRaiserIndex - 1 + players.length) % players.length;
          }
          
          roundComplete = currentPlayerIndex === playerBeforeRaiserIndex && allCalledOrFolded && allPlayersActed; 
        } else {
          // 誰もbet/raiseしていない場合（全員チェック）
          roundComplete = allPlayersActed && activePlayers.every(p => p.lastAction === 'CHECK');
        }
      }
    }

    if (roundComplete) {
      // ベッティングラウンド終了
      const newPot = pot + players.reduce((sum, p) => sum + p.currentBet, 0);
      setPot(newPot);
      setPlayers(prevPlayers => prevPlayers.map(p => ({...p, currentBet: 0, lastAction: undefined, isTurn: false})));
      setCurrentBet(0);
      setLastRaiserIndex(-1);
      
      // 次のステージに進む
      const nextStage = getNextStage(gameStage);
      if (nextStage === 'showdown') {
        setGameStage(nextStage);
        setTimeout(() => {
          setModalState({ type: 'showdown', data: { players: activePlayers } });
        }, 500);
      } else {
        setGameStage(nextStage);
        
        // 新しいラウンドでは最初のアクティブプレイヤー（席順で最も若い番号）からスタート
        setTimeout(() => {
          setPlayers(prevPlayers => {
            const newPlayers = [...prevPlayers];
            
            // フロップ以降はBBから開始
            const bbPlayer = activePlayers.find(p => p.isBB);
            if (bbPlayer) {
              const bbPlayerIndex = newPlayers.findIndex(p => p.id === bbPlayer.id);
              newPlayers[bbPlayerIndex].isTurn = true;
            } else {
              // BBがフォールドしている場合は席順で最も若い番号から
              const activePlayersSorted = activePlayers.sort((a, b) => a.seatIndex - b.seatIndex);
              const firstActivePlayerIndex = newPlayers.findIndex(p => p.id === activePlayersSorted[0].id);
              newPlayers[firstActivePlayerIndex].isTurn = true;
            }
            
            return newPlayers;
          });
        }, 100);
        
        alert(`${getStageDisplayName(nextStage)}に進みます！`);
      }
      return;
    }
    
    setPlayers(currentPlayers => currentPlayers.map((p, index) => ({
      ...p,
      isTurn: index === nextPlayerIndex
    })));
  };

  const getNextStage = (currentStage: GameStage): GameStage => {
    switch (currentStage) {
      case 'preflop': return 'flop';
      case 'flop': return 'turn';
      case 'turn': return 'river';
      case 'river': return 'showdown';
      default: return 'showdown';
    }
  };

  const handleAction = (action: string, amount?: number) => {
    const currentPlayerIndex = players.findIndex(p => p.isTurn);
    if (currentPlayerIndex === -1) return;
    const currentPlayer = players[currentPlayerIndex];

    let newPlayers = [...players];
    let newCurrentBet = currentBet;
    let newLastRaiserIndex = lastRaiserIndex;

    switch (action) {
      case 'fold':
        newPlayers[currentPlayerIndex] = { 
          ...currentPlayer, 
          hasFolded: true, 
          isTurn: false,
          lastAction: 'FOLDED',
          isAllIn: false
        };
        break;
      case 'check':
        newPlayers[currentPlayerIndex] = {
          ...currentPlayer,
          lastAction: 'CHECK',
          isAllIn: false
        };
        break;
      case 'call': {
        const callAmount = currentBet - currentPlayer.currentBet;
        let isAllInNow = callAmount >= currentPlayer.stack;
        newPlayers[currentPlayerIndex] = {
          ...currentPlayer,
          stack: currentPlayer.stack - callAmount,
          currentBet: currentBet,
          lastAction: `CALL ${currentBet}`,
          isAllIn: isAllInNow
        };
        break;
      }
      case 'allin': {
        // ALL-INはコール額が足りない場合のCALLと同じ扱い
        const callAmount = currentBet - currentPlayer.currentBet;
        // 既にALL-IN状態なら何もしない
        if (currentPlayer.isAllIn) return;
        // 残りスタック全額をベット
        const allinAmount = currentPlayer.stack;
        // コール額が足りない場合のみALL-IN
        let isAllInNow = true;
        let newBet = currentPlayer.currentBet + allinAmount;
        newPlayers[currentPlayerIndex] = {
          ...currentPlayer,
          stack: 0,
          currentBet: newBet,
          lastAction: `ALL-IN ${newBet}`,
          isAllIn: isAllInNow
        };
        // ラウンド進行上はCALLと同じ扱い（レイズ扱いしない）
        break;
      }
      case 'bet':
      case 'raise':
        if (amount === undefined) {
            setModalState({ type: 'bet' });
            return;
        }
        const betAmount = amount;
        newCurrentBet = betAmount;
        newLastRaiserIndex = currentPlayerIndex;
        newPlayers[currentPlayerIndex] = {
          ...currentPlayer,
          stack: currentPlayer.stack - betAmount,
          currentBet: betAmount,
          lastAction: action === 'bet' ? `BET ${betAmount}` : `RAISE ${betAmount}`,
          isAllIn: false
        };
        break;
    }
    setPlayers(newPlayers);
    setCurrentBet(newCurrentBet);
    setLastRaiserIndex(newLastRaiserIndex);
    setPendingNextTurnIndex(currentPlayerIndex);
  };

  const handleSubmitBet = (amount: number) => {
    setModalState({ type: 'none' });
    handleAction(currentBet > 0 ? 'raise' : 'bet', amount);
  };
  
  const handleWinnerSelected = (winnerIds: string[]) => {
    setModalState({ type: 'none' });
    if (!winnerIds || winnerIds.length === 0) return;
    const winners = players.filter(p => winnerIds.includes(p.id));
    if (winners.length === 0) return;
    const share = Math.floor(pot / winners.length);
    let remainder = pot % winners.length;
    // BBの左隣から順に端数を配る
    const bbPlayer = players.find(p => p.isBB);
    let order: Player[] = [];
    if (bbPlayer) {
      let idx = players.findIndex(p => p.id === bbPlayer.id);
      for (let i = 1; i <= players.length; i++) {
        const nextIdx = (idx + i) % players.length;
        order.push(players[nextIdx]);
      }
    } else {
      order = [...players];
    }
    // 勝者の中で順番を決める
    const winnerOrder = order.filter(p => winnerIds.includes(p.id));
    let resultMsg = '';
    winners.forEach(w => {
      let extra = 0;
      if (remainder > 0 && winnerOrder.length > 0 && w.id === winnerOrder[0].id) {
        extra = 1;
        remainder--;
        winnerOrder.shift();
      }
      resultMsg += `${w.name}：${share + extra}\n`;
    });
    alert(`POT分配\n${resultMsg}`);
    setModalState({ type: 'next-hand' });
  };

  const handleNextHand = () => {
    setModalState({ type: 'none' });
    
    // BBを左隣の席に移動
    const currentBbPlayer = players.find(p => p.isBB);
    if (currentBbPlayer) {
      // 席順序でソートして次のBBを見つける
      const sortedSeats = initialPlayersFromDB.map(p => p.seatIndex).sort((a, b) => a - b);
      const currentBbSeatIndex = currentBbPlayer.seatIndex;
      const currentIndex = sortedSeats.indexOf(currentBbSeatIndex);
      const nextIndex = (currentIndex + 1) % sortedSeats.length;
      const nextBbSeatIndex = sortedSeats[nextIndex];
      
      setBbSeatIndex(nextBbSeatIndex);
    }
    
    startNewHand();
  };

  const positionedPlayers = useRelativePlayerPositions(players, currentUserId);
  const mainPlayer = positionedPlayers.find(p => p.id === currentUserId);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <Modal modalState={modalState} setModal={setModalState} onSubmitBet={handleSubmitBet} onSelectWinner={handleWinnerSelected} onNextHand={handleNextHand} />
      
      {/* テスト用ユーザー切り替えボタン */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-gray-800 p-3 rounded-lg border border-yellow-500">
          <p className="text-white text-sm mb-2">テスト用ユーザー切り替え</p>
          <div className="flex gap-2">
            {initialPlayersFromDB.map(player => (
              <button
                key={player.id}
                onClick={() => setCurrentUserId(player.id)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  currentUserId === player.id 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                {player.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="relative w-full max-w-[600px] h-[85vh] bg-transparent">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-[1/1.8] border-4 border-yellow-500 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] aspect-[1/1.8] border-2 border-yellow-400 rounded-full bg-black/80"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
            <p className="text-white text-lg font-bold mb-1">{getStageDisplayName(gameStage)}</p>
            <p className="text-yellow-400 text-xl font-bold">POT</p>
            <p className="text-yellow-400 text-4xl font-bold drop-shadow">{pot}</p>
        </div>

        {positionedPlayers.map(player => {
          // フォールドしていても表示（薄いグレーで）
          const isMainPlayer = player.id === currentUserId;
          const positionClass = SEAT_POSITIONS[player.visualSeatIndex ?? 0];

          return (
            <div key={player.id} className={`absolute ${positionClass} flex flex-col items-center`}>
              <PlayerDisplay player={player} isMainPlayer={isMainPlayer} />
            </div>
          );
        })}

        {mainPlayer?.isTurn && (
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4">
            <ActionButtons currentBet={currentBet} onAction={handleAction} player={mainPlayer} />
          </div>
        )}
      </div>
    </div>
  );
}
