import React, { useEffect, useState } from 'react';
import { Alert, Backdrop, Button, CircularProgress, Divider, Grid, IconButton, Link, Paper, Typography } from '@mui/material';
import { ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { helper } from '../helper/helper';
import UusiKeskustelu from './UusiKeskustelu';
import { keskustelu, keskusteluListausData, keskusteluProps, tykkaykset } from '../types';

const KeskusteluListaus : React.FC<keskusteluProps> = (props : keskusteluProps) : JSX.Element => {

    const navigate : NavigateFunction = useNavigate();

    const [dialogiAuki, setDialogiAuki] = useState<boolean>(false);

    const [data, setData] = useState<Partial<keskusteluListausData>>({
        keskustelut: [],
        dataHaettu: false,
        dataHaetaan: false
    });

    const apiKutsu = async () : Promise<void> => {
        setData({
            ...data,
            dataHaetaan: true
        });
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut`);
            const vastaus : keskustelu[] | any = await yhteys.json();
            switch (yhteys.status) {
                case 200: setData({
                            keskustelut: vastaus,
                            dataHaettu: true,
                            dataHaetaan: false
                        });   
                    break;
                case 500: setData({
                            keskustelut: [],
                            dataHaettu: true,
                            dataHaetaan: false,
                            virhe: vastaus.viesti
                });
            }
        } catch (e : any){
            setData({
                keskustelut: [],
                dataHaettu: true,
                dataHaetaan: false,
                virhe: `Odottamaton virhe: \t${e.toString()}`
            });
        }
    }

    const tykkays = async (id : number) : Promise<void> => {
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/tykkays/${id}?kohde=keskustelu`, {
                method: 'PUT',
                headers: {
                    'Authorization' : `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type' : 'application/json',
                    'Content-Length' : '38'
                },
                body: JSON.stringify( { kayttajatunnus: localStorage.getItem("kayttajatunnus") } )
            });
            const vastaus : tykkaykset = await yhteys.json();
            switch (yhteys.status) {
                case 201:   let keskusteluApu = data.keskustelut;
                            keskusteluApu!.find((k : keskustelu) => k.id === vastaus.id ? k.tykkaykset = vastaus.tykkaykset : null);
                            setData({
                                ...data, 
                                keskustelut: keskusteluApu
                            });
                    break;
            }
        } catch (e : any) {
            console.log(e);
        }
    }

    useEffect( () => {
        apiKutsu();
    }, []);

    return (
        <Paper elevation={5} sx={{padding: 1}}>
            <Typography variant="h4" align="center">Keskustelut</Typography>
            { props.kirjautunut
                ? <Button 
                    variant="contained"
                    fullWidth
                    onClick={ () => setDialogiAuki(true)}>
                    Aloita uusi keskustelu
                  </Button>
                : <Typography align="center">
                    <Link href="#/kirjaudu" underline="none">Kirjaudu sisään</Link> tai <Link href="#/rekisteroidy" underline="none">rekisteröidy</Link> aloittaaksesi uusia keskusteluja.</Typography>}

            {data.dataHaetaan
                ?   <Backdrop open={true}>
                        <Typography variant="caption">Haetaan tietoja...</Typography>
                        <CircularProgress color="primary" />
                    </Backdrop>
                :   data.dataHaettu
                        ?   Boolean(data.virhe)
                            ?   <Alert severity="error">{data.virhe}</Alert>
                            :   <Grid container direction="column">
                                    { data.keskustelut!.map((keskustelu : keskustelu, idx : number) => {
                                        return  <Grid key={idx} item>
                                                    <Grid container spacing={1} columns={12}>
                                                        <Grid item xs={1}>
                                                            {keskustelu.tykkaykset.length}
                                                            <IconButton 
                                                                disabled={!props.kirjautunut}
                                                                onClick={ () => props.kirjautunut ? tykkays(keskustelu.id) : null } >
                                                                <ThumbUpIcon 
                                                                    color={keskustelu.tykkaykset.includes(localStorage.getItem("kayttajatunnus")!) ? "primary" : "inherit"} />
                                                            </IconButton>
                                                        </Grid>
                                                        <Grid item xs={10}>
                                                            <Typography onClick={ () => navigate(`/keskustelu/${keskustelu.id}`)} display="inline" variant="h6">{keskustelu.otsikko}</Typography>
                                                            <Button color="secondary" size="large">{keskustelu.kategoria['nimi']}</Button>
                                                        </Grid>
                                                        <Grid item xs={1}>
                                                        </Grid>
                                                        <Grid item xs={11}>
                                                            <Typography onClick={ () => navigate(`/kayttaja/${keskustelu.kayttaja['kayttajatunnus']}`)} display="block" variant="caption">
                                                                <span style={{color: localStorage.getItem("kayttajatunnus") === keskustelu.kayttaja['kayttajatunnus'] ? '#1565c0' : '#000000'}}>{keskustelu.kayttaja['kayttajatunnus']}</span>  
                                                                {helper.aikaero(keskustelu.kirjoitettu)}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <Divider />
                                                </Grid>
                                    })
                                    }
                                    { props.kirjautunut
                                        ? <Button 
                                            variant="contained"
                                            onClick={ () => setDialogiAuki(true)}>
                                            Aloita uusi keskustelu
                                          </Button>
                                        : <Typography align="center">
                                            <Link href="#/kirjaudu" underline="none">Kirjaudu sisään</Link> tai <Link href="#/rekisteroidy" underline="none">rekisteröidy</Link> aloittaaksesi uusia keskusteluja.</Typography>}
                                    <UusiKeskustelu dialogiAuki={dialogiAuki} setDialogiAuki={setDialogiAuki} data={data} setData={setData} /> 
                                </Grid>
                        : null
            }
        </Paper>
    );
}

export default KeskusteluListaus;