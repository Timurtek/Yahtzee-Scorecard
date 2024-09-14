// __tests__/components/Scorecard.test.tsx

import { render, screen } from '@testing-library/react';
import Scorecard from '@/components/Scorecard';
import { GameProvider } from '@/contexts/GameContext';

describe('Scorecard', () => {
  it('renders correctly', () => {
    render(
      <GameProvider>
        <Scorecard />
      </GameProvider>
    );
    expect(screen.getByText(/Yahtzee Scorekeeper/i)).toBeInTheDocument();
  });
});
