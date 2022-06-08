import { kayttaja, Prisma, PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient;

interface Virhe {
    status : number,
    viesti : string
}

export const uusiKayttaja = async (tiedot : Partial<kayttaja>) : Promise<kayttaja> => {
    const { kayttajatunnus, salasana, email, maa, profiilikuva } = tiedot;
    return new Promise(async (resolve : (kayttaja : kayttaja) => void, reject : (virhe : Virhe) => void) => {
        try {
            if (await tarkistaKayttaja(kayttajatunnus!, email)) {
                throw{
                    status: 403,
                    viesti: "Käyttäjätunnus tai sähköpostiosoite on jo käytössä"
                };
            } else {
                let kayttaja : kayttaja = await prisma.kayttaja.create({
                    data: {
                        id: uuid(),
                        kayttajatunnus: kayttajatunnus!,
                        salasana: crypto.createHash("sha512").update(salasana!).digest("hex"),
                        email: email!,
                        maa: maa ?? null,
                        profiilikuva: profiilikuva ?? null
                    }
                });
                resolve(kayttaja);
            }
        } catch (e : any) {
            reject(e)
        }
    });
} 

export const kirjauduKayttaja = async (kayttajatunnus : string, salasana : string) : Promise<string> => {
    return new Promise(async (resolve : (token : string) => void, reject : (virhe : Virhe) => void) => {
        try {
            let kayttaja : { kayttajatunnus : string, salasana : string, rooli : string }[] = await prisma.$queryRaw` SELECT 
                                                                                                    kayttajatunnus, salasana, rooli 
                                                                                                    FROM public.kayttaja 
                                                                                                    WHERE kayttajatunnus = ${kayttajatunnus}`;
                if (Boolean(kayttaja.length)) {
                    if (kayttaja[0].salasana === crypto.createHash("sha512").update(salasana).digest("hex")) {
                        let token : string = jwt.sign({
                            kayttajatunnus: kayttaja[0].kayttajatunnus,
                            rooli : kayttaja[0].rooli
                            }, 
                            String(process.env.JWT_SECRET),
                            { expiresIn: "15m" } 
                        );
                        resolve(token);
                    } else {
                        throw {
                            status: 403,
                            viesti: "Virheellinen salasana!"
                        }
                }
            } else {
                throw {
                    status: 403,
                    viesti: "Virheellinen käyttäjätunnus!"
                }
            }
        } catch (e : any) {
            reject(e)
        }
    });
}

export const haeKayttaja = async (kayttajatunnus : string) : Promise<any> => {
    try {
        let kayttaja : { kayttajatunnus : string, maa : string | null, profiilikuva : string | null, rekisteroitynyt : Date } | null = await prisma.kayttaja.findFirst({
            where: {
                kayttajatunnus
            }, select: {
                kayttajatunnus : true,
                maa : true,
                profiilikuva : true,
                rekisteroitynyt : true,
                keskustelu: { 
                    select: { 
                        id: true,
                        otsikko: true
                    }
                },
                vastaus: {
                    select: {
                        sisalto: true,
                        keskustelu: {
                            select: {
                                id: true,
                                otsikko: true
                            }
                        }
                    }
                }
            }
        });
        if (kayttaja !== null) {
            return kayttaja;
        } else {
            throw {
                status: 404,
                viesti: "Virheellinen käyttäjätunnus"
            }
        }
    } catch (e : any) {
        return e;
    }
}

const tarkistaKayttaja = async (kayttajatunnus : string, email? : string) : Promise<boolean> => {
        let kayttaja : kayttaja[] = await prisma.$queryRaw`   SELECT kayttajatunnus 
                                                            FROM public.kayttaja 
                                                            WHERE kayttajatunnus = ${kayttajatunnus}
                                                            ${Boolean(email) ? Prisma.sql`OR email = ${email}` : Prisma.empty}`;
        return Boolean(kayttaja.length)
}