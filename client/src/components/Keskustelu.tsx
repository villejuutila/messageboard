import React, { useEffect, useState } from 'react';
import { Alert, Backdrop, Box, CircularProgress, Divider, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import parse from 'html-react-parser'
import { helper } from '../helper/helper';
import Vastaukset from './Vastaukset';
import MuokkaaKeskustelu from './MuokkaaKeskustelu';
import { keskustelu, keskusteluData, keskusteluProps, tykkaykset } from '../types';

const Keskustelu : React.FC<keskusteluProps> = (props : keskusteluProps) : JSX.Element => {

    const { id } = useParams();
    const navigate : NavigateFunction = useNavigate();

    const [dialogiAuki, setDialogiAuki] = useState<boolean>(false);

    const [data, setData] = useState<Partial<keskusteluData>>({
        dataHaettu: false,
        dataHaetaan: false
    });

    const apiKutsu = async () : Promise<void> => {
        setData({
            ...data,
            dataHaetaan: true
        });
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut/${id}`);
            const vastaus : keskustelu | any = await yhteys.json();
            switch (yhteys.status) {
                case 200: setData({
                            keskustelu: vastaus,
                            dataHaettu: true,
                            dataHaetaan: false
                        });   
                    break;
                case 500: setData({
                            dataHaettu: true,
                            dataHaetaan: false,
                            virhe: vastaus.viesti
                          });
                    break;
            }
        } catch (e : any){
            setData({
                dataHaettu: true,
                dataHaetaan: false,
                virhe: `Odottamaton virhe: \t${e.toString()}`
            });
        }
    }

    const tykkays = async () : Promise<void> => {
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
                case 201: let keskusteluApu : keskustelu ={...data.keskustelu!, tykkaykset: vastaus.tykkaykset}
                          setData({
                              ...data, 
                              keskustelu: keskusteluApu
                            }); 
                    break;
            }
        } catch (e : any) {
            console.log(e);
        }
    }

    const poista = async () : Promise<void> => {
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut/${data.keskustelu!.id}?kohde=keskustelu`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify( { kayttajatunnus : localStorage.getItem("kayttajatunnus") } )
            });
            switch (yhteys.status) {
                case 204:   alert("Keskustelun poistaminen onnistui!");
                            navigate("/");
            }   
        } catch (e : any) {
            console.log(e);
            alert(e.toString());
        }
    }

    useEffect( () => {
        apiKutsu();
    }, []);

    return (
        <Paper elevation={5} sx={{padding: 1}}>
            {data.dataHaetaan
                ?   <Backdrop open={true}>
                        <Typography variant="caption">Haetaan tietoja...</Typography>
                        <CircularProgress color="primary" />
                    </Backdrop>
                :   data.dataHaettu
                        ?   Boolean(data.virhe)
                            ?   <Alert severity="error">{data.virhe}</Alert>
                            :   <><Grid container direction="column">
                                {data.keskustelu
                                    ?   <>
                                            <Box>
                                                <Typography sx={{display: "inline", float: "left"}} variant="h4" align="center">{data.keskustelu.otsikko}</Typography>
                                                <Tooltip title="Tykkää">
                                                    <IconButton sx={{display: "inline", float: "right"}} onClick={ () => tykkays()}>
                                                        <Typography variant="caption">{data.keskustelu.tykkaykset.length}</Typography>
                                                        <ThumbUpIcon
                                                            color={data.keskustelu.tykkaykset.includes(localStorage.getItem("kayttajatunnus")!) ? "primary" : "inherit"} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                                <Typography variant="body1" align="left">{parse(data.keskustelu.sisalto)}</Typography>
                                            <Box>
                                                <Typography variant="caption" align="left">
                                                    <span style={{color: localStorage.getItem("kayttajatunnus") === data.keskustelu.kayttaja["kayttajatunnus"] ? '#1565c0' : '#000000'}}>{data.keskustelu.kayttaja['kayttajatunnus']}</span>  
                                                </Typography>
                                                <Typography variant="caption" align="left">
                                                    {` ${helper.aikaero(data.keskustelu.kirjoitettu)}`} 
                                                    {data.keskustelu.muokattu
                                                        ? ` muokattu ${helper.aikaero(data.keskustelu.muokattu)}` 
                                                        : null
                                                    }
                                                </Typography>
                                                { localStorage.getItem("kayttajatunnus") === data.keskustelu.kayttaja["kayttajatunnus"] || helper.puraToken(localStorage.getItem("token") ?? "ei tokenia") === "admin"
                                                     ?  <>
                                                            <Tooltip title="Poista">
                                                                <IconButton sx={{display: "inline", float: "right"}} onClick={ () => poista()}>
                                                                    <DeleteIcon color="error" />
                                                            </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Muokkaa">
                                                                <IconButton sx={{display: "inline", float: "right"}} onClick={ () => setDialogiAuki(true)}>
                                                                    <EditIcon color="warning" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    : null
                                                }
                                            </Box>
                                            <MuokkaaKeskustelu dialogiAuki={dialogiAuki} setDialogiAuki={setDialogiAuki} keskustelu={{id: data.keskustelu!.id, otsikko: data.keskustelu!.otsikko, sisalto: data.keskustelu!.sisalto}}/>
                                        </>
                                    : null
                                }
                                </Grid>
                                <Divider />
                                <Vastaukset vastaukset={data.keskustelu!.vastaus} setData={setData} data={data} keskusteluId={data.keskustelu!.id} /></>
                        : null
            }
        </Paper>
    );
}

export default Keskustelu;