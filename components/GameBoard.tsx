import React, { useState, useEffect, useRef } from 'react';
import type { GameState, Fraction, Difficulty } from '../types';

interface GameBoardProps {
  gameState: GameState;
  onStopLine: (positionPercent: number) => void;
  userFraction: Fraction | null;
  targetFraction: Fraction;
  difficulty: Difficulty;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onStopLine, userFraction, targetFraction, difficulty }) => {
  const [lineTopPercent, setLineTopPercent] = useState<number>(50);
  const animationFrameId = useRef<number | null>(null);
  
  const linePosition = useRef<{ y: number }>({ y: 50 });
  const lineDirectionY = useRef<number>(1);
  const lineSpeedY = difficulty === '67' ? 0.25 : 0.08;

  useEffect(() => {
    let lastTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (lastTime !== null) {
        const deltaTime = timestamp - lastTime;
        linePosition.current.y += lineDirectionY.current * lineSpeedY * deltaTime;

        if (linePosition.current.y >= 100) { linePosition.current.y = 100; lineDirectionY.current = -1; } 
        else if (linePosition.current.y <= 0) { linePosition.current.y = 0; lineDirectionY.current = 1; }

        setLineTopPercent(linePosition.current.y);
      }
      lastTime = timestamp;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    if (gameState === 'playing') {
      linePosition.current = { y: Math.random() * 100 };
      lineDirectionY.current = Math.random() > 0.5 ? 1 : -1;
      animationFrameId.current = requestAnimationFrame(animate);
    } else if (gameState === 'result' && userFraction) {
        const finalVerticalPosition = (userFraction.numerator / userFraction.denominator) * 100;
        setLineTopPercent(finalVerticalPosition);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, userFraction, difficulty, lineSpeedY]);
  
  const handleInteraction = () => {
      if(gameState === 'playing') {
          onStopLine(linePosition.current.y);
      }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if(e.code === 'Space') {
            e.preventDefault();
            handleInteraction();
        }
    }
    
    if(gameState === 'playing') {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }
  }, [gameState, onStopLine]);

  const denominator = targetFraction.denominator || 10;
  const numCells = 10 * denominator;

  const renderLine = () => {
    if (gameState !== 'playing' && gameState !== 'result') return null;

    const lineColor = difficulty === '67' ? 'bg-purple-500' : 'bg-red-500';

    return (
       <div
          className={`absolute w-full h-2 rounded-full shadow-lg transition-transform duration-100 ${lineColor} ${gameState === 'result' ? 'scale-y-150' : ''}`}
          style={{ top: `calc(${lineTopPercent}% - 4px)` }}
        />
    );
  };

  return (
    <div
      className="w-80 h-80 md:w-96 md:h-96 bg-white rounded-2xl shadow-2xl p-2 border-4 border-slate-200 relative cursor-pointer touch-manipulation overflow-hidden"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      tabIndex={0}
      aria-label="Game Board: Click, tap, or press space to stop the line"
    >
      {difficulty === 'hard' || difficulty === '67' ? (
        <div className="w-full h-full bg-sky-100 rounded-xl"></div>
      ) : (
        <div
          className="w-full h-full grid grid-cols-10 gap-px bg-slate-200"
          style={{ gridTemplateRows: `repeat(${denominator}, 1fr)` }}
        >
          {Array.from({ length: numCells }).map((_, i) => {
              const row = Math.floor(i / 10);
              const col = i % 10;
              const isEven = (row + col) % 2 === 0;
              return (
                <div
                  key={i}
                  className={`w-full h-full ${
                    isEven ? 'bg-sky-100' : 'bg-sky-200/70'
                  }`}
                />
              )
          })}
        </div>
      )}
      {renderLine()}
    </div>
  );
};

export default GameBoard;
