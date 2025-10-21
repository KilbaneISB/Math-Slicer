export type GameState = 'idle' | 'playing' | 'result';

export type Difficulty = 'easy' | 'medium' | 'hard' | '67';

export interface Fraction {
  numerator: number;
  denominator: number;
}
