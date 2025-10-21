
import React from 'react';
import type { Fraction } from '../types';

interface ResultDisplayProps {
  userFraction: Fraction;
  targetFraction: Fraction;
  pointsEarned: number;
  onNextRound: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  userFraction,
  targetFraction,
  pointsEarned,
  onNextRound,
}) => {
  const getResultMessage = () => {
    if (pointsEarned === 10) {
      return { message: "Perfect!", color: "text-emerald-500" };
    }
    if (pointsEarned === 5) {
      return { message: "So Close!", color: "text-amber-500" };
    }
    return { message: "Try Again!", color: "text-red-500" };
  };

  const { message, color } = getResultMessage();

  return (
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl p-4 text-white z-10">
      <h2 className={`text-5xl font-bold ${color}`}>{message}</h2>
      <p className="text-xl mt-4">
        You got: <span className="font-bold">{userFraction.numerator}/{userFraction.denominator}</span>
      </p>
      <p className="text-lg">
        Target was: <span className="font-bold">{targetFraction.numerator}/{targetFraction.denominator}</span>
      </p>
      <p className="text-2xl font-semibold mt-4">
        You earned <span className={`font-bold ${color}`}>{pointsEarned}</span> points!
      </p>
      <button
        onClick={onNextRound}
        className="mt-6 px-6 py-3 bg-sky-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all duration-200"
      >
        Next Round
      </button>
    </div>
  );
};

export default ResultDisplay;
