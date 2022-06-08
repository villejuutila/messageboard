import { Alert, Button, Checkbox, FormControlLabel, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import React, { useRef, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Maat from '../data/maat.json';
import { rekisteroidyProps } from "../types";

const Rekisteroidy : React.FC<rekisteroidyProps> = (props : rekisteroidyProps) : JSX.Element => {
    
    const navigate : NavigateFunction = useNavigate();

    const formRef : any = useRef<HTMLFormElement>();

    const [virhe, setVirhe] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const fileToBase64 = async (file : any) : Promise<any> => {
        // Tämän tyypittäminen ? 
        // https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.filereader.html
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file[0]);
            fileReader.onload = () => {
                resolve(fileReader.result);
            }
            fileReader.onerror = (err) => {
                reject(err);
            }
        });
    } 

    const apiKutsu = async (e : React.FormEvent) : Promise<void> => {
        e.preventDefault();
        let profiilikuva : any = "";
        if (Boolean(formRef.current.profiilikuva.files.length)) {
            profiilikuva = await fileToBase64(formRef.current.profiilikuva.files);
        }
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/auth/rekisteroidy`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    kayttajatunnus : formRef.current.kayttajatunnus.value,
                    salasana : formRef.current.salasana.value,
                    email : formRef.current.email.value,
                    maa: formRef.current.maa.value ?? null,
                    profiilikuva: profiilikuva ?? null
                })
            });
            const vastaus : any = await yhteys.json();
            switch (yhteys.status) {
                case 201:   
                        localStorage.setItem("token", vastaus.token); 
                        localStorage.setItem("kayttajatunnus", vastaus.kayttajatunnus);
                        setVirhe("");
                        props.setKirjautunut(true);
                        navigate(`/kayttaja/${vastaus.kayttajatunnus}`)
                    break;
                case 403:   
                        setVirhe(vastaus);
                        setOpen(true);
                        props.setKirjautunut(false);
                    break;
            }
        } catch (e : any) {
            setVirhe(`Odottamaton virhe: ${e.toString()}`);
            setOpen(true);
        }
    }

    useEffect( () => {
        if (Boolean(localStorage.getItem("token"))) {
            navigate(`/kayttaja/${localStorage.getItem("kayttajatunnus")}`)
        }
    }, []);

    return (
            <>   
                <Snackbar anchorOrigin={{vertical: "top", horizontal: "right"}} open={open} autoHideDuration={4000} onClose={ () => setOpen(false)}>
                    <Alert severity="error">{virhe}</Alert>
                </Snackbar>
                <Paper ref={formRef} component="form" elevation={5} sx={{padding: 10}} onSubmit={apiKutsu}>
                    <Stack spacing={1} padding={1}>
                        <Typography fontWeight='bold' variant='body1' align="center">Kirjaudu sisään</Typography>
                        <TextField
                            required
                            name="kayttajatunnus"
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Käyttäjätunnus" />
                        <TextField
                            required
                            name="salasana"
                            fullWidth
                            variant="outlined"
                            type="password"
                            size="small"
                            label="Salasana" />
                        <TextField
                            required
                            name="salasana2"
                            fullWidth
                            variant="outlined"
                            type="password"
                            size="small"
                            label="Salasana uudestaan" />
                        <TextField
                            required
                            name="email"
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Sähköposti" />
                        <InputLabel>Maa</InputLabel>
                        <Select
                            name="maa"
                            fullWidth
                            size="small"
                            defaultValue=" ">
                            <MenuItem value=" ">En kerro</MenuItem>
                            {   Maat.map((maa : { nimi : string, koodi : string}, idx : number) => {
                                    return <MenuItem key={idx} value={maa.nimi}>{maa.nimi}</MenuItem>
                                })
                            }
                        </Select>
                        <InputLabel>Profiilikuva</InputLabel>
                        <TextField
                            name="profiilikuva"
                            fullWidth
                            size="small"
                            type="file" />
                        <FormControlLabel control={<Checkbox name="ehdot" />} label="Olen lukenut ja hyväksynyt käyttöehdot." /> 
                        <Button
                            type="submit"
                            fullWidth
                            size="small"
                            variant="contained">
                                Rekisteröidy
                        </Button>
                        <Typography variant="caption">Onko sinulla jo käyttäjä?</Typography>
                        <Button
                            fullWidth
                            size="small"
                            color="secondary"
                            variant="contained">
                                Kirjaudu
                        </Button>
                    </Stack>    
                </Paper>
            </>
    );
}

export default Rekisteroidy;