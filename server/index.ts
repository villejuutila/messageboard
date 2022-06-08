import express, { Application, NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes/router';

dotenv.config();

const app : Application = express();

app.use(express.json());

app.use(express.static(path.resolve(__dirname, "public")));

app.use("/", router);

app.listen(Number(process.env.PORT), () => {
    console.log(`Palvelin käynnistyi porttiin ${process.env.PORT}!`);
});