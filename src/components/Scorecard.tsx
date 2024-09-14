// File: components/Scorecard.tsx

import React from 'react';
import { useGame } from '../contexts/GameContext';
import classNames from 'classnames';

const upperSectionCategories = [
  { name: 'Aces', description: 'Count and add only Aces' },
  { name: 'Twos', description: 'Count and add only Twos' },
  { name: 'Threes', description: 'Count and add only Threes' },
  { name: 'Fours', description: 'Count and add only Fours' },
  { name: 'Fives', description: 'Count and add only Fives' },
  { name: 'Sixes', description: 'Count and add only Sixes' },
];

const lowerSectionCategories = [
  { name: '3 of a Kind', description: 'Add total of all dice' },
  { name: '4 of a Kind', description: 'Add total of all dice' },
  { name: 'Full House', description: 'Score 25' },
  { name: 'SM Straight', description: 'Score 30' },
  { name: 'LG Straight', description: 'Score 40' },
  { name: 'YAHTZEE', description: 'Score 50' },
  { name: 'Chance', description: 'Score total of all dice' },
];

export default function Scorecard() {
  const { state, dispatch } = useGame();
  const currentGame = state.games.find((game) => game.id === state.currentGameId);

  if (!currentGame) {
    return <div>No active game. Start a new game to see the scorecard.</div>;
  }
  const currentPlayer = state.players[currentGame.currentPlayerIndex];
  const handleScore = (playerName: string, category: string) => {
    if (playerName !== currentPlayer.name) {
      alert("It's not your turn!");
      return;
    }
    const score = prompt(`Enter score for ${playerName}'s ${category}:`);
    if (score !== null) {
      const numScore = parseInt(score, 10);
      if (!isNaN(numScore)) {
        dispatch({
          type: 'UPDATE_SCORE',
          gameId: currentGame.id,
          playerName,
          category,
          value: numScore,
        });
      }
    }
  };

  const calculateUpperSectionTotal = (playerName: string) => {
    return upperSectionCategories.reduce((total, category) => {
      return total + (currentGame.scores[playerName][category.name] || 0);
    }, 0);
  };

  const calculateBonus = (playerName: string) => {
    const upperTotal = calculateUpperSectionTotal(playerName);
    return upperTotal >= 63 ? 35 : 0;
  };

  const calculateLowerSectionTotal = (playerName: string) => {
    return lowerSectionCategories.reduce((total, category) => {
      return total + (currentGame.scores[playerName][category.name] || 0);
    }, 0);
  };

  const calculateGrandTotal = (playerName: string) => {
    const upperTotal = calculateUpperSectionTotal(playerName);
    const bonus = calculateBonus(playerName);
    const lowerTotal = calculateLowerSectionTotal(playerName);
    return upperTotal + bonus + lowerTotal;
  };

  return (
    <div className="overflow-x-auto glassy rounded-xl">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-black/5 px-4 py-2 font-bold text-left sticky top-0">
              Category
            </th>
            <th className="border border-black/5 px-4 py-2 font-bold text-left sticky top-0">
              How to Score
            </th>
            {state.players.map((player, index) => (
              <th
                key={player.name}
                className={classNames('border border-black/5 px-4 py-2 font-bold sticky top-0', {
                  'bg-gray-100': index === currentGame.currentPlayerIndex,
                })}
              >
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Upper Section */}
          {upperSectionCategories.map((category) => (
            <tr key={category.name}>
              <td className="border border-black/5 px-4 py-2">{category.name}</td>
              <td className="border border-black/5 px-4 py-2">{category.description}</td>
              {state.players.map((player, index) => (
                <td
                  key={player.name}
                  className={classNames('border border-black/5 px-4 py-2', {
                    'bg-gray-100': index === currentGame.currentPlayerIndex,
                  })}
                >
                  <button
                    onClick={() => handleScore(player.name, category.name)}
                    className="w-full h-full hover:outline hover:rounded-sm outline-2 outline-offset-2"
                  >
                    {currentGame.scores[player.name][category.name] ?? '-'}
                  </button>
                </td>
              ))}
            </tr>
          ))}
          {/* Upper Section Total */}
          <tr>
            <td className="border border-black/5 px-4 py-2 font-bold" colSpan={2}>
              Total Score
            </td>
            {state.players.map((player, index) => (
              <td
                key={player.name}
                className={classNames('border border-black/5 px-4 py-2 text-center', {
                  'bg-gray-100': index === currentGame.currentPlayerIndex,
                })}
              >
                {calculateUpperSectionTotal(player.name)}
              </td>
            ))}
          </tr>
          {/* Bonus */}
          <tr>
            <td className="border border-black/5 px-4 py-2 font-bold" colSpan={2}>
              Bonus (if total score is 63 or over)
            </td>
            {state.players.map((player, index) => (
              <td
                key={player.name}
                className={classNames('border border-black/5 px-4 py-2 text-center', {
                  'bg-gray-100': index === currentGame.currentPlayerIndex,
                })}
              >
                {calculateBonus(player.name)}
              </td>
            ))}
          </tr>
          {/* Upper Section Total with Bonus */}
          <tr>
            <td className="border border-black/5 px-4 py-2 font-bold" colSpan={2}>
              Total of Upper Section
            </td>
            {state.players.map((player, index) => (
              <td
                key={player.name}
                className={classNames('border border-black/5 px-4 py-2 text-center', {
                  'bg-gray-100': index === currentGame.currentPlayerIndex,
                })}
              >
                {calculateUpperSectionTotal(player.name) + calculateBonus(player.name)}
              </td>
            ))}
          </tr>

          {/* Lower Section */}
          {lowerSectionCategories.map((category) => (
            <tr key={category.name}>
              <td className="border border-black/5 px-4 py-2">{category.name}</td>
              <td className="border border-black/5 px-4 py-2">{category.description}</td>
              {state.players.map((player, index) => (
                <td
                  key={player.name}
                  className={classNames('border border-black/5 px-4 py-2', {
                    'bg-gray-100': index === currentGame.currentPlayerIndex,
                  })}
                >
                  <button
                    onClick={() => handleScore(player.name, category.name)}
                    className="w-full h-full"
                  >
                    {currentGame.scores[player.name][category.name] ?? '-'}
                  </button>
                </td>
              ))}
            </tr>
          ))}
          {/* Yahtzee Bonus */}
          <tr>
            <td className="border border-black/5 px-4 py-2">YAHTZEE BONUS</td>
            <td className="border border-black/5 px-4 py-2">Score 100 per ✓</td>
            {state.players.map((player, index) => (
              <td
                key={player.name}
                className={classNames('border border-black/5 px-4 py-2', {
                  'bg-gray-100': index === currentGame.currentPlayerIndex,
                })}
              >
                <button
                  onClick={() => handleScore(player.name, 'YAHTZEE BONUS')}
                  className="w-full h-full"
                >
                  {currentGame.scores[player.name]['YAHTZEE BONUS'] ?? '-'}
                </button>
              </td>
            ))}
          </tr>
          {/* Lower Section Total */}
          <tr>
            <td className="border border-black/5 px-4 py-2 font-bold" colSpan={2}>
              Total of Lower Section
            </td>
            {state.players.map((player, index) => (
              <td
                key={player.name}
                className={classNames('border border-black/5 px-4 py-2 text-center', {
                  'bg-gray-100': index === currentGame.currentPlayerIndex,
                })}
              >
                {calculateLowerSectionTotal(player.name)}
              </td>
            ))}
          </tr>
          {/* Grand Total */}
          <tr>
            <td className="border border-black/5 px-4 py-2 font-bold" colSpan={2}>
              GRAND TOTAL
            </td>
            {state.players.map((player) => (
              <td
                key={player.name}
                className="border border-black/5 px-4 py-2 font-bold text-center"
              >
                {calculateGrandTotal(player.name)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
