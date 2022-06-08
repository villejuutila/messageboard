import React, { useState } from "react";
import { Box, Divider, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import  parse  from 'html-react-parser';
import { helper } from "../helper/helper";
import UusiVastaus from "./UusiVastaus";
import MuokkaaVastaus from "./MuokkaaVastaus";
import { tykkaykset, vastauksetProps, vastaus } from '../types';


const Vastaukset : React.FC<vastauksetProps> = (props : vastauksetProps) : JSX.Element => {

    const [dialogiAuki, setDialogiAuki] = useState<boolean>(false);

    const [vastaukset, setVastaukset] = useState<vastaus[]>(props.vastaukset);

    const tykkays = async (id : number) : Promise<void> => {
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/tykkays/${id}?kohde=vastaus`, {
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
                case 201:   let tykkaysApu = vastaukset.find((vastaus : vastaus) => vastaus.id === id)
                            tykkaysApu!.tykkaykset = vastaus.tykkaykset;
                            let vastausApu = vastaukset.filter((vastaus : vastaus) => vastaus.id !== id);
                            vastausApu.push(tykkaysApu!);
                            setVastaukset(vastausApu);
                    break;
            }
        } catch (e : any) {
            console.log(e);
        }
    }

    const poista = async (id : number) : Promise<void> => {
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut/${id}?kohde=vastaus`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify( { kayttajatunnus : localStorage.getItem("kayttajatunnus") } )
            });
            switch (yhteys.status) {
                case 204:   alert("Vastauksen poistaminen onnistui!");
                            window.location.reload();
            }   
        } catch (e : any) {
            console.log(e);
            alert(e.toString());
        }
    }

    return (
        <Grid container direction="column">
            {vastaukset.map((vastaus : vastaus, idx : number) => {
                return  <Grid item key={idx}>
                            <Box>
                                <Tooltip title="Tykkää">
                                    <IconButton sx={{display: "inline", float: "right"}} 
                                        onClick={ () => tykkays(vastaus.id)}>
                                        <Typography variant="caption">{vastaus.tykkaykset.length}</Typography>
                                        <ThumbUpIcon
                                            color={vastaus.tykkaykset.includes(localStorage.getItem("kayttajatunnus")!) ? "primary" : "inherit"} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography variant="body1" align="left">{parse(vastaus.sisalto)}</Typography>
                            <Typography variant="caption" align="left">
                                <span style={{color: localStorage.getItem("kayttajatunnus") === vastaus.kayttaja['kayttajatunnus'] ? '#1565c0' : '#000000'}}>{vastaus.kayttaja['kayttajatunnus']}</span>  
                            </Typography>
                            <Typography variant="caption" align="left">
                                {` ${helper.aikaero(vastaus.kirjoitettu)}`} 
                                {vastaus.muokattu
                                    ? `${helper.aikaero(vastaus.muokattu)}` 
                                    : null
                                }
                            </Typography>
                            { localStorage.getItem("kayttajatunnus") === vastaus.kayttaja["kayttajatunnus"] || helper.puraToken(localStorage.getItem("token") ?? "ei tokenia") === "admin"
                                ?   <>
                                        <Tooltip title="Poista">
                                            <IconButton sx={{display: "inline", float: "right"}} onClick={ () => poista(vastaus.id)}>
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
                            <Divider />
                            
                            <MuokkaaVastaus dialogiAuki={dialogiAuki} setDialogiAuki={setDialogiAuki} vastaus={{id: vastaus.id, sisalto: vastaus.sisalto}}/>
                        </Grid>
            })}
            <UusiVastaus keskusteluId={props.keskusteluId} vastaukset={props.vastaukset} data={props.data} setData={props.setData} />
        </Grid>
    );
}

export default Vastaukset;