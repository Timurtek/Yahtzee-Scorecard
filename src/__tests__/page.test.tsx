// File: __tests__/page.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';
import { GameProvider, useGame } from '@/contexts/GameContext';

// Mock the GameContext
jest.mock('@/contexts/GameContext', () => ({
  useGame: jest.fn(),
  GameProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Home component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [],
        games: [],
        currentGameId: null,
      },
      dispatch: mockDispatch,
    });
  });

  it('renders the title', () => {
    render(<Home />);
    expect(screen.getByText('Yahtzee Scorekeeper')).toBeInTheDocument();
  });

  it('allows adding a player', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player (0/10)');

    fireEvent.change(input, { target: { value: 'Alice' } });
    fireEvent.click(addButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_PLAYER', name: 'Alice' });
  });

  it('disables add player button when max players reached', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: Array(10)
          .fill(null)
          .map((_, i) => ({ name: `Player ${i}` })),
        games: [],
        currentGameId: null,
      },
      dispatch: mockDispatch,
    });

    render(<Home />);
    expect(screen.queryByText('Add Player (10/10)')).not.toBeInTheDocument();
  });

  it('renders player list and allows removal', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [],
        currentGameId: null,
      },
      dispatch: mockDispatch,
    });

    render(<Home />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'REMOVE_PLAYER', name: 'Alice' });
  });

  it('allows starting a new game', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [],
        currentGameId: null,
      },
      dispatch: mockDispatch,
    });

    render(<Home />);
    const startButton = screen.getByText('Start New Game');
    fireEvent.click(startButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_NEW_GAME' });
  });

  it('renders Scorecard when a game is active', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [{ id: 1, scores: {}, currentPlayerIndex: 0 }],
        currentGameId: 1,
      },
      dispatch: mockDispatch,
    });

    render(<Home />);
    // This assumes your Scorecard component renders something with 'Scorecard' text
    // Adjust based on your actual Scorecard component implementation
    expect(screen.getByTestId('scorecard')).toBeInTheDocument();
  });

  it('renders GameSummary when multiple games exist', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          { id: 1, scores: {} },
          { id: 2, scores: {} },
        ],
        currentGameId: 1,
      },
      dispatch: mockDispatch,
    });

    render(<Home />);
    // This assumes your GameSummary component renders something with 'Game Summary' text
    // Adjust based on your actual GameSummary component implementation
    expect(screen.getByTestId('game-summary')).toBeInTheDocument();
  });

  it('adds a player using prompt', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [],
        games: [],
        currentGameId: null,
      },
      dispatch: mockDispatch,
    });

    window.prompt = jest.fn().mockReturnValue('Alice');

    render(<Home />);

    const addButton = screen.getByText('Add Player (0/10)');
    fireEvent.click(addButton);

    expect(window.prompt).toHaveBeenCalledWith('Enter player name:');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_PLAYER', name: 'Alice' });
  });

  it('does not add a player when prompt is cancelled', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        players: [],
        games: [],
        currentGameId: null,
      },
      dispatch: mockDispatch,
    });

    window.prompt = jest.fn().mockReturnValue(null);

    render(<Home />);

    const addButton = screen.getByText('Add Player (0/10)');
    fireEvent.click(addButton);

    expect(window.prompt).toHaveBeenCalledWith('Enter player name:');
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
