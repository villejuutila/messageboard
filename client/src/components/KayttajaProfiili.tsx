import { Alert, Avatar, Backdrop, Box, CircularProgress, Grid, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import parse from 'html-react-parser';
import { kayttajaPofiiliProps, kayttajaProfiiliData } from "../types";

const KayttajaProfiili : React.FC<kayttajaPofiiliProps> = (props : kayttajaPofiiliProps) : JSX.Element => {
    
    const { kayttajatunnus } = useParams();
    const navigate : NavigateFunction = useNavigate();

    const [data, setData] = useState<Partial<kayttajaProfiiliData>>({
        kayttajatunnus: "", 
        maa: "",
        rekisteroitynyt: new Date(), 
        dataHaettu: false, 
        dataHaetaan: false
    });

    const apiKutsu = async () : Promise<void> => {
        setData({...data, dataHaetaan : true});
        try {
        const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/kayttajat/${kayttajatunnus}`, {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${localStorage.getItem("token")}`
            }
        });
        const vastaus : kayttajaProfiiliData = await yhteys.json();
        switch (yhteys.status) {
            case 200:   setData({
                            kayttajatunnus: vastaus.kayttajatunnus,
                            maa : vastaus.maa,
                            profiilikuva : vastaus.profiilikuva ?? null,
                            rekisteroitynyt : vastaus.rekisteroitynyt,
                            keskustelu: vastaus.keskustelu,
                            vastaus: vastaus.vastaus,
                            dataHaettu : true,
                            dataHaetaan : false
                        });
                break;
            case 401:   localStorage.clear();
                        props.setKirjautunut(false);
                        navigate("/kirjaudu");
                break;
            case 404:   navigate("/");
                break;
        }
        } catch (e : any) {
            setData({
                ...data,
                dataHaettu: true,
                dataHaetaan: false,
                virhe: `Odottamaton virhe: ${e.toString()}`
            });
        }
    }

    useEffect( () => {
        setData({
            ...data, 
            dataHaettu : false, 
            dataHaetaan : false
        });
        apiKutsu();
    }, []);

    return (
            <>
                { data.dataHaetaan
                    ?   <Backdrop open={true}>
                            <Typography variant="caption">Haetaan tietoja...</Typography>
                            <CircularProgress color="primary" />
                        </Backdrop>
                    : data.dataHaettu
                        ? Boolean(data.virhe)
                            ?   <Alert severity="error">
                                    <Typography variant="h6">{data.virhe}</Typography>
                                </Alert>
                            :   <Paper elevation={5} sx={{ padding: 2 }}>
                                    <Grid container xl='auto'>
                                        <Grid item >
                                            <Avatar 
                                            sx={{
                                                width: 250, 
                                                height: 250,
                                                marginRight: 5, 
                                                border: '2px solid #000', 
                                                boxShadow: '10px 10px 5px #c8c8c8'}} 
                                            src={data.profiilikuva!} 
                                            alt={`Käyttäjän ${data?.kayttajatunnus} profiilikuva`} />
                                        </Grid>
                                        <Grid item>
                                            <Typography fontWeight="bold" variant="body1">{data.kayttajatunnus}</Typography>
                                            <Typography variant="caption">Maa: {data.maa}</Typography>
                                            <Typography variant="caption" display="block">Rekisteröitynyt: {new Date(data.rekisteroitynyt!).toLocaleString("fi-FI")}</Typography>
                                            <Box sx={{float: "left"}}>
                                                <List>
                                                    <ListItem><Typography variant="subtitle2">{data.keskustelu?.length} aloitettua keskustelua</Typography></ListItem>
                                                    {data.keskustelu!.map((keskustelu : any, idx : number) => {
                                                        return  <ListItem key={idx} onClick={ () => navigate(`/keskustelu/${keskustelu.id}`)}>
                                                                    <ListItemText primary={keskustelu.otsikko} />
                                                                </ListItem>
                                                    })}
                                                </List>
                                            </Box>
                                            <Box sx={{float: "right"}}>
                                                <List>
                                                    <ListItem><Typography variant="subtitle2">{data.vastaus?.length} lähetettyä vastausta</Typography></ListItem>
                                                    {data.vastaus!.map((vastaus : any, idx : number) => {
                                                        let naytettavaSisalto : string = vastaus.sisalto.split(" ");
                                                        naytettavaSisalto = naytettavaSisalto.length === 1 
                                                                                ? naytettavaSisalto[0]
                                                                                : naytettavaSisalto.length === 2
                                                                                    ? `${naytettavaSisalto[0]} ${naytettavaSisalto[1]}`
                                                                                    : naytettavaSisalto.length === 3
                                                                                        ? `${naytettavaSisalto[0]} ${naytettavaSisalto[1]} ${naytettavaSisalto[2]}`
                                                                                        : naytettavaSisalto.length > 3
                                                                                            ? `${naytettavaSisalto[0]} ${naytettavaSisalto[1]} ${naytettavaSisalto[2]} ...`
                                                                                            : "Tyhjä kommentti, onko tämä bugi?";
                                                        return <ListItem sx={{padding: 0}} key={idx} onClick={ () => navigate(`/keskustelu/${vastaus.keskustelu.id}`)}>
                                                            <ListItemText primary={parse(naytettavaSisalto)} secondary={vastaus.keskustelu.otsikko} />
                                                        </ListItem>
                                                    })}
                                                </List>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                        :   null
                }
            </>
    );
}

export default KayttajaProfiili;