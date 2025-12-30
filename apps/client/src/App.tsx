import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { JoinScreen } from './components/JoinScreen';
import { HostBoard } from './components/HostBoard';
import { PlayerController } from './components/PlayerController';

function App() {
  const navigate = useNavigate();

  const handleJoin = (roomId: string, isHost: boolean) => {
    if (isHost) {
      navigate(`/host?roomId=${roomId}`);
    } else {
      navigate(`/game?roomId=${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Routes>
        <Route path="/" element={<JoinScreen onJoin={handleJoin} />} />
        <Route path="/host" element={<HostBoard />} />
        <Route path="/game" element={<PlayerController />} />
      </Routes>
    </div>
  );
}

export default App;
