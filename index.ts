import express, { Application } from "express";
import cors from "cors";
import { allSymbols, GameState, Image } from "./definitions";
import { makeInitOutcome, makeSpinOutcome } from "./logic";

const port = 8000;
const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const gameState = new GameState();
let rig: undefined | Image = undefined;

app.get("/spin", (req, res) => {
    if (gameState.flow === "baseGame" && gameState.balance - gameState.totalBet < 0) {
        res.status(402).send().end();
    }
    gameState.balance -= gameState.totalBet;
    gameState.flow = gameState.nextFlow;
    res.status(200).send(makeSpinOutcome(rig, gameState)).end();
    rig = undefined;
});

app.get("/init", (req, res) => {
    res.status(200).send(makeInitOutcome(gameState)).end();
});

app.post("/rig", (req, res) => {
    rig = req.body.rigData as Image;
    res.status(202).send().end();
});

app.listen(port, () => console.log(`App is running on http://localhost:${port}`));
