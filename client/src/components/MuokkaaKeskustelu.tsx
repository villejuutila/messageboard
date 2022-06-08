import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import React, { Dispatch, SetStateAction, useRef } from "react";
import ReactQuill from "react-quill";

interface Props {
    dialogiAuki : boolean,
    setDialogiAuki : Dispatch<SetStateAction<boolean>>,
    keskustelu: {
        id : number,
        otsikko : string,
        sisalto : string
    }
}

const MuokkaaKeskustelu : React.FC<Props> = (props : Props) : JSX.Element => {

    const formRef : any = useRef<HTMLFormElement>();
    const quillRef : any = useRef<HTMLFormElement>();

    const muokkaaKeskustelua = async (e: React.FormEvent) : Promise<void> => {
        e.preventDefault();
        let otsikko : string = `/Muokattu/ ${formRef.current.otsikko.value}`;
        let sisalto : string = `${quillRef.current.getEditorContents()} </br> /Muokattu/`;
        try {
            const yhteys = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut/${props.keskustelu.id}?kohde=keskustelu`, {
                method: "PUT",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type" : "application/json",
                    "Content-Length" : "38"
                },
                body: JSON.stringify({ 
                    otsikko, 
                    sisalto,
                    kayttajatunnus : localStorage.getItem("kayttajatunnus") 
                })
            });
            if (yhteys.status === 201) {
                window.location.reload();
            }
        } catch (e : any) {
            alert(e.toString());
        }
    }

    return(
            <Dialog 
                open={props.dialogiAuki}
                fullWidth 
                onClose={ () => props.setDialogiAuki(false)} >
                <DialogTitle>Muokkaa keskustelua "{props.keskustelu.otsikko}"</DialogTitle>
                <DialogContent style={{padding: 20}}>
                    <Stack 
                        spacing={1}
                        component="form"
                        onSubmit={muokkaaKeskustelua}
                        ref={formRef}>
                        <TextField 
                            fullWidth
                            required
                            name="otsikko"
                            label="Otsikko"
                            size="small"
                            defaultValue={props.keskustelu.otsikko} />
                        <ReactQuill 
                            ref={quillRef}
                            style={{height: 400, marginBottom: 50}}
                            defaultValue={props.keskustelu.sisalto} />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained">
                            Muokkaa keskustelua
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

export default MuokkaaKeskustelu;