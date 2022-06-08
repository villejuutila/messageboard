import jwt from 'jsonwebtoken';
import sanitizeHTML from 'sanitize-html';
import { keskustelu, vastaus, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient;

interface Virhe {
    status : number,
    viesti : string
}

export const uusiVastaus = async (_sisalto : string, _keskusteluId : number, token : string) : Promise<vastaus> => {
    let keskusteluId : number = _keskusteluId;
    let sisalto = sanitizeHTML(_sisalto)
    let kayttajaId : string = await puraToken(token, 1);
    return new Promise(async (resolve : (vastaus : vastaus) => void, reject : (virhe : Virhe) => void) => {
        try {
            let vastaus : any = await prisma.$queryRaw
                `INSERT INTO public.vastaus(
                    sisalto, kirjoittajaid, keskusteluid
                )
                 VALUES (
                     ${sisalto},
                     ${kayttajaId},
                     ${keskusteluId}
                  ) RETURNING id, sisalto, tykkaykset, kirjoitettu`;
            vastaus[0] = {
                ...vastaus[0], 
                kayttaja: { 
                    kayttajatunnus: await puraToken(token, 2) 
                }
            };
            resolve(vastaus[0]);
        } catch (e : any) {
            console.log(e);
            reject(e)
        }
    });
} 

export const tykkaysVastaus = async (id : number, kayttajatunnus : string) : Promise<vastaus> => {
    return new Promise(async (resolve : (vastaus : vastaus) => void, reject : (virhe : Virhe) => void) => {
        try {
            let vastaus : vastaus[] = await prisma.$queryRaw`SELECT * FROM public.vastaus WHERE id = ${id} AND ${kayttajatunnus} = ANY(tykkaykset)`;
            if (vastaus.length === 0) {
                vastaus = await prisma.$queryRaw
                    `UPDATE public.vastaus 
                     SET tykkaykset = array_append(tykkaykset, ${kayttajatunnus}) 
                     WHERE id = ${id}
                     RETURNING id, tykkaykset`;
            } else {
                vastaus = await prisma.$queryRaw
                    `UPDATE public.vastaus
                     SET tykkaykset = array_remove(tykkaykset, ${kayttajatunnus})
                     WHERE id = ${id}
                     RETURNING id, tykkaykset`;
            }
            resolve(vastaus[0]);
        } catch (e : any) {
        reject({
            status: 500,
            viesti: "Palvelinvirhe!"
        });
        }
    });
}

export const poistaVastaus = async (id : number, kayttajatunnus : string, token : string) : Promise<string> => {
    return new Promise(async (resolve : (viesti : string) => void, reject : (virhe : Virhe) => void) => {
        try {
            let kirjoittajaKayttajatunnus : { kirjoittajaid : string, kayttajatunnus: string }[] = await prisma.$queryRaw
                `SELECT kirjoittajaid, public.kayttaja.kayttajatunnus 
                 FROM public.vastaus 
                 JOIN public.kayttaja
                 ON public.vastaus.kirjoittajaid = public.kayttaja.id
                 WHERE public.vastaus.id = ${id}`;
            if (kirjoittajaKayttajatunnus.length === 1) { 
                if (kirjoittajaKayttajatunnus[0].kayttajatunnus === kayttajatunnus || await puraToken(token, 3) === "admin") {
                    let poistettava : keskustelu = await prisma.$queryRaw`DELETE FROM public.vastaus WHERE id = ${id}`;
                    resolve(`Vastaus id:llä ${id} poistettu ${kayttajatunnus}:n toimesta!`);
                } else {
                    reject({
                        status: 401,
                        viesti: "Sinulla ei ole oikeutta poistaa tätä vastausta!"
                    });
                }   
            } else {
                reject({
                    status: 404,
                    viesti: `Id:llä ${id} ei löytynyt vastausta!`
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

export const muokkaaVastaus = async (id : number, tiedot : { sisalto : string, kayttajatunnus : string }, token : string) : Promise<vastaus> => {
    return new Promise(async (resolve : (vastaus : vastaus) => void, reject : (virhe : Virhe) => void) => {
        const { sisalto, kayttajatunnus } = tiedot;
        try {
            let kirjoittajaKayttajatunnus : { kirjoittajaid : string, kayttajatunnus: string }[] = await prisma.$queryRaw
                `SELECT kirjoittajaid, public.kayttaja.kayttajatunnus 
                 FROM public.vastaus 
                 JOIN public.kayttaja
                 ON public.vastaus.kirjoittajaid = public.kayttaja.id
                 WHERE public.vastaus.id = ${id}`;
            if (kirjoittajaKayttajatunnus.length === 1) { 
                if (kirjoittajaKayttajatunnus[0].kayttajatunnus === kayttajatunnus || await puraToken(token, 3) === "admin") {
                    let muokattava : vastaus = await prisma.$queryRaw
                        `UPDATE public.vastaus 
                         SET
                         ${(Boolean(sisalto)) ? Prisma.sql` sisalto = ${sisalto},` : Prisma.empty}
                         muokattu = current_timestamp
                         WHERE id = ${id}
                         RETURNING id, sisalto, tykkaykset, kirjoitettu, muokattu`;
                    resolve(muokattava);
                } else {
                    reject({
                        status: 401,
                        viesti: "Sinulla ei ole oikeutta muokata tätä vastausta!"
                    });
                }   
            } else {
                reject({
                    status: 404,
                    viesti: `Id:llä ${id} ei löytynyt vastausta!`
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