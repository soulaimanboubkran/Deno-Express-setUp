// @deno-types="npm:@types/express@4"
import express, { NextFunction, Request, Response } from "npm:express";

const app = express();
const port: number = Number(Deno.env.get("APP_PORT")) || 3000;

app.get("/", (req: Request, res: Response): void => {
    res.send("Hello from Deno and Express!");
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
