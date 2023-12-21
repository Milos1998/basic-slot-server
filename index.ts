import express, { Application } from "express";
import cors from "cors";
import { allSymbols, GameState, Image, WIN_LINES_DATA } from "./definitions";
import { makeInitOutcome, makeSpinOutcome } from "./logic";

const port = 8000;
const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const gameState: GameState = {
    balance: 1000,
    betPerLine: 5,
    flow: "baseGame",
    fsLeft: 0,
    fsWon: 0,
    lines: WIN_LINES_DATA.length,
    maxBetPerLine: 10,
    nextFlow: "baseGame",
    win: 0,
};
let rig: undefined | Image = undefined;

app.post("/spin", (req, res) => {
    if (gameState.flow === "baseGame") {
        gameState.betPerLine = req.body.betPerLine;
        gameState.lines = req.body.lines;
    }

    if (gameState.flow === "baseGame" && gameState.balance - (gameState.betPerLine * gameState.lines) < 0) {
        res.status(402).send().end();
    } else {
        res.status(200).send(makeSpinOutcome(rig, gameState)).end();
        rig = undefined;
    }
});

app.get("/init", (req, res) => {
    res.status(200).send(makeInitOutcome(gameState)).end();
});

app.post("/rig", (req, res) => {
    rig = req.body as Image;
    res.status(202).send().end();
});

app.listen(port, () => console.log(`App is running on http://localhost:${port}`));
