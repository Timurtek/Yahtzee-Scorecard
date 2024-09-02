// File: app/page.tsx

'use client';

import GameSummary from '@/components/GameSummary';
import Scorecard from '@/components/Scorecard';
import { useGame } from '@/contexts/GameContext';
import React, { useState } from 'react';

export default function Home() {
  const { state, dispatch } = useGame();
  const [playerName, setPlayerName] = useState('');

  const addPlayer = () => {
    if (playerName.trim() && state.players.length < 10) {
      dispatch({ type: 'ADD_PLAYER', name: playerName.trim() });
      setPlayerName('');
    }
  };

  const removePlayer = (name: string) => {
    dispatch({ type: 'REMOVE_PLAYER', name });
  };

  const startNewGame = () => {
    dispatch({ type: 'START_NEW_GAME' });
  };

  const switchGame = (gameId: number) => {
    dispatch({ type: 'SET_CURRENT_GAME', gameId });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Yahtzee Scorekeeper</h1>
      <div className="w-full max-w-7xl">
        <div className="mb-4 flex">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
          />
          <button
            onClick={addPlayer}
            disabled={state.players.length >= 10}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            Add Player
          </button>
        </div>
        <div className="mb-4 grid grid-cols-5 gap-4">
          {state.players.map((player) => (
            <div
              key={player.name}
              className="flex justify-between items-center glassy p-4 rounded-lg"
            >
              <span className="text-white font-bold">{player.name}</span>
              <button
                onClick={() => removePlayer(player.name)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <button
            onClick={startNewGame}
            disabled={state.players.length < 2}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mr-2"
          >
            Start New Game
          </button>
          {/* {state.games.map((game) => (
            <button
              key={game.id}
              onClick={() => switchGame(game.id)}
              className={`${
                game.id === state.currentGameId ? 'bg-yellow-500' : 'bg-gray-300'
              } hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 mt-2`}
            >
              Game {game.id}
            </button>
          ))} */}
        </div>
        {state.currentGameId !== null && <Scorecard />}
        <GameSummary />
      </div>
    </main>
  );
}
