import { Request, Response } from 'express';
import * as keskusteluModel from '../models/keskustelu';
import * as vastausModel from '../models/vastaus';

export const uusi = async (req : Request, res : Response) : Promise<void> => {
    try {
        if (req.query.kohde === "keskustelu" && req.body.otsikko && req.body.sisalto && req.body.kategoria) {
            res.status(201).json(await keskusteluModel.uusiKeskustelu(req.body, req.headers.authorization!.split(" ")[1]));
        } else if (req.query.kohde === "vastaus" && req.query.id && req.body.sisalto) {
            res.status(201).json(await vastausModel.uusiVastaus(req.body.sisalto, Number(req.query.id), req.headers.authorization!.split(" ")[1]));
        } else {
            throw {
                status: 404,
                viesti: "Huono pyyntö!"
            };
        }
    } catch (e : any) {
        console.log("Virhe controller:uusi()");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}

export const haeKeskusteluListaus = async (req : Request, res : Response) : Promise<void> => {
    try {
        res.status(200).json(await keskusteluModel.haeKeskustelut());
    } catch (e : any) {
        console.log("Virhe userController:haeKeskustelut");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}
export const haeKeskustelu = async (req : Request, res : Response) : Promise<void> => {
    try {
        res.status(200).json(await keskusteluModel.haeKeskustelu(Number(req.params.id)));
    } catch (e : any) {
        console.log("Virhe userController:haeKeskustelu");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}

export const haeKategoriat = async (req : Request, res : Response) : Promise<void> => {
    try {   
        res.status(200).json(await keskusteluModel.haeKategoriat());
    } catch (e : any) {
        console.log("Virhe userController:haeKategoriat");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}

export const tykkays = async (req : Request, res : Response) : Promise<void> => {
    try {
        const id : number = Number(req.params.id);
        if (req.query.kohde === "keskustelu" && req.body.kayttajatunnus) {
            res.status(201).json(await keskusteluModel.tykkaysKeskustelu(id, req.body.kayttajatunnus));
        } else if (req.query.kohde === "vastaus" && req.body.kayttajatunnus){
            res.status(201).json(await vastausModel.tykkaysVastaus(id, req.body.kayttajatunnus));
        } else {
            throw {
                status: 404,
                viesti: "Huono pyyntö!"
            }
        }
    } catch (e : any) {
        console.log("Virhe userController:tykkays");
        console.log(e);
        res.status(e.status).json(e.viesti);

    }
}

export const poista = async (req : Request, res : Response) : Promise<void> => {
    try {
        const id : number = Number(req.params.id);
        if (req.query.kohde === "keskustelu" && req.body.kayttajatunnus) {
            res.status(204).json({ viesti : await keskusteluModel.poistaKeskustelu(id, req.body.kayttajatunnus, req.headers.authorization!.split(" ")[1])});
        } else if (req.query.kohde === "vastaus" && req.body.kayttajatunnus) {
            res.status(204).json({ viesti : await vastausModel.poistaVastaus(id, req.body.kayttajatunnus, req.headers.authorization!.split(" ")[1])});
        } else {
            throw {
                status: 404,
                viesti: "Huono pyyntö!"
            }
        }
    } catch (e : any) {
        console.log("Virhe userController:poista");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}

export const muokkaa = async (req : Request, res : Response) : Promise<void> => {
    try {
        const id : number = Number(req.params.id);
        if (req.query.kohde === "keskustelu" && req.body.kayttajatunnus) {
            res.status(201).json({ viesti : await keskusteluModel.muokkaaKeskustelu(id, req.body, req.headers.authorization!.split(" ")[1]) } );
        } else if (req.query.kohde === "vastaus" && req.body.kayttajatunnus) {
            res.status(201).json({ viesti : await vastausModel.muokkaaVastaus(id, req.body, req.headers.authorization!.split(" ")[1]) } );
        } else {
            throw {
                status: 404,
                viesti: "Huono pyyntö!"
            }
        }
    } catch (e : any) {
        console.log("Virhe userController:muokkaa");
        console.log(e);
        res.status(e.status).json(e.viesti);
    }
}