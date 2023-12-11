export type Symbol = "wild" | "sherif" | "reward1000" | "diamonds" | "hearts" | "spades" | "clubs" | "A" | "K" | "Q" | "J" | "10" | "9";

export const allSymbols = ["wild", "sherif", "reward1000", "diamonds", "hearts", "spades", "clubs", "A", "K", "Q", "J", "10", "9"] as const;

export type Cell = {
    position: {
        reel: number;
        cell: number;
    },
    symbol: Symbol;
}

export type WinLine = {
    winSymbol: Symbol;
    winCells: Cell[];
    payout: number;
}

export type Image = Cell[][];

export type Flow = "baseGame" | "freeSpins";

export class GameState {
    balance: number = 1000;
    win: number = 0;
    flow: Flow = "baseGame";
    nextFlow: Flow = "baseGame";
    betPerLine: number = 1;
    maxBetPerLine: number = 10;
    lines: number = WIN_LINES_DATA.length;
    fsWon: number = 0;
    fsLeft: number = 0;

    get totalBet () {
        return this.betPerLine * this.lines;
    }
}

export type SpinOutcome = {
    highlight: WinLine[],
    image: Image,
    gameState: GameState,
}

export type Init = {
    image: Image,
    gameState: GameState,
    lines: Line[],
}

export const NUM_REELS = 5;

export const NUM_CELLS = 3;

export type Line = {
    lineGroup: number,
    winPositions: number[];
}

export const WIN_LINES_DATA: Line[] = [
    {
        lineGroup: 0,
        winPositions: [1, 1, 1, 1, 1]
    },
    {
        lineGroup: 0,
        winPositions: [0, 0, 0, 0, 0]
    },
    {
        lineGroup: 0,
        winPositions: [2, 2, 2, 2, 2]
    },
    {
        lineGroup: 0,
        winPositions: [0, 1, 2, 1, 0]
    },
    {
        lineGroup: 0,
        winPositions: [2, 1, 0, 1, 2]
    },
    {
        lineGroup: 1,
        winPositions: [0, 0, 1, 2, 2]
    },
    {
        lineGroup: 1,
        winPositions: [2, 2, 1, 0, 0]
    },
    {
        lineGroup: 2,
        winPositions: [1, 0, 1, 2, 1]
    },
    {
        lineGroup: 3,
        winPositions: [1, 2, 1, 0, 1]
    },
    {
        lineGroup: 2,
        winPositions: [0, 1, 1, 1, 2]
    },
    {
        lineGroup: 3,
        winPositions: [2, 1, 1, 1, 0]
    },
    {
        lineGroup: 3,
        winPositions: [1, 0, 0, 1, 2]
    },
    {
        lineGroup: 2,
        winPositions: [1, 2, 2, 1, 0]
    },
    {
        lineGroup: 1,
        winPositions: [1, 1, 0, 1, 2]
    },
    {
        lineGroup: 4,
        winPositions: [1, 1, 2, 1, 0]
    },
    {
        lineGroup: 4,
        winPositions: [0, 0, 1, 2, 1]
    },
    {
        lineGroup: 4,
        winPositions: [2, 2, 1, 0, 1]
    },
    {
        lineGroup: 0,
        winPositions: [1, 0, 1, 2, 2]
    },
    {
        lineGroup: 2,
        winPositions: [1, 2, 1, 0, 0]
    },
    {
        lineGroup: 4,
        winPositions: [0, 0, 0, 1, 2]
    }
]

export const WIN_LINES = WIN_LINES_DATA.map((wld) => [...wld.winPositions]);

export type PaytableItem = {
    symbol: Symbol,
    payoutPerMatch: number[],
}

export const PAYTABLE: PaytableItem[] = [
    {
        symbol: "wild",
        payoutPerMatch: [0, 0, 10, 75, 150, 5000]
    },
    {
        symbol: "sherif",
        payoutPerMatch: [0, 0, 2, 30, 75, 500]
    },
    {
        symbol: "diamonds",
        payoutPerMatch: [0, 0, 2, 30, 75, 500]
    },
    {
        symbol: "hearts",
        payoutPerMatch: [0, 0, 0, 20, 50, 250]
    },
    {
        symbol: "spades",
        payoutPerMatch: [0, 0, 0, 20, 50, 250]
    },
    {
        symbol: "clubs",
        payoutPerMatch: [0, 0, 0, 20, 50, 250]
    },
    {
        symbol: "A",
        payoutPerMatch: [0, 0, 0, 10, 30, 150]
    },
    {
        symbol: "K",
        payoutPerMatch: [0, 0, 0, 5, 20, 100]
    },
    {
        symbol: "Q",
        payoutPerMatch: [0, 0, 0, 5, 20, 100]
    },
    {
        symbol: "J",
        payoutPerMatch: [0, 0, 0, 5, 20, 100]
    },
    {
        symbol: "10",
        payoutPerMatch: [0, 0, 0, 5, 15, 75]
    },
    {
        symbol: "9",
        payoutPerMatch: [0, 0, 2, 5, 15, 75]
    },
    {
        symbol: "reward1000",
        payoutPerMatch: [0, 0, 0, 1, 3, 10, 50, 100, 1000]
    }
]
