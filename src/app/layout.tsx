import { Inter } from 'next/font/google';
import { NextUIProvider } from '@nextui-org/react';
import './globals.css';
import { GameProvider } from '@/contexts/GameContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Yahtzee Scorekeeper App',
  description: 'A simple app to keep score of Yahtzee games',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameProvider>
          <NextUIProvider>{children}</NextUIProvider>
        </GameProvider>
      </body>
    </html>
  );
}
