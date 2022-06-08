import { Dipsatch, Dispatch, SetStateAction } from "react"

//Tietokannaltamallien mukaiset olioiden tyypit
export type kayttaja = {
    id: string,
    kayttajatunnus: string,
    salasana: string,
    email: string,
    maa: string | null,
    rooli: string,
    profiilikuva: string | null,
    rekisteroitynyt: Date
}

export type keskustelu = {
    id: number,
    otsikko: string,
    sisalto: string,
    kirjoitettu: Date,
    muokattu: Date | null,
    kayttaja: {
        kayttajatunnus: string
    },
    kategoria: {
        nimi: string
    },
    tykkaykset: string[],
    vastaus: vastaus[]
}

export type vastaus = {
    id: number,
    sisalto: string,
    kirjoitettu: Date,
    muokattu: Date | null,
    kayttaja: {
        kayttajatunnus: string
    },
    tykkaykset: string[]
}

export type tykkaykset = {
    id: number,
    tykkaykset: string[]   
}

//Eri komponenttien data -tilamuuttujien tyypit
export type keskusteluData = {
    keskustelu: keskustelu,
    dataHaettu: boolean,
    dataHaetaan: boolean,
    virhe: string
}

export type keskusteluListausData = {
    keskustelut: keskustelu[],
    dataHaettu: boolean,
    dataHaetaan: boolean,
    virhe: string
}
export interface kayttajaProfiiliData extends kayttaja {
    dataHaettu: boolean,
    dataHaetaan: boolean,
    virhe: string,
    keskustelu: Partial<keskustelu[]>,
    vastaus: {
        sisalto: string,
        keskustelu: Partial<keskustelu>
    }[]
}


//Eri komponenttien propsien tyypit
export type keskusteluProps = {
    kirjautunut: boolean
}

export type vastauksetProps = {
    vastaukset: Vastaus[],
    data: Partial<keskusteluData>,
    setData: Dispatch<SetStateAction<Partial<keskusteluData>>>,
    keskusteluId: number
}

export type uusiKeskusteluProps = {
    dialogiAuki: boolean,
    data: Partial<keskusteluListausData>,
    setDialogiAuki: Dispatch<SetStateAction<boolean>>,
    setData: Dispatch<SetStateAction<Partial<keskusteluListausData>>>
}

export type uusiVastausProps = {
    keskusteluId: number,
    vastaukset: vastaus[],
    data: Partial<keskusteluData>,
    setData: Dispatch<SetStateAction<Partial<keskusteluData>>>
}

export type kayttajaPofiiliProps = {
    setKirjautunut: Dispatch<SetStateAction<boolean>>
}

export type kirjauduProps = {
    setKirjautunut: Dispatch<SetStateAction<boolean>>
}

export type rekisteroidyProps = {
    setKirjautunut: Dispatch<SetStateAction<boolean>>
}

export type navigaatioProps = {
    kirjautunut: boolean,
    setKirjautunut: Dispatch<SetStateAction<boolean>>
}