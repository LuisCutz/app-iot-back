-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "tipo_cultivo" TEXT NOT NULL,
    "latitud" DECIMAL(65,30) NOT NULL,
    "longitud" DECIMAL(65,30) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "usuario_id" BIGINT NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "id" BIGSERIAL NOT NULL,
    "parcela_id" BIGINT NOT NULL,
    "humedad" DOUBLE PRECISION NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "lluvia" DOUBLE PRECISION NOT NULL,
    "sol" DOUBLE PRECISION NOT NULL,
    "fecha_lectura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_riego" TIMESTAMP(3),

    CONSTRAINT "lecturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas_globales" (
    "id" BIGSERIAL NOT NULL,
    "humedad" DOUBLE PRECISION NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "lluvia" DOUBLE PRECISION NOT NULL,
    "sol" DOUBLE PRECISION NOT NULL,
    "fecha_lectura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecturas_globales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
