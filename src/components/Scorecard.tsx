// File: components/Scorecard.tsx

import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import classNames from 'classnames';
import Confetti from 'react-confetti';

const upperSectionCategories = [
  {
    name: 'Aces',
    description: 'Count and add only Aces',
    maxScore: 5,
    validate: (score: number) => score >= 0 && score <= 5 && score % 1 === 0,
  },
  {
    name: 'Twos',
    description: 'Count and add only Twos',
    maxScore: 10,
    validate: (score: number) => score >= 0 && score <= 10 && score % 2 === 0,
  },
  {
    name: 'Threes',
    description: 'Count and add only Threes',
    maxScore: 15,
    validate: (score: number) => score >= 0 && score <= 15 && score % 3 === 0,
  },
  {
    name: 'Fours',
    description: 'Count and add only Fours',
    maxScore: 20,
    validate: (score: number) => score >= 0 && score <= 20 && score % 4 === 0,
  },
  {
    name: 'Fives',
    description: 'Count and add only Fives',
    maxScore: 25,
    validate: (score: number) => score >= 0 && score <= 25 && score % 5 === 0,
  },
  {
    name: 'Sixes',
    description: 'Count and add only Sixes',
    maxScore: 30,
    validate: (score: number) => score >= 0 && score <= 30 && score % 6 === 0,
  },
];

const lowerSectionCategories = [
  {
    name: '3 of a Kind',
    description: 'Add total of all dice',
    validate: (score: number) => score >= 0 && score <= 18,
  },
  {
    name: '4 of a Kind',
    description: 'Add total of all dice',
    validate: (score: number) => score >= 0 && score <= 24,
  },
  { name: 'Full House', description: 'Score 25', validate: (score: number) => score === 25 },
  { name: 'SM Straight', description: 'Score 30', validate: (score: number) => score === 30 },
  { name: 'LG Straight', description: 'Score 40', validate: (score: number) => score === 40 },
  { name: 'YAHTZEE', description: 'Score 50', validate: (score: number) => score === 50 },
  {
    name: 'Chance',
    description: 'Score total of all dice',
    validate: (score: number) => score >= 5 && score <= 30,
  },
];

export default function Scorecard() {
  const { state, dispatch } = useGame();
  const currentGame = state.games.find((game) => game.id === state.currentGameId);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (currentGame) {
      const allCategoriesFilled = state.players.every((player) => {
        const playerScores = currentGame.scores[player.name];
        return [...upperSectionCategories, ...lowerSectionCategories].every(
          (category) => playerScores[category.name] !== undefined
        );
      });
      setIsGameComplete(allCategoriesFilled);
    }
  }, [currentGame, state.players]);
  if (!currentGame) {
    return <div>No active game. Start a new game to see the scorecard.</div>;
  }
  const currentPlayer = state.players[currentGame.currentPlayerIndex];
  const getPromptMessage = (category: string): string => {
    switch (category) {
      case 'Ones':
      case 'Twos':
      case 'Threes':
      case 'Fours':
      case 'Fives':
      case 'Sixes':
        const numberValue = {
          Ones: 1,
          Twos: 2,
          Threes: 3,
          Fours: 4,
          Fives: 5,
          Sixes: 6,
        }[category];
        return `Enter score for ${category} (0-${numberValue * 5} points, multiples of ${numberValue} only):`;
      case '3 of a Kind':
      case '4 of a Kind':
        return `Enter score for ${category} (sum of all dice, 0-30):`;
      case 'Full House':
        return 'Enter score for Full House (25 if valid, 0 if not):';
      case 'SM Straight':
        return 'Enter score for Small Straight (30 if valid, 0 if not):';
      case 'LG Straight':
        return 'Enter score for Large Straight (40 if valid, 0 if not):';
      case 'YAHTZEE':
        return 'Enter score for YAHTZEE (50 if valid, 0 if not):';
      case 'Chance':
        return 'Enter score for Chance (sum of all dice, 5-30):';
      default:
        return `Enter score for ${category}:`;
    }
  };
  const handleScore = (
    playerName: string,
    category: string,
    validator: (score: number) => boolean
  ) => {
    const promptMessage = getPromptMessage(category);
    const score = prompt(promptMessage);
    if (score !== null) {
      const numScore = parseInt(score, 10);
      if (!isNaN(numScore) && validator(numScore)) {
        dispatch({
          type: 'UPDATE_SCORE',
          gameId: currentGame.id,
          playerName,
          category,
          value: numScore,
        });
      } else {
        alert('Invalid score for this category. Please try again.');
      }
    }
  };

  const handleYahtzeeBonus = (playerName: string) => {
    const currentBonuses = currentGame.scores[playerName]['YAHTZEE BONUS'] || 0;
    if (currentBonuses < 3) {
      dispatch({
        type: 'UPDATE_SCORE',
        gameId: currentGame.id,
        playerName,
        category: 'YAHTZEE BONUS',
        value: currentBonuses + 1,
      });
    } else {
      alert('Maximum Yahtzee bonuses (3) already achieved.');
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

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME', gameId: currentGame.id });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
  };

  return (
    <div className="overflow-x-auto relative">
      {showConfetti && <Confetti />}
      <h2 className="text-2xl font-bold mb-4">Game {currentGame.id} Scorecard</h2>
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
                      onClick={() => handleScore(player.name, category.name, category.validate)}
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
                <td className="border px-4 py-2">{category.name}</td>
                <td className="border px-4 py-2">
                  {category.name === 'Chance'
                    ? 'Score total of all dice'
                    : `Score ${category.name === 'YAHTZEE' ? '50' : category.name}`}
                </td>
                {state.players.map((player) => (
                  <td key={player.name} className="border px-4 py-2">
                    <button
                      onClick={() => handleScore(player.name, category.name, category.validate)}
                      className="w-full h-full text-left"
                      disabled={player.name !== currentPlayer.name}
                    >
                      {currentGame.scores[player.name][category.name] ?? '-'}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="border px-4 py-2">YAHTZEE BONUS</td>
              <td className="border px-4 py-2">Score 100 per ✓</td>
              <td colSpan={2}>
                <div className="flex w-full bg-red-200">
                  {state.players.map((player) => (
                    <div
                      key={player.name}
                      className="border px-4 py-2 flex justify-between items-center flex-row"
                    >
                      <span>{(currentGame.scores[player.name]['YAHTZEE BONUS'] || 0) * 100}</span>
                      <button
                        onClick={() => handleYahtzeeBonus(player.name)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                        disabled={player.name !== currentPlayer.name}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </td>
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
      {isGameComplete && (
        <button
          onClick={handleEndGame}
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          End Game
        </button>
      )}
    </div>
  );
}
