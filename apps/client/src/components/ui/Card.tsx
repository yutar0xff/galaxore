import React from 'react';
import { Card as CardType, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';

// Import gem images
import rubyImg from '../../assets/gems/ruby.png';
import emeraldImg from '../../assets/gems/emerald.png';
import sapphireImg from '../../assets/gems/sapphire.png';
import diamondImg from '../../assets/gems/diamond.png';
import onyxImg from '../../assets/gems/onyx.png';

const GEM_COLORS: Record<GemColor, string> = {
  emerald: 'bg-green-500',
  sapphire: 'bg-blue-500',
  ruby: 'bg-red-500',
  diamond: 'bg-gray-100',
  onyx: 'bg-gray-800',
};

const GEM_BORDER_COLORS: Record<GemColor, string> = {
  emerald: 'border-green-700',
  sapphire: 'border-blue-700',
  ruby: 'border-red-700',
  diamond: 'border-gray-400',
  onyx: 'border-gray-600',
};

// Map colors to their images (undefined means no image available, fallback to color)
const GEM_IMAGES: Partial<Record<GemColor, string>> = {
  ruby: rubyImg,
  emerald: emeraldImg,
  sapphire: sapphireImg,
  diamond: diamondImg,
  onyx: onyxImg,
};

type CardSize = 'sm' | 'md' | 'lg' | 'xl';

const CARD_SIZES = {
  sm: { card: 'w-20 h-28', points: 'text-lg', gem: 'w-5 h-5', costDot: 'w-3 h-3', miniGem: 'w-1 h-1', padding: 'p-1.5', colGap: 'gap-0.5', dotGap: 'gap-0.5' },
  md: { card: 'w-24 h-36', points: 'text-xl', gem: 'w-6 h-6', costDot: 'w-4 h-4', miniGem: 'w-1.5 h-1.5', padding: 'p-2', colGap: 'gap-1', dotGap: 'gap-0.5' },
  lg: { card: 'w-32 h-48', points: 'text-2xl', gem: 'w-8 h-8', costDot: 'w-5 h-5', miniGem: 'w-2 h-2', padding: 'p-3', colGap: 'gap-1', dotGap: 'gap-1' },
  xl: { card: 'w-40 h-60', points: 'text-4xl', gem: 'w-10 h-10', costDot: 'w-6 h-6', miniGem: 'w-2.5 h-2.5', padding: 'p-4', colGap: 'gap-1.5', dotGap: 'gap-1' },
};

// Define gem order for consistent display
const GEM_ORDER: GemColor[] = ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx'];

// 5 gems arranged in a circle pattern (pentagon) - no border for cost gems
function FiveGemsCircle({ color, containerSize, miniGemSize }: { color: GemColor; containerSize: string; miniGemSize: string }) {
  const gemImage = GEM_IMAGES[color];

  // Pentagon positions (5 points arranged in a circle)
  const positions = [
    { top: '5%', left: '50%', transform: 'translate(-50%, 0)' },      // top center
    { top: '35%', left: '90%', transform: 'translate(-50%, -50%)' },  // top right
    { top: '85%', left: '75%', transform: 'translate(-50%, -50%)' },  // bottom right
    { top: '85%', left: '25%', transform: 'translate(-50%, -50%)' },  // bottom left
    { top: '35%', left: '10%', transform: 'translate(-50%, -50%)' },  // top left
  ];

  return (
    <div className={clsx("relative rounded-sm", containerSize)}>
      {positions.map((pos, i) => (
        <div
          key={i}
          className={clsx("absolute rounded-sm overflow-hidden", miniGemSize)}
          style={pos}
        >
          <img src={gemImage} alt={color} className="w-full h-full object-cover scale-150" />
        </div>
      ))}
    </div>
  );
}

// Render gem column - groups of 5 when count >= 6, NO border for cost gems
function renderGemColumn(count: number, color: GemColor, s: typeof CARD_SIZES['md']) {
  const dots: React.ReactNode[] = [];
  const gemImage = GEM_IMAGES[color];

  if (count <= 5) {
    // Show individual gems without border
    for (let i = 0; i < count; i++) {
      dots.push(
        <div
          key={i}
          className={clsx("rounded-sm overflow-hidden", s.costDot)}
        >
          <img src={gemImage} alt={color} className="w-full h-full object-cover scale-150" />
        </div>
      );
    }
  } else {
    // 6+ gems: show 5-gem circle at bottom, then remaining individual gems above
    const remainder = count - 5;

    // First add the 5-gem circle (will appear at bottom due to flex-col-reverse)
    dots.push(
      <FiveGemsCircle key="group-5" color={color} containerSize={s.costDot} miniGemSize={s.miniGem} />
    );

    // Then add remaining individual gems (will appear above the 5-gem circle)
    for (let i = 0; i < remainder; i++) {
      dots.push(
        <div
          key={`r-${i}`}
          className={clsx("rounded-sm overflow-hidden", s.costDot)}
        >
          <img src={gemImage} alt={color} className="w-full h-full object-cover scale-150" />
        </div>
      );
    }
  }

  return dots;
}

// Import level background images
import level1Img from '../../assets/mines/level1.png';
import level2Img from '../../assets/mines/level2.png';
import level3Img from '../../assets/mines/level3.png';

const LEVEL_IMAGES = {
  1: level1Img,
  2: level2Img,
  3: level3Img,
};

export function Card({ card, onClick, size = 'md' }: { card: CardType; onClick?: () => void; size?: CardSize }) {
  const s = CARD_SIZES[size];
  const bonusImage = GEM_IMAGES[card.gem];

  return (
    <div
        className={clsx(
            s.card, s.padding,
            "rounded-lg shadow-xl flex flex-col relative cursor-pointer hover:scale-105 transition-all duration-300 border border-white/40 ring-1 ring-black/5 bg-white overflow-hidden"
        )}
        onClick={onClick}
    >
      {/* Background Image (Watermark) */}
      <div className="absolute inset-0 pointer-events-none">
          <img
            src={LEVEL_IMAGES[card.level]}
            alt={`Level ${card.level}`}
            className="w-full h-full object-cover opacity-20"
          />
      </div>

      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-lg pointer-events-none" />

      {/* Header: Points and Bonus Gem (square with cropped image) */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className={clsx("font-bold text-black drop-shadow-sm", s.points)}>{card.points > 0 ? card.points : ''}</span>
        <div className={clsx(
          "rounded-sm border-2 overflow-hidden shadow-sm bg-white",
          s.gem,
          !bonusImage && GEM_COLORS[card.gem],
          GEM_BORDER_COLORS[card.gem]
        )}>
          {bonusImage && <img src={bonusImage} alt={card.gem} className="w-full h-full object-cover scale-150" />}
        </div>
      </div>

      {/* Cost - columns by color, square gems stacked vertically */}
      <div className={clsx("flex-1 flex items-end relative z-10", s.colGap)}>
        {GEM_ORDER.map(color => {
            const count = card.cost[color] || 0;
            if (count === 0) return null;
            return (
                <div key={color} className={clsx("flex flex-col-reverse", s.dotGap)}>
                    {renderGemColumn(count, color, s)}
                </div>
            );
        })}
      </div>
    </div>
  );
}

const CARDBACK_SIZES = {
  sm: { card: 'w-20 h-28', text: 'text-xl' },
  md: { card: 'w-24 h-36', text: 'text-2xl' },
  lg: { card: 'w-32 h-48', text: 'text-3xl' },
  xl: { card: 'w-40 h-60', text: 'text-4xl' },
};

export function CardBack({ level, size = 'md' }: { level: 1 | 2 | 3; size?: CardSize }) {
    const s = CARDBACK_SIZES[size];

    // Border colors matching the level theme
    const borderColors = {
        1: 'border-emerald-600/50',
        2: 'border-amber-600/50',
        3: 'border-blue-600/50'
    };

    const dotColors = {
        1: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        2: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]',
        3: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]'
    };

    return (
        <div className={clsx(
            s.card, s.text,
            "rounded-lg shadow-2xl flex flex-col items-center justify-center text-white font-bold relative overflow-hidden border-2 transition-transform hover:scale-105 bg-gray-900",
            borderColors[level]
        )}>
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={LEVEL_IMAGES[level]}
                    alt={`Level ${level}`}
                    className="w-full h-full object-cover opacity-60 filter brightness-75 contrast-125"
                />
            </div>

            {/* Dots only (no capsule blur / no extra decoration) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-2 transform rotate-45">
                    {Array.from({ length: level }).map((_, i) => (
                        <div
                            key={i}
                            className={clsx("w-3 h-3 rounded-full", dotColors[level])}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
