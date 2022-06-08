-- CreateTable
CREATE TABLE "kayttaja" (
    "id" UUID NOT NULL,
    "kayttajatunnus" TEXT NOT NULL,
    "salasana" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "maa" TEXT,
    "rooli" TEXT NOT NULL DEFAULT USER,
    "profiilikuva" TEXT,
    "rekisteroitynyt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kayttaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keskustelu" (
    "id" SERIAL NOT NULL,
    "otsikko" TEXT NOT NULL,
    "sisalto" TEXT NOT NULL,
    "tykkaykset" INTEGER NOT NULL DEFAULT 0,
    "kirjoitettu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muokattu" TIMESTAMP(3),
    "kirjoittajaId" UUID NOT NULL,
    "kategoriaId" INTEGER NOT NULL,

    CONSTRAINT "keskustelu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vastaus" (
    "id" SERIAL NOT NULL,
    "sisalto" TEXT NOT NULL,
    "tykkaykset" INTEGER NOT NULL DEFAULT 0,
    "kirjoitettu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muokattu" TIMESTAMP(3),
    "kirjoittajaId" UUID NOT NULL,
    "keskusteluId" INTEGER NOT NULL,

    CONSTRAINT "vastaus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategoria" (
    "id" SERIAL NOT NULL,
    "nimi" TEXT NOT NULL,

    CONSTRAINT "kategoria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "keskustelu" ADD CONSTRAINT "keskustelu_kirjoittajaId_fkey" FOREIGN KEY ("kirjoittajaId") REFERENCES "kayttaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keskustelu" ADD CONSTRAINT "keskustelu_kategoriaId_fkey" FOREIGN KEY ("kategoriaId") REFERENCES "kategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vastaus" ADD CONSTRAINT "vastaus_kirjoittajaId_fkey" FOREIGN KEY ("kirjoittajaId") REFERENCES "kayttaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vastaus" ADD CONSTRAINT "vastaus_keskusteluId_fkey" FOREIGN KEY ("keskusteluId") REFERENCES "keskustelu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
