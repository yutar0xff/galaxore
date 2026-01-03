import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { JoinScreen } from "./components/JoinScreen";
import { BoardView } from "./components/BoardView";
import { PlayerController } from "./components/PlayerController";

function App() {
  const navigate = useNavigate();

  const handleJoin = (
    roomId: string,
    isBoard: boolean,
    name?: string,
    switchUserId?: string,
  ) => {
    if (isBoard) {
      navigate(
        `/board?roomId=${roomId}${switchUserId ? `&switchUserId=${switchUserId}` : ""}`,
      );
    } else {
      navigate(
        `/game?roomId=${roomId}${name ? `&name=${encodeURIComponent(name)}` : ""}${switchUserId ? `&switchUserId=${switchUserId}` : ""}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white">
      <Routes>
        <Route path="/" element={<JoinScreen onJoin={handleJoin} />} />
        <Route path="/board" element={<BoardView />} />
        <Route path="/game" element={<PlayerController />} />
      </Routes>
    </div>
  );
}

export default App;
