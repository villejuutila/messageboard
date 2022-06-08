import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import KayttajaProfiili from './components/KayttajaProfiili';
import { Route, Routes } from 'react-router-dom';
import Kirjaudu from './components/Kirjaudu';
import Rekisteroidy from './components/Rekisteroidy';
import Navigaatio from './components/Navigaatio';
import Keskustelu from './components/Keskustelu';
import KeskusteluListaus from './components/KeskusteluListaus';

const App : React.FC = () : JSX.Element => {

  const [kirjautunut, setKirjautunut] = useState<boolean>(false);

  const tarkistaToken = async (token : string) => {
    const yhteys : Response = await fetch(`https://soveltava-harjoitus.herokuapp.com/auth/token`, {
      method: 'GET',
      headers: {
        'Authorization' : `Bearer ${token}`
      }
    });
    switch (yhteys.status) {
      case 200: setKirjautunut(true);
        break;
      case 401: setKirjautunut(false);
                localStorage.clear();
        break;
    }
  }

  useEffect( () => {
    if (Boolean(localStorage.getItem("token"))) {
      tarkistaToken(localStorage.getItem("token")!);
    }
  });

  return (
    <Container maxWidth='lg'>
      <Typography align='center' variant='h4'>Sovellusohjelmointi 2: Soveltava harjoitustyö</Typography>
      <Navigaatio kirjautunut={kirjautunut} setKirjautunut={setKirjautunut} />
      <Routes>
        <Route path="/" element={ <KeskusteluListaus kirjautunut={kirjautunut} /> } />
        <Route path="/keskustelu/:id" element={ <Keskustelu kirjautunut={kirjautunut} /> } />
        <Route path="/kirjaudu" element={ <Kirjaudu setKirjautunut={setKirjautunut} /> } />
        <Route path="/rekisteroidy" element={ <Rekisteroidy setKirjautunut={setKirjautunut} /> } />
        <Route path="/kayttaja/:kayttajatunnus" element={ <KayttajaProfiili setKirjautunut={setKirjautunut} /> }/>
      </Routes>
    </Container>
  );
}

export default App;
