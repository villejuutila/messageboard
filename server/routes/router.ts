import express, { Router } from 'express';
import cors from 'cors';
import * as userController from '../controllers/userController';
import * as controller from '../controllers/controller';
import { tarkistaToken } from '../middleware/auth';

const router : Router = express.Router();

router.use(cors());

router.delete("/keskustelut/:id", tarkistaToken, controller.poista);
router.put("/tykkays/:id", tarkistaToken, controller.tykkays)
router.put("/keskustelut/:id", tarkistaToken, controller.muokkaa);
router.post("/auth/rekisteroidy", userController.rekisteroidy);
router.post("/auth/kirjaudu", userController.kirjaudu);
router.post("/keskustelut", tarkistaToken, controller.uusi);
router.get("/auth/token", tarkistaToken, userController.tarkistaToken);
router.get("/kayttajat/:kayttajatunnus", tarkistaToken, userController.haeKayttaja);
router.get("/keskustelut", controller.haeKeskusteluListaus);
router.get("/keskustelut/:id", controller.haeKeskustelu);
router.get("/kategoriat", controller.haeKategoriat);

export default router;