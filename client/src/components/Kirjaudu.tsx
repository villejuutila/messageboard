import { Alert, Button, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import React, { useRef, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { kirjauduProps } from "../types";

const Kirjaudu : React.FC<kirjauduProps> = (props : kirjauduProps) : JSX.Element => {

    const navigate : NavigateFunction = useNavigate();

    const formRef : any = useRef<HTMLFormElement>();

    const [virhe, setVirhe] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const apiKutsu = async (e : React.FormEvent) : Promise<void> => {
        e.preventDefault();
        const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/auth/kirjaudu`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                kayttajatunnus : formRef.current.kayttajatunnus.value,
                salasana : formRef.current.salasana.value})
        });
        const vastaus : { token: string, kayttajatunnus: string } | any = await yhteys.json();
        switch (yhteys.status) {
            case 200:   
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
                        <Button
                            type="submit"
                            fullWidth
                            size="small"
                            variant="contained">
                                Kirjaudu
                        </Button>
                        <Typography variant="caption">Eikö sinulla ole vielä käyttäjää?</Typography>
                        <Button
                            fullWidth
                            size="small"
                            color="secondary"
                            variant="contained">
                                Rekisteröidy
                        </Button>
                    </Stack>    
                </Paper>
            </>
    );
}

export default Kirjaudu;