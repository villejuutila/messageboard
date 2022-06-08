import jwt from 'jsonwebtoken';
import sanitizeHTML from 'sanitize-html';
import {  keskustelu, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient;

interface Virhe {
    status : number,
    viesti : string
}

export const uusiKeskustelu = async (tiedot : { otsikko : string, sisalto : string, kategoria : string }, token : string) : Promise<Partial<keskustelu>> => {
    let { otsikko, sisalto, kategoria } = tiedot;
    let kayttajaId : string = await puraToken(token, 1);
    let kategoriaId : any;
    otsikko = sanitizeHTML(otsikko);
    sisalto = sanitizeHTML(sisalto);
    kategoria = sanitizeHTML(kategoria);
    if (Object.keys(await prisma.$queryRaw`SELECT id FROM public.kategoria WHERE nimi = ${kategoria}`).length === 0) {
        kategoriaId = await prisma.$queryRaw`INSERT INTO public.kategoria (nimi) VALUES (${kategoria}) RETURNING id`;
        console.log(`Uusi kategoria ${kategoria} lisätty tietokantaan.`);
    } else {
        kategoriaId = await prisma.$queryRaw`SELECT id FROM public.kategoria WHERE nimi = ${kategoria}`;
    }
    return new Promise(async (resolve : (keskustelu : Partial<keskustelu>) => void, reject : (virhe : Virhe) => void) => {
        try {
            let keskustelu : any = await prisma.$queryRaw
                `INSERT INTO public.keskustelu(
                    "otsikko", "sisalto", "kirjoittajaid", "kategoriaid"
                )
                 VALUES (
                     ${otsikko},
                     ${sisalto},
                     ${kayttajaId},
                     ${kategoriaId[0].id}
                  ) RETURNING id, otsikko, sisalto, tykkaykset, kirjoitettu`;
            keskustelu[0] = {
                ...keskustelu[0], 
                kayttaja: { 
                    kayttajatunnus: await puraToken(token, 2) 
                }, 
                kategoria: {
                     nimi : await etsiKategoria(kategoriaId[0].id) 
                }
            };
            console.log(`Uusi keskustelu aloitettu otsikolla ${otsikko}.`);
            resolve(keskustelu[0]);
        } catch (e : any) {
            console.log(e);
            reject(e)
        }
    });
} 

export const haeKeskustelut = async () : Promise<Partial<keskustelu[]>> => {
    return new Promise(async (resolve : (keskustelut : Partial<keskustelu[]>) => void, reject : (virhe : Virhe) => void) => {
        try {
            let keskustelut : any = await prisma.keskustelu.findMany({
                select: {
                    id: true,
                    otsikko: true,
                    tykkaykset: true,
                    kirjoitettu: true,
                    muokattu: true,
                    kayttaja: { 
                        select: {
                            kayttajatunnus: true
                        }},
                    kategoria: {
                        select: {
                            nimi: true
                        }
                    }
                },
                orderBy: {
                    kirjoitettu: 'desc'
                }
            });
            resolve(keskustelut);
        } catch (e : any) {
            console.log(e);
            reject({
                status: 500, 
                viesti: "Palvelinvirhe!"
            });
        }
    });
}

export const haeKeskustelu = async (id : number) : Promise<keskustelu> => {
    return new Promise(async (resolve : (keskustelu : keskustelu) => void, reject : (virhe : Virhe) => void) => {
        try {
            let keskustelu : any = await prisma.keskustelu.findUnique({
                where: {
                    id: id
                },
                select: {
                    id: true,
                    otsikko: true,
                    sisalto: true,
                    tykkaykset: true,
                    kirjoitettu: true,
                    muokattu: true,
                    kayttaja: { 
                        select: {
                            kayttajatunnus: true
                        }},
                    kategoria: {
                        select: {
                            nimi: true
                        }},
                        vastaus: {
                            select: {
                                id: true,
                                sisalto: true,
                                kirjoitettu: true,
                                muokattu: true,
                                tykkaykset: true,
                                kayttaja: {
                                    select: {
                                        kayttajatunnus: true
                                    }
                                }
                            }
                        }
                }
            });
            resolve(keskustelu);
        } catch (e : any) {
            console.log(e);
            reject({
                status: 500, 
                viesti: "Palvelinvirhe!"
            });
        }
    });
}

export const haeKategoriat = async () : Promise<string[]> => {
    return new Promise(async (resolve : (kategoriat : string[]) => void, reject : (virhe : Virhe) => void) => {
        try {
            let kategoriat : string[] = await prisma.$queryRaw`SELECT nimi FROM public.kategoria`;
            resolve(kategoriat);
        } catch (e : any) {
            reject({
                status: 500,
                viesti: "Palvelinvirhe!"
            })
        }
    });
}

export const tykkaysKeskustelu = async (id : number, kayttajatunnus : string) : Promise<keskustelu> => {
    return new Promise(async (resolve : (keskustelu : keskustelu) => void, reject : (virhe : Virhe) => void) => {
        try {
            let keskustelu : keskustelu[] = await prisma.$queryRaw`SELECT * FROM public.keskustelu WHERE id = ${id} AND ${kayttajatunnus} = ANY(tykkaykset)`;
            if (keskustelu.length === 0) {
                keskustelu = await prisma.$queryRaw
                    `UPDATE public.keskustelu 
                     SET tykkaykset = array_append(tykkaykset, ${kayttajatunnus}) 
                     WHERE id = ${id}
                     RETURNING id, tykkaykset`;
            } else {
                keskustelu = await prisma.$queryRaw
                    `UPDATE public.keskustelu
                     SET tykkaykset = array_remove(tykkaykset, ${kayttajatunnus})
                     WHERE id = ${id}
                     RETURNING id, tykkaykset`;
            }
            resolve(keskustelu[0]);
        } catch (e : any) {
        reject({
            status: 500,
            viesti: "Palvelinvirhe!"
        });
        }
    });
}

export const poistaKeskustelu = async (id : number, kayttajatunnus : string, token : string) : Promise<string> => {
    return new Promise(async (resolve : (viesti : string) => void, reject : (virhe : Virhe) => void) => {
        try {
            let kirjoittajaKayttajatunnus : { kirjoittajaid : string, kayttajatunnus: string }[] = await prisma.$queryRaw
                `SELECT kirjoittajaid, public.kayttaja.kayttajatunnus 
                 FROM public.keskustelu 
                 JOIN public.kayttaja
                 ON public.keskustelu.kirjoittajaid = public.kayttaja.id
                 WHERE public.keskustelu.id = ${id}`;
            if (kirjoittajaKayttajatunnus.length === 1) { 
                if (kirjoittajaKayttajatunnus[0].kayttajatunnus === kayttajatunnus || await puraToken(token, 3) === "admin") {
                    let poistettava : keskustelu = await prisma.$queryRaw`DELETE FROM public.keskustelu WHERE id = ${id}`;
                    resolve(`Keskustelu id:llä ${id} poistettu ${kayttajatunnus}:n toimesta!`);
                } else {
                    reject({
                        status: 401,
                        viesti: "Sinulla ei ole oikeutta poistaa tätä keskustelua!"
                    });
                }   
            } else {
                reject({
                    status: 404,
                    viesti: `Id:llä ${id} ei löytynyt keskusteluja!`
                })
            }
        } catch (e : any) {
            console.log(e);
            reject({
                status: 500,
                viesti: "Palvelinvirhe"
            });
        }
    });
}

export const muokkaaKeskustelu = async (id : number, tiedot : { otsikko : string, sisalto : string, kayttajatunnus : string }, token : string) : Promise<keskustelu> => {
    return new Promise(async (resolve : (keskustelu : keskustelu) => void, reject : (virhe : Virhe) => void) => {
        const { otsikko, sisalto, kayttajatunnus } = tiedot;
        try {
            let kirjoittajaKayttajatunnus : { kirjoittajaid : string, kayttajatunnus: string }[] = await prisma.$queryRaw
                `SELECT kirjoittajaid, public.kayttaja.kayttajatunnus 
                 FROM public.keskustelu 
                 JOIN public.kayttaja
                 ON public.keskustelu.kirjoittajaid = public.kayttaja.id
                 WHERE public.keskustelu.id = ${id}`;
            if (kirjoittajaKayttajatunnus.length === 1) { 
                if (kirjoittajaKayttajatunnus[0].kayttajatunnus === kayttajatunnus || await puraToken(token, 3) === "admin") {
                    let muokattava : keskustelu = await prisma.$queryRaw
                        `UPDATE public.keskustelu 
                         SET
                         ${(Boolean(otsikko)) ? Prisma.sql` otsikko = ${otsikko},` : Prisma.empty}
                         ${(Boolean(sisalto)) ? Prisma.sql` sisalto = ${sisalto},` : Prisma.empty}
                         muokattu = current_timestamp
                         WHERE id = ${id}
                         RETURNING id, otsikko, sisalto, tykkaykset, kirjoitettu, muokattu`;
                    resolve(muokattava);
                } else {
                    reject({
                        status: 401,
                        viesti: "Sinulla ei ole oikeutta muokata tätä keskustelua!"
                    });
                }   
            } else {
                reject({
                    status: 404,
                    viesti: `Id:llä ${id} ei löytynyt vastauksia!`
                })
            }
        } catch (e : any) {
            console.log(e);
            reject({
                status: 500,
                viesti: "Palvelinvirhe"
            });
        }
    });
}

const puraToken = async (token : any, valinta : number) : Promise<string> => {
    switch (valinta) {
        case 1: token = jwt.decode(token);
                let id : any = await prisma.kayttaja.findFirst({
                    where:{
                        kayttajatunnus : token.kayttajatunnus
                    },
                    select: {
                        id: true
                    } 
                });
                return id!.id;
        case 2: token = jwt.decode(token);
                return token.kayttajatunnus;
        case 3: token = jwt.decode(token);
                return token.rooli;
        default: return "Virhe!";
        }
}

const etsiKategoria = async (id : number) : Promise<string> => {
    let kategoria : any = await prisma.kategoria.findUnique({
        where:{
            id: id
        }
    });
    return kategoria.nimi;
}