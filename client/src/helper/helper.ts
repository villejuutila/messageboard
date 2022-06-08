import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

export const helper = {
    aikaero: (kirjoitettu : Date) : string => {
        let paivat : number = differenceInDays(Date.now(), new Date(kirjoitettu));
        let tunnit : number = differenceInHours(Date.now(), new Date(kirjoitettu));
        let minuutit : number = differenceInMinutes(Date.now(), new Date(kirjoitettu));
        if (paivat !== 0) {
            return paivat === 1 ? `${paivat} päivä sitten` : `${paivat} päivää sitten`;
        } else if (paivat === 0 && tunnit !== 0) {
            return tunnit === 1 ? `${tunnit} tunti sitten` : `${tunnit} tuntia sitten`;
        } else {
            return minuutit === 1 ? `${minuutit} minuutti sitten` : `${minuutit} minuuttia sitten`;
        }
    },
    puraToken: (t : string) : string => {
        if (t !== "ei tokenia") {
            let rooli : any = JSON.parse(window.atob(t.split(".")[1])).rooli;
            return rooli;
        } else {
            return "kayttaja"
        }
    }
}