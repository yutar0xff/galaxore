import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card, CardBack } from './ui/Card';
import { Noble } from './ui/Noble';
import { Token } from './ui/Token';
import { GemColor, TokenColor } from '@local-splendor/shared';
import { QRCodeSVG } from 'qrcode.react';

export function HostBoard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');
  const { gameState, lobbyInfo, startGame } = useGame(roomId, { asSpectator: true });
  const [serverIp, setServerIp] = useState<string | null>(null);

  useEffect(() => {
    // Fetch server IP address
    const fetchServerIp = async () => {
      try {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const serverPort = 3000;
        const response = await fetch(`${protocol}//${hostname}:${serverPort}/api/ip`);
        const data = await response.json();
        if (data.ip) {
          setServerIp(data.ip);
        }
      } catch (error) {
        console.warn('Could not fetch server IP, using fallback:', error);
      }
    };
    fetchServerIp();
  }, []);

  // Use fetched IP if available, otherwise fallback to window.location
  const joinHost = serverIp || window.location.hostname;
  const joinUrl = roomId
      ? `${window.location.protocol}//${joinHost}:${window.location.port}/game?roomId=${roomId}`
      : '';

  if (!roomId) return <div>Invalid Room ID</div>;

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8 relative">
        <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-2"
        >
            ← Back to Home
        </button>

        <h1 className="text-4xl">Room: {roomId}</h1>

        <div className="bg-white p-4 rounded-xl">
            {joinUrl && <QRCodeSVG value={joinUrl} size={256} />}
        </div>
        <p className="text-gray-400">Scan to Join</p>
        <p className="text-sm text-gray-500">{joinUrl}</p>

        <div className="text-2xl mt-4">
          Players: {lobbyInfo?.players || 0} / 4
        </div>
        <div className="text-xl text-gray-400">
          Spectators: {lobbyInfo?.spectators || 0}
        </div>

        {(lobbyInfo?.players || 0) >= 2 && (
            <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 rounded text-2xl font-bold hover:bg-green-700 animate-pulse mt-4"
            >
                Start Game
            </button>
        )}
        {(lobbyInfo?.players || 0) < 2 && (
            <div className="text-yellow-500 mt-4">Waiting for players...</div>
        )}
      </div>
    );
  }

  const { board, players, currentPlayerIndex } = gameState;

  return (
    <div className="min-h-screen bg-gray-800 p-4 overflow-hidden flex flex-col">
       {/* Top Bar: Nobles & Player Scores */}
       <div className="flex justify-between items-start mb-4 h-24">
         <div className="flex gap-2">
            {board.nobles.map(noble => <Noble key={noble.id} noble={noble} />)}
         </div>

         <div className="flex gap-4">
             {players.map((p, idx) => (
                 <div key={p.id} className={`p-2 rounded w-48 ${idx === currentPlayerIndex ? 'bg-yellow-600 ring-2 ring-yellow-300' : 'bg-gray-700'}`}>
                     <div className="font-bold flex justify-between">
                         <span>{p.name}</span>
                         <span>{p.score} VP</span>
                     </div>
                     <div className="text-xs flex gap-1 mt-1">
                        Cards: {p.cards.length} | Res: {p.reserved.length}
                     </div>
                     <div className="flex gap-1 mt-1 flex-wrap">
                         {Object.entries(p.tokens).map(([color, count]) => (
                             (count as number) > 0 && <span key={color} className={`w-3 h-3 rounded-full ${getColorBg(color as TokenColor)}`}></span>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
       </div>

       <div className="flex flex-1 gap-8">
           {/* Left: Cards Board */}
           <div className="flex-1 flex flex-col gap-4">
               {[3, 2, 1].map((level) => (
                   <div key={level} className="flex gap-4 items-center">
                       <CardBack level={level as 1|2|3} />
                       {board.cards[level as 1|2|3].map(card => (
                           <Card key={card.id} card={card} />
                       ))}
                   </div>
               ))}
           </div>

           {/* Right: Tokens Supply */}
           <div className="w-32 flex flex-col gap-4 justify-center items-center bg-gray-900/50 p-4 rounded-xl">
               {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'] as TokenColor[]).map(color => (
                   <Token key={color} color={color} count={board.tokens[color] || 0} size="lg" />
               ))}
           </div>
       </div>
    </div>
  );
}

function getColorBg(color: TokenColor) {
    switch(color) {
        case 'emerald': return 'bg-green-500';
        case 'sapphire': return 'bg-blue-500';
        case 'ruby': return 'bg-red-500';
        case 'diamond': return 'bg-white';
        case 'onyx': return 'bg-black border border-gray-600';
        case 'gold': return 'bg-yellow-400';
        default: return 'bg-gray-500';
    }
}
