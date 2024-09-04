# Yahtzee Scorekeeper

## Overview

Yahtzee Scorekeeper is a modern, responsive web application built with Next.js and TypeScript. It provides a digital scorecard for the popular dice game Yahtzee, showcasing advanced front-end development techniques and UI/UX design principles.

## Features

- **Multi-player Support**: Keep score for multiple players in a single game session.
- **Dynamic Scorecard**: Automatically calculates scores and updates totals in real-time.
- **Turn-based System**: Implements a turn system to manage player moves.
- **Persistent State**: Game state is saved in local storage, allowing games to be resumed.
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices.
- **Accessibility**: Implemented with ARIA attributes and keyboard navigation for improved accessibility.

## Technologies Used

- **Next.js**: For server-side rendering and optimal performance.
- **TypeScript**: For type-safe code and improved developer experience.
- **React**: Leveraging hooks and context for state management.
- **Tailwind CSS**: For responsive and customizable styling.
- **LocalStorage API**: For persisting game state.

## Advanced Implementation Details

- **Complex State Management**: Utilizes React Context and useReducer for managing complex game state.
- **Custom Hooks**: Implements custom hooks for reusable logic, such as local storage interactions.
- **TypeScript Best Practices**: Demonstrates advanced TypeScript features including discriminated unions and generics.
- **Performance Optimization**: Implements memoization and optimized re-renders.
- **Error Handling**: Robust error handling and user feedback mechanisms.

## Code Quality & Best Practices

- **ESLint & Prettier**: Enforces code style and catches potential errors.
- **Unit Testing**: Implements Jest for unit testing critical functions.
- **Modular Architecture**: Organized codebase with clear separation of concerns.
- **Responsive Design**: Utilizes Tailwind CSS for a mobile-first, responsive layout.
- **Accessibility (a11y)**: Focuses on creating an accessible user interface.

## Future Enhancements

- Implement authentication for user accounts.
- Add multiplayer functionality with real-time updates.
- Create a leaderboard and statistics tracking system.
- Integrate with a backend API for data persistence.

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/yahtzee-scorekeeper.git
   ```

2. Install dependencies:

   ```
   cd yahtzee-scorekeeper
   npm install
   ```

3. Run the development server:

   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
