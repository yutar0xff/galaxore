import { Card, OreColor, Noble } from '@galaxore/shared';

const CSV_DATA = `Level,Color,PV,Black,Blue,Green,Red,White
1,Black,0,0,1,1,1,1
1,Black,0,0,2,1,1,1
1,Black,0,0,2,0,1,2
1,Black,0,1,0,1,3,0
1,Black,0,0,0,2,1,0
1,Black,0,0,0,2,0,2
1,Black,0,0,0,3,0,0
1,Black,1,0,4,0,0,0
1,Blue,0,1,0,1,1,1
1,Blue,0,1,0,1,2,1
1,Blue,0,0,0,2,2,1
1,Blue,0,0,1,3,1,0
1,Blue,0,2,0,0,0,1
1,Blue,0,2,0,2,0,0
1,Blue,0,3,0,0,0,0
1,Blue,1,0,0,0,4,0
1,White,0,1,1,1,1,0
1,White,0,1,1,2,1,0
1,White,0,1,2,2,0,0
1,White,0,1,1,0,0,3
1,White,0,1,0,0,2,0
1,White,0,2,2,0,0,0
1,White,0,0,3,0,0,0
1,White,1,0,0,4,0,0
1,Green,0,1,1,0,1,1
1,Green,0,2,1,0,1,1
1,Green,0,2,1,0,2,0
1,Green,0,0,3,1,0,1
1,Green,0,0,1,0,0,2
1,Green,0,0,2,0,2,0
1,Green,0,0,0,0,3,0
1,Green,1,4,0,0,0,0
1,Red,0,1,1,1,0,1
1,Red,0,1,1,1,0,2
1,Red,0,2,0,1,0,2
1,Red,0,3,0,0,1,1
1,Red,0,0,2,1,0,0
1,Red,0,0,0,0,2,2
1,Red,0,0,0,0,0,3
1,Red,1,0,0,0,0,4
2,Black,1,0,2,2,0,3
2,Black,1,2,0,3,0,3
2,Black,2,0,1,4,2,0
2,Black,2,0,0,5,3,0
2,Black,2,0,0,0,0,5
2,Black,3,6,0,0,0,0
2,Blue,1,0,2,2,3,0
2,Blue,1,3,2,3,0,0
2,Blue,2,0,3,0,0,5
2,Blue,2,4,0,0,1,2
2,Blue,2,0,5,0,0,0
2,Blue,3,0,6,0,0,0
2,White,1,2,0,3,2,0
2,White,1,0,3,0,3,2
2,White,2,2,0,1,4,0
2,White,2,3,0,0,5,0
2,White,2,0,0,0,5,0
2,White,3,0,0,0,0,6
2,Green,1,0,0,2,3,3
2,Green,1,2,3,0,0,2
2,Green,2,1,2,0,0,4
2,Green,2,0,5,3,0,0
2,Green,2,0,0,5,0,0
2,Green,3,0,0,6,0,0
2,Red,1,3,0,0,2,2
2,Red,1,3,3,0,2,0
2,Red,2,0,4,2,0,1
2,Red,2,5,0,0,0,3
2,Red,2,5,0,0,0,0
2,Red,3,0,0,0,6,0
3,Black,3,0,3,5,3,3
3,Black,4,0,0,0,7,0
3,Black,4,3,0,3,6,0
3,Black,5,3,0,0,7,0
3,Blue,3,5,0,3,3,3
3,Blue,4,0,0,0,0,7
3,Blue,4,3,3,0,0,6
3,Blue,5,0,3,0,0,7
3,White,3,3,3,3,5,0
3,White,4,7,0,0,0,0
3,White,4,6,0,0,3,3
3,White,5,7,0,0,0,3
3,Green,3,3,3,0,3,5
3,Green,4,0,7,0,0,0
3,Green,4,0,6,3,0,3
3,Green,5,0,7,3,0,0
3,Red,3,3,5,3,0,3
3,Red,4,0,0,7,0,0
3,Red,4,0,3,6,3,0
3,Red,5,0,0,7,3,0`;

const parseCards = (): { 1: Card[], 2: Card[], 3: Card[] } => {
    const lines = CSV_DATA.trim().split('\n').slice(1); // Skip header
    const decks: { 1: Card[], 2: Card[], 3: Card[] } = { 1: [], 2: [], 3: [] };

    lines.forEach((line, index) => {
        const [levelStr, colorStr, pvStr, black, blue, green, red, white] = line.split(',');
        const level = parseInt(levelStr) as 1 | 2 | 3;
        const points = parseInt(pvStr);

        // Map CSV color to OreColor
        let ore: OreColor;
        switch(colorStr) {
            case 'Black': ore = 'onyx'; break;
            case 'Blue': ore = 'sapphire'; break;
            case 'Green': ore = 'emerald'; break;
            case 'Red': ore = 'ruby'; break;
            case 'White': ore = 'diamond'; break;
            default: throw new Error(`Unknown color: ${colorStr}`);
        }

        const card: Card = {
            id: `card-${level}-${index}`,
            level,
            points,
            ore,
            cost: {
                onyx: parseInt(black),
                sapphire: parseInt(blue),
                emerald: parseInt(green),
                ruby: parseInt(red),
                diamond: parseInt(white),
            }
        };

        if (decks[level]) {
            decks[level].push(card);
        }
    });

    return decks;
};

const decks = parseCards();

export const CARDS_1 = decks[1];
export const CARDS_2 = decks[2];
export const CARDS_3 = decks[3];

export const NOBLES: Noble[] = [
    { id: 'noble-1', points: 3, requirements: { diamond: 4, sapphire: 4, emerald: 0, ruby: 0, onyx: 0 } },
    { id: 'noble-2', points: 3, requirements: { diamond: 3, sapphire: 3, emerald: 3, ruby: 0, onyx: 0 } },
    { id: 'noble-3', points: 3, requirements: { diamond: 0, sapphire: 4, emerald: 4, ruby: 0, onyx: 0 } },
    { id: 'noble-4', points: 3, requirements: { diamond: 0, sapphire: 3, emerald: 3, ruby: 3, onyx: 0 } },
    { id: 'noble-5', points: 3, requirements: { diamond: 0, sapphire: 0, emerald: 4, ruby: 4, onyx: 0 } },
    { id: 'noble-6', points: 3, requirements: { diamond: 0, sapphire: 0, emerald: 3, ruby: 3, onyx: 3 } },
    { id: 'noble-7', points: 3, requirements: { diamond: 0, sapphire: 0, emerald: 0, ruby: 4, onyx: 4 } },
    { id: 'noble-8', points: 3, requirements: { diamond: 3, sapphire: 0, emerald: 0, ruby: 3, onyx: 3 } },
    { id: 'noble-9', points: 3, requirements: { diamond: 4, sapphire: 0, emerald: 0, ruby: 0, onyx: 4 } },
    { id: 'noble-10', points: 3, requirements: { diamond: 3, sapphire: 3, emerald: 0, ruby: 0, onyx: 3 } },
];
