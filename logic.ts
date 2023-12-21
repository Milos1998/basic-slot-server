import { randomInt } from "crypto";
import { allSymbols, GameState, Cell, WinLine, Image, Init, Symbol, NUM_CELLS, NUM_REELS, WIN_LINES_DATA, SpinOutcome, WIN_LINES, PAYTABLE } from "./definitions";

export function makeSpinOutcome(rig: undefined | Image, gameState: GameState): SpinOutcome {
    const reelImage = rig || makeReelImage();
    const winLines = calculateWin(reelImage, gameState);
    updateGameState(gameState, winLines);

    return {
        gameState,
        highlight: winLines,
        image: reelImage,
    }
}

function updateGameState(gameState: GameState, winLines: WinLine[]) {
    gameState.flow = gameState.nextFlow;

    let totalPay = 0;
    winLines.forEach((winLine) => {
        totalPay += winLine.payout;
    });

    if (gameState.flow === "freeSpins") {
        gameState.fsLeft--;
        gameState.win += totalPay;
        if (gameState.fsLeft === 0) {
            gameState.nextFlow = "baseGame";
            gameState.balance += gameState.win;
            gameState.fsWon = 0;
        }
        return;
    }

    gameState.balance -= gameState.betPerLine * gameState.lines;
    gameState.balance += totalPay;
    gameState.win = totalPay;

    const sherifWins = winLines.filter((winLine) => winLine.winSymbol === "sherif");
    if (sherifWins.length === 0) return;

    let maxFs = 0;
    sherifWins.forEach((sherifWin) => {
        const potentialFs = sherifWin.winCells.length * 2;
        if (potentialFs > maxFs) maxFs = potentialFs;
    });
    gameState.fsWon = maxFs;
    gameState.fsLeft = gameState.fsWon;
    gameState.nextFlow = "freeSpins";
}

function calculateWin(reelImage: Image, gameState: GameState) {
    const winLines = getStadardWinLines(reelImage, gameState);
    const scatterWin = getScatterWinLine(reelImage, gameState);
    if (scatterWin !== undefined) winLines.push(scatterWin);
    calculatePayouts(winLines, gameState);
    return winLines.filter((winLine) => winLine.payout > 0);
}

function getStadardWinLines(reelImage: Image, gameState: GameState): WinLine[] {
    const lines = WIN_LINES.slice(0, gameState.lines);

    const winLines: WinLine[] = [];
    for (const line of lines) {
        const winLine: WinLine = {
            winCells: [reelImage[0][line[0]]],
            payout: 0,
            winSymbol: reelImage[0][line[0]].symbol
        }

        for (let i = 1; i < line.length; i++) {
            const cell = reelImage[i][line[i]];

            if (!isMatching(winLine, cell.symbol)) break;

            if (winLine.winSymbol === "wild" && cell.symbol !== "wild") {
                winLines.push({
                    winSymbol: winLine.winSymbol,
                    payout: winLine.payout,
                    winCells: [...winLine.winCells],
                });
                winLine.winSymbol = cell.symbol;
            }

            winLine.winCells.push(cell);
        }
        winLines.push(winLine);
    }

    return winLines;
}

function isMatching(winLine: WinLine, symbol: Symbol): boolean {
    //reward1000 is scatter
    if (winLine.winSymbol === "reward1000" || symbol === "reward1000") return false;
    if (winLine.winSymbol === symbol) return true;
    //wild can't be substitute for sherif
    if (winLine.winSymbol === "sherif" || symbol === "sherif") return false;
    if (winLine.winSymbol === "wild" || symbol === "wild") return true;
    return false;
}

function getScatterWinLine(reelImage: Image, gameState: GameState) {
    const winLine: WinLine = {
        winSymbol: "reward1000",
        payout: 0,
        winCells: []
    };
    for (const reel of reelImage) {
        for (const cell of reel) {
            if (cell.symbol === "reward1000") winLine.winCells.push(cell);
        }
    }

    const payInfo = PAYTABLE.find((pay) => pay.symbol === "reward1000");
    if (payInfo === undefined) throw new Error("Missing pay info");
    let multiplier;
    if (winLine.winCells.length >= payInfo.payoutPerMatch.length)
        multiplier = payInfo.payoutPerMatch[payInfo.payoutPerMatch.length - 1];
    else multiplier = payInfo.payoutPerMatch[winLine.winCells.length];
    winLine.payout = multiplier * gameState.betPerLine * gameState.lines;

    if (winLine.winCells.length > 0) return winLine
    return undefined;
}

function calculatePayouts(winLines: WinLine[], gameState: GameState) {
    for (const winLine of winLines) {
        const payInfo = PAYTABLE.find((pay) => pay.symbol === winLine.winSymbol);
        if (payInfo === undefined) throw new Error("Missing pay info");

        if (winLine.winSymbol !== "reward1000") {
            const multiplier = payInfo.payoutPerMatch[winLine.winCells.length];
            winLine.payout = multiplier * gameState.betPerLine;
        }
    }
}

export function makeInitOutcome(gameState: GameState): Init {
    return {
        image: makeReelImage(),
        gameState,
        lines: WIN_LINES_DATA,
        paytable: PAYTABLE
    }
}


function makeReelImage(): Image {
    const image: Image = [];

    for (let i = 0; i < NUM_REELS; i++) {
        let reel: Cell[] = [];
        for (let j = 0; j < NUM_CELLS; j++) {
            reel.push(makeCell(i, j));
        }
        image.push(reel);
    }

    return image;
}

function makeCell(reel: number, cell: number): Cell {
    const symbolIdx = randomInt(allSymbols.length);

    return {
        position: { reel, cell },
        symbol: allSymbols[symbolIdx],
    };
}
