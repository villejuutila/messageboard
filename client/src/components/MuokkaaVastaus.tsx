import { Button, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import React, { Dispatch, SetStateAction, useRef } from "react";
import ReactQuill from "react-quill";

interface Props {
    dialogiAuki : boolean,
    setDialogiAuki : Dispatch<SetStateAction<boolean>>,
    vastaus: {
        id : number,
        sisalto : string
    }
}

const MuokkaaKeskustelu : React.FC<Props> = (props : Props) : JSX.Element => {

    const formRef : any = useRef<HTMLFormElement>();
    const quillRef : any = useRef<HTMLFormElement>();

    const muokkaaVastausta = async (e: React.FormEvent) : Promise<void> => {
        e.preventDefault();
        let sisalto : string = `${quillRef.current.getEditorContents()} \t /Muokattu/`;
        try {
            const yhteys = await fetch(`https://soveltava-harjoitus.herokuapp.com/keskustelut/${props.vastaus.id}?kohde=vastaus`, {
                method: "PUT",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type" : "application/json",
                    "Content-Length" : "38"
                },
                body: JSON.stringify({ 
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
                <DialogTitle>Muokkaa vastausta</DialogTitle>
                <DialogContent style={{padding: 20}}>
                    <Stack 
                        spacing={1}
                        component="form"
                        onSubmit={muokkaaVastausta}
                        ref={formRef}>
                        <ReactQuill 
                            ref={quillRef}
                            style={{height: 400, marginBottom: 50}}
                            defaultValue={props.vastaus.sisalto} />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained">
                            Muokkaa vastausta
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