import { BottomNavigation, BottomNavigationAction, IconButton, Paper, Stack, TextField } from "@mui/material";
import { AccountBox, AccountBoxOutlined, Home, HomeOutlined, Login, LoginOutlined, Logout, PersonAdd, PersonAddOutlined, Search } from '@mui/icons-material';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import { navigaatioProps } from "../types";

const Navigaatio : React.FC<navigaatioProps> = (props : navigaatioProps) : JSX.Element => {

    const navigate : NavigateFunction = useNavigate();

    const polku : string = window.location.hash;

    const [haku, setHaku] = useState<string>("");

    return( 
            <Paper elevation={5} sx={{padding: 1, marginTop: 2, marginBottom: 2}}>
                <BottomNavigation>
                    <Stack direction="row" spacing={1}>
                        <BottomNavigationAction
                            showLabel 
                            label="Etusivu" 
                            icon={ polku.split("/")[1] === "" ? <Home color="primary" /> : <HomeOutlined /> } 
                            onClick={ () => navigate("/")} />
                        {props.kirjautunut
                            ?   <>
                                    <BottomNavigationAction
                                        showLabel 
                                        label="Profiili" 
                                        icon={ polku.split("/")[1] === "kayttaja" ? <AccountBox color="primary" /> : <AccountBoxOutlined /> } 
                                        onClick={ () => navigate(`/kayttaja/${localStorage.getItem("kayttajatunnus")}`)} />
                                    <BottomNavigationAction
                                        showLabel
                                        label="Kirjaudu ulos"
                                        icon={ <Logout color="primary" /> }
                                        onClick={ () => {
                                            localStorage.clear();
                                            props.setKirjautunut(false);
                                            navigate("/");
                                        }} />
                                </>
                            :   <>
                                    <BottomNavigationAction 
                                        showLabel
                                        label="Kirjaudu" 
                                        icon={ polku.split("/")[1] === "kirjaudu" ? <Login color="primary" /> : <LoginOutlined /> } 
                                        onClick={ () => navigate("/kirjaudu")} />
                                    <BottomNavigationAction
                                        showLabel 
                                        label="Rekisteröidy" 
                                        icon={ polku.split("/")[1] === "rekisteroidy" ? <PersonAdd color="primary" /> : <PersonAddOutlined /> } 
                                        onClick={ () => navigate("/rekisteroidy")} />
                                </>
                            }
                            <TextField 
                                size="small"
                                variant="outlined"
                                value={haku}
                                onChange={ (e : React.ChangeEvent<HTMLInputElement>) => setHaku(e.target.value)} />
                            <IconButton 
                                color="primary" 
                                size="small"
                                onClick={ () => {
                                    navigate(`/kayttaja/${haku}`);
                                    setHaku("");
                                }}>
                                <Search />
                            </IconButton>
                        </Stack>
                </BottomNavigation>
            </Paper>
    );
}

export default Navigaatio;