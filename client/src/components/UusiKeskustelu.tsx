import { Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { NavigateFunction, useNavigate } from "react-router-dom";
import { keskustelu, uusiKeskusteluProps } from "../types";

const UusiKeskustelu : React.FC<uusiKeskusteluProps> = (props : uusiKeskusteluProps) : JSX.Element => {

    const navigate : NavigateFunction = useNavigate();

    const formRef : any = useRef<HTMLFormElement>();
    const quillRef : any = useRef<any>();

    const [valinta, setValinta] = useState<number>(0);

    const [kategoriat, setKategoriat] = useState<string[]>([]);
    const keskustelut : keskustelu[] = props.data.keskustelut!;

    const uusiKeskustelu = async (e : React.FormEvent) : Promise<void> => {
        e.preventDefault();
        let kategoria : string = valinta === 0 ? formRef.current.kategoria.value : formRef.current.uusiKategoria.value;
        if (formRef.current.ehdot.checked && Boolean(quillRef.current.getEditorContents())) {
            try {
                const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut?kohde=keskustelu`, {
                    method: "POST",
                    headers: {
                        "Authorization" : `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type" : "application/json"
                    },
                    body: JSON.stringify({
                        otsikko : formRef.current.otsikko.value,
                        sisalto : quillRef.current.getEditorContents(),
                        kategoria
                    })
                });
                switch (yhteys.status) {
                    case 201: keskustelut.unshift(await yhteys.json());
                              props.setData({
                                ...props.data,
                                keskustelut
                                });
                              props.setDialogiAuki(false);
                        break;
                    case 401: navigate("/")
                        break;
                }
            } catch (e : any) {
                
            }
        }
    }

    const haeKategoriat = async () : Promise<void> => {
        try {
            const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/kategoriat`);
            const vastaus : any = await yhteys.json();
            if (yhteys.status === 200) {
                let kategoriaApu : string[] = vastaus.map((kategoria : { nimi : string }) => {
                    return kategoria.nimi
                });
                setKategoriat(kategoriaApu);
            }
        } catch (e : any) {
            console.log(e);
        }
    }
    useEffect( () => {
        haeKategoriat();
    }, []);

    return (
            <Dialog 
                open={props.dialogiAuki}
                fullWidth 
                onClose={ () => props.setDialogiAuki(false)} >
                <DialogTitle>Aloita uusi keskustelu</DialogTitle>
                <DialogContent style={{padding: 20}}>
                    <Stack 
                        spacing={1}
                        component="form"
                        onSubmit={uusiKeskustelu}
                        ref={formRef}>
                        <TextField 
                            fullWidth
                            required
                            name="otsikko"
                            label="Otsikko"
                            size="small" />
                        <ReactQuill 
                            ref={quillRef}
                            style={{height: 400, marginBottom: 50}}/>
                        <InputLabel>Kategoria</InputLabel>
                        <Select name="kategoria" defaultValue={""} size="small">
                            <MenuItem value={0} onClick={ () => setValinta(0)}>Ei kategoriaa</MenuItem>
                            <MenuItem value={1} onClick={ () => setValinta(1)}>Luo uusi kategoria</MenuItem>
                            {kategoriat.map((kategoria : string, idx : number) => {
                                return <MenuItem key={idx} value={kategoria} onClick={ () => setValinta(0)}>{kategoria}</MenuItem>
                            })}
                        </Select>
                        { valinta === 1
                            ? <TextField 
                                fullWidth 
                                size="small"
                                variant="outlined"
                                name="uusiKategoria"
                                label="Uusi kategoria" />
                            : null
                        }
                        <FormControlLabel control={<Checkbox required name="ehdot" />} label="Olen lukenut ja hyväksynyt käyttöehdot." />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained">
                            Lähetä keskustelu
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            onClick={ () => props.setDialogiAuki(false)}>
                            Peruuta
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
    );
} 

export default UusiKeskustelu;