// File: app/page.tsx

'use client';

import GameSummary from '@/components/GameSummary';
import Scorecard from '@/components/Scorecard';
import { useGame } from '@/contexts/GameContext';
import classNames from 'classnames';
import React, { useState } from 'react';

export default function Home() {
  const { state, dispatch } = useGame();
  const currentGame = state.games.find((game) => game.id === state.currentGameId);
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
    <main className="flex min-h-screen flex-col mx-auto max-w-7xl py-24">
      <h1 className="text-4xl font-bold mb-8">Yahtzee Scorekeeper</h1>
      <div className="w-full">
        {state.players.length < 10 && (
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
              Add Player ({state.players.length}/10)
            </button>
          </div>
        )}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 sm:grid-cols-2">
          {state.players.map((player, index) => (
            <div
              key={player.name}
              className={classNames('flex justify-between items-center glassy p-4 rounded-lg', {
                'outline outline-2': index === currentGame?.currentPlayerIndex,
              })}
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

          <button
            onClick={startNewGame}
            disabled={state.players.length < 2}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mr-2"
          >
            Delete Game
          </button>
          <button
            onClick={startNewGame}
            disabled={state.players.length < 2}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mr-2"
          >
            End Game
          </button>
          {state.games.map((game) => (
            <button
              key={game.id}
              onClick={() => switchGame(game.id)}
              className={`${
                game.id === state.currentGameId ? 'bg-yellow-500' : 'bg-gray-300'
              } hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 mt-2`}
            >
              Game {game.id}
            </button>
          ))}
        </div>
        {state.currentGameId !== null && <Scorecard />}
        {state.games.length > 1 && <GameSummary />}
      </div>
    </main>
  );
}
