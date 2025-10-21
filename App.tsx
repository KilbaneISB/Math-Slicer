import React, { useState, useCallback, useEffect } from 'react';
import type { GameState, Fraction, Difficulty } from './types';
import GameBoard from './components/GameBoard';
import ResultDisplay from './components/ResultDisplay';

// Moved fraction generation to a utility function outside the component
const generateFraction = (difficulty: Difficulty): Fraction => {
  if (difficulty === '67') {
    return { numerator: 6, denominator: 7 };
  }

  let newFraction: Fraction;
  if (difficulty === 'easy') {
    const easyFractions: Fraction[] = [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 3 },
      { numerator: 2, denominator: 3 },
      { numerator: 1, denominator: 4 },
      { numerator: 3, denominator: 4 },
      ...Array.from({ length: 9 }, (_, i) => ({ numerator: i + 1, denominator: 10 }))
    ];
    newFraction = easyFractions[Math.floor(Math.random() * easyFractions.length)];
  } else { // medium or hard
    const mediumDenominators = [5, 6, 7, 8, 9, 11, 12];
    const denominator = mediumDenominators[Math.floor(Math.random() * mediumDenominators.length)];
    const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    newFraction = { numerator, denominator };
  }
  return newFraction;
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState<number>(0);
  const [targetFraction, setTargetFraction] = useState<Fraction>({ numerator: 0, denominator: 10 });
  const [userFraction, setUserFraction] = useState<Fraction | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [hardModeConsecutiveWins, setHardModeConsecutiveWins] = useState<number>(0);
  const [is67ModeUnlocked, setIs67ModeUnlocked] = useState<boolean>(false);

  const handleStartGame = useCallback(() => {
    setScore(0);
    setHardModeConsecutiveWins(0);
    setTargetFraction(generateFraction(difficulty));
    setUserFraction(null);
    setPointsEarned(0);
    setGameState('playing');
  }, [difficulty]);

  const handleNextRound = useCallback(() => {
    setTargetFraction(generateFraction(difficulty));
    setUserFraction(null);
    setPointsEarned(0);
    setGameState('playing');
  }, [difficulty]);
  
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (difficulty === 'hard' && newDifficulty !== 'hard') {
        setHardModeConsecutiveWins(0);
    }
    setDifficulty(newDifficulty);
    if (gameState !== 'idle') {
      setTargetFraction(generateFraction(newDifficulty));
      setUserFraction(null);
      setPointsEarned(0);
      setGameState('playing');
    }
  };

  const handleStopLine = useCallback((positionPercent: number) => {
    if (gameState !== 'playing') return;

    const stoppedNumerator = Math.round((positionPercent / 100) * targetFraction.denominator);
    const currentUserFraction = { numerator: Math.max(1, Math.min(targetFraction.denominator, stoppedNumerator)), denominator: targetFraction.denominator };
    setUserFraction(currentUserFraction);

    let currentPoints = 0;
    const userNum = currentUserFraction.numerator;
    const targetNum = targetFraction.numerator;
    const denominator = targetFraction.denominator;

    const diff1 = Math.abs(userNum - targetNum);
    const inverseNum = denominator - userNum;
    const diff2 = Math.abs(inverseNum - targetNum);
    
    const effectiveDiff = Math.min(diff1, diff2);
    
    if (effectiveDiff === 0) {
      currentPoints = 10;
    } else if (effectiveDiff === 1) {
      currentPoints = 5;
    }
    
    setPointsEarned(currentPoints);
    setScore(prevScore => prevScore + currentPoints);
    setGameState('result');

    if (difficulty === 'hard') {
        if (currentPoints === 10) {
            const newWins = hardModeConsecutiveWins + 1;
            setHardModeConsecutiveWins(newWins);
            if (newWins >= 5) {
                setIs67ModeUnlocked(true);
            }
        } else {
            setHardModeConsecutiveWins(0);
        }
    } else if (difficulty === '67' && currentPoints !== 10) {
        // Player missed in 67 MODE, kick them back to Hard mode
        setDifficulty('hard');
        setHardModeConsecutiveWins(0);
    }
  }, [gameState, targetFraction, difficulty, hardModeConsecutiveWins]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start font-sans p-4 text-slate-800">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-bold text-sky-700">Fraction Slicer</h1>
          <p className="text-slate-500 mt-2">Stop the line to match the target fraction!</p>
        </header>
        
        <main className="relative flex flex-col md:flex-row items-center justify-around gap-8 flex-grow">
          <div className="w-48 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-500">Score</h2>
            <p className="text-6xl font-bold text-amber-500 mt-2">{score}</p>
          </div>

          <div className="relative">
            <GameBoard gameState={gameState} onStopLine={handleStopLine} userFraction={userFraction} targetFraction={targetFraction} difficulty={difficulty} />
            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl gap-6">
                <button 
                  onClick={handleStartGame}
                  className="px-8 py-4 bg-emerald-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:bg-emerald-600 transform hover:scale-105 transition-all duration-200"
                >
                  Start Game
                </button>
              </div>
            )}
            {gameState === 'result' && userFraction && (
              <ResultDisplay
                userFraction={userFraction}
                targetFraction={targetFraction}
                pointsEarned={pointsEarned}
                onNextRound={handleNextRound}
              />
            )}
          </div>
          
          <div className="w-48 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-500">Target</h2>
            <div className="flex items-center justify-center mt-2">
              <p className="text-6xl font-bold text-sky-600">{targetFraction.numerator > 0 ? targetFraction.numerator : '?'}</p>
              <p className="text-4xl font-semibold text-slate-400 mx-2">/</p>
              <p className="text-4xl font-semibold text-slate-400">{targetFraction.denominator}</p>
            </div>
          </div>
        </main>
        
        <footer className="py-4">
            <div className="flex justify-center gap-4 p-2 bg-slate-800/50 rounded-lg max-w-xl mx-auto">
              <button
                onClick={() => handleDifficultyChange('easy')}
                className={`flex-1 px-6 py-2 text-xl font-bold rounded-md transition-colors ${difficulty === 'easy' ? 'bg-sky-500 text-white' : 'bg-transparent text-sky-200 hover:bg-sky-700/50'}`}
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultyChange('medium')}
                className={`flex-1 px-6 py-2 text-xl font-bold rounded-md transition-colors ${difficulty === 'medium' ? 'bg-amber-500 text-white' : 'bg-transparent text-amber-200 hover:bg-amber-700/50'}`}
              >
                Medium
              </button>
               <button
                onClick={() => handleDifficultyChange('hard')}
                className={`flex-1 px-6 py-2 text-xl font-bold rounded-md transition-colors ${difficulty === 'hard' ? 'bg-rose-500 text-white' : 'bg-transparent text-rose-200 hover:bg-rose-700/50'}`}
              >
                Hard
              </button>
              <button
                onClick={() => handleDifficultyChange('67')}
                disabled={!is67ModeUnlocked}
                className={`flex-1 px-6 py-2 text-xl font-bold rounded-md transition-colors ${
                    difficulty === '67'
                    ? 'bg-purple-500 text-white'
                    : !is67ModeUnlocked
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-transparent text-purple-200 hover:bg-purple-700/50'
                }`}
                title={!is67ModeUnlocked ? "Get 5 perfect scores in Hard mode in a row to unlock!" : "67 MODE"}
              >
                67 MODE
              </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default App;