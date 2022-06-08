import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const tarkistaToken = (req : Request, res : Response, next : NextFunction) : any => {
    try {
        const token : string = req.headers.authorization!.split(" ")[1];
        if (Boolean(token) === false) {
            return res.status(401).json({
                "viesti" : "Tokeni vaaditaan!"
            });
        } else {
            let decoded = jwt.verify(token, String(process.env.JWT_SECRET));
            return next();
        }
    } catch (e : any) {
        console.log(e);
        res.status(401).json({
            "viesti" : "Virheellinen tokeni!"
        });
    }
}