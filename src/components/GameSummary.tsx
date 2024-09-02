// File: app/components/GameSummary.tsx

import React from 'react';
import { useGame } from '../contexts/GameContext';

export default function GameSummary() {
  const { state, dispatch } = useGame();

  const endGame = (gameId: number) => {
    dispatch({ type: 'END_GAME', gameId });
  };

  const deleteGame = (gameId: number) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      dispatch({ type: 'DELETE_GAME', gameId });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Game Summaries</h2>
      {state.games.map((game) => (
        <div key={game.id} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold mb-2">Game {game.id}</h3>
          {state.gameSummaries[game.id] ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Player</th>
                  <th className="text-left">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(state.gameSummaries[game.id]).map(([playerName, score]) => (
                  <tr key={playerName}>
                    <td>{playerName}</td>
                    <td>{score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Game in progress</p>
          )}
          <div className="mt-2">
            {!state.gameSummaries[game.id] && (
              <button
                onClick={() => endGame(game.id)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                End Game
              </button>
            )}
            <button
              onClick={() => deleteGame(game.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Delete Game
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
