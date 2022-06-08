import { Box, Button, Checkbox, FormControlLabel, Link, Stack, Typography } from "@mui/material";
import React, { useRef } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { uusiVastausProps } from "../types";

const UusiVastaus : React.FC<uusiVastausProps> = (props : uusiVastausProps) : JSX.Element => {

    const formRef : any = useRef<HTMLFormElement>();
    const quillRef : any = useRef<any>();

    const uusiVastaus = async (e : React.FormEvent) : Promise<void> => {
        e.preventDefault();
        if (formRef.current.ehdot.checked && Boolean(quillRef.current.getEditorContents())) {
            try {
                const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut?kohde=vastaus&id=${props.keskusteluId}`, {
                    method: "POST",
                    headers: {
                        "Authorization" : `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type" : "application/json"
                    },
                    body: JSON.stringify({
                        sisalto : quillRef.current.getEditorContents()
                    })
                });
                const vastaus : any = await yhteys.json();
                switch (yhteys.status) {
                    case 201:  let vastausApu : any = {
                                    id : vastaus.id,
                                    sisalto: vastaus.sisalto,
                                    kirjoitettu: vastaus.kirjoitettu,
                                    kayttaja: {
                                        kayttajatunnus : vastaus.kayttaja.kayttajatunnus,
                                    },
                                    tykkaykset: []
                              };
                              let keskusteluApu : any = props.data.keskustelu!;
                              keskusteluApu!.vastaus.push(vastausApu);
                              // Meni nämä tyypit niin sekaisin kun samat propsit kulkee kahden-kolmen eri komponentin läpi, niin oli pakko käyttää tuota seuraavalla rivillä olevaa...
                              // @ts-ignore
                              props.setData({...props.data, keskusteluApu});
                        break;
                }
            } catch (e : any) {
                
            }
        }
    }

    return (
            <Box>
                {localStorage.getItem("kayttajatunnus")
                    ? <Stack 
                        spacing={1}
                        component="form"
                        onSubmit={uusiVastaus}
                        ref={formRef}>
                        <ReactQuill 
                            ref={quillRef}
                            style={{height: 100, marginBottom: 50}}/>
                        <FormControlLabel control={<Checkbox required name="ehdot" />} label="Olen lukenut ja hyväksynyt käyttöehdot." />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained">
                            Lähetä vastaus
                        </Button>
                      </Stack>
                    : <Typography align="center">
                    <Link href="#/kirjaudu" underline="none">Kirjaudu sisään</Link> tai <Link href="#/rekisteroidy" underline="none">rekisteröidy</Link> vastataksesi keskusteluihin.</Typography>
                }
            </Box> 
    );
} 

export default UusiVastaus;