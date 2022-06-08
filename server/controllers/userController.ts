import { Request, Response } from 'express';
import { kayttaja } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as kayttajaModel  from '../models/kayttaja';

export const rekisteroidy = async (req : Request, res : Response) : Promise<void> => {
    try {
        let kayttaja : kayttaja = await kayttajaModel.uusiKayttaja(req.body);
        let token : string = jwt.sign({
            kayttajatunnus : kayttaja.kayttajatunnus,
            rooli: kayttaja.rooli,
            }, 
            String(process.env.JWT_SECRET), 
            { expiresIn: "15m"}
            );
            res.status(201).json({
                token,
                kayttajatunnus : kayttaja.kayttajatunnus
            });
    } catch (e : any) {
        res.status(e.status).json(e.viesti);
    }
}

export const kirjaudu = async (req : Request, res : Response) : Promise<void> => {
    const { kayttajatunnus, salasana } = req.body;
    try {
        if (kayttajatunnus && salasana) {
            res.status(200).json({
                token: await kayttajaModel.kirjauduKayttaja(kayttajatunnus, salasana),
                kayttajatunnus : kayttajatunnus
            });
        } else {
            res.status(403).json({
                "viesti" : "Syötä käyttäjätunnus ja salasana!"
            });
        }
    } catch (e : any) {
        res.status(e.status).json(e.viesti);
    }
}

export const haeKayttaja = async (req : Request, res : Response) : Promise<void> => {
    try {
        res.status(200).json(await kayttajaModel.haeKayttaja(req.params.kayttajatunnus));
    } catch (e : any) {
        console.log("Virhe userController:haeKayttaja");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}

export const tarkistaToken = async (req : Request, res : Response) : Promise<void> => {
    res.status(200).json({viesti: "Tokeni on validi."});
}