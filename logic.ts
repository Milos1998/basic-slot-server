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
    let totalWin = 0;
    winLines.forEach((winLine) => {
        totalWin += winLine.payout;
    });
    gameState.balance += totalWin;

    if (gameState.flow === "freeSpins") {
        gameState.fsLeft--;
        if (gameState.fsLeft === 0) gameState.nextFlow = "baseGame";
        return;
    }

    const sherifWin = winLines.find((winLine) => winLine.winSymbol === "sherif");
    if (sherifWin === undefined) return;
    gameState.fsWon = sherifWin.winCells.length * 2;
    gameState.fsLeft = gameState.fsWon;
}

function calculateWin(reelImage: Image, gameState: GameState) {
    const winLines = getStadardWinLines(reelImage, gameState);
    const scatterWin = getScatterWinLine(reelImage, gameState);
    if (scatterWin !== undefined) winLines.push(scatterWin);
    calculatePayouts(winLines, gameState);
    return winLines;
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
    }

    return winLines;
}

function isMatching(winLine: WinLine, symbol: Symbol): boolean {
    if (winLine.winSymbol === "reward1000" || symbol === "reward1000") return false;
    if (winLine.winSymbol === symbol) return true;
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
    winLine.payout = multiplier * gameState.totalBet;

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
        lines: WIN_LINES_DATA
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
