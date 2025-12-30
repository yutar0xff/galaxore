import { Card, Noble, GemColor } from '@local-splendor/shared';
import { v4 as uuidv4 } from 'uuid';

const GEMS: GemColor[] = ['emerald', 'sapphire', 'ruby', 'diamond', 'onyx'];

function generateCards(level: 1 | 2 | 3, count: number): Card[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `card-${level}-${i}`,
    level,
    points: level === 1 ? (Math.random() > 0.8 ? 1 : 0) : level === 2 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 3) + 3,
    cost: {
      emerald: Math.floor(Math.random() * 4),
      sapphire: Math.floor(Math.random() * 4),
      ruby: Math.floor(Math.random() * 4),
      diamond: Math.floor(Math.random() * 4),
      onyx: Math.floor(Math.random() * 4),
    },
    gem: GEMS[Math.floor(Math.random() * GEMS.length)],
  }));
}

export const CARDS_1 = generateCards(1, 40);
export const CARDS_2 = generateCards(2, 30);
export const CARDS_3 = generateCards(3, 20);

export const NOBLES: Noble[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `noble-${i}`,
  points: 3,
  requirements: {
    emerald: Math.floor(Math.random() * 2) * 3 || 3, // simplified random requirements
    sapphire: Math.floor(Math.random() * 2) * 3,
    ruby: Math.floor(Math.random() * 2) * 3,
  },
}));
