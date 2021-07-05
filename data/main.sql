BEGIN;

-- Suppression des tables si éxistantes dans la db actuelle
DROP TABLE IF EXISTS
"company",
"group",
"user",
"message",
"group_has_users" CASCADE;

-- NOW() est une function qui donne la date actuelle, donc si on l'utilise en valeur par défaut, created_at marche tout seul
-- "ON DELETE CASCADE" permet de supprimer l'entrée dans la table si la référence n'éxiste plus

CREATE TABLE "company" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "finess" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "num" INTEGER,
    "type" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "group" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "start_time" TIMESTAMP,
    "end_time" TIMESTAMP,
    "company_id" INTEGER NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "user" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "lastname" TEXT NOT NULL DEFAULT '',
    "firstname" TEXT NOT NULL DEFAULT '',
    "func" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL UNIQUE DEFAULT '',
    "password" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'user',
    "company_id" INTEGER NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "message" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "content" TEXT NOT NULL DEFAULT '',
    "group_id" INTEGER NOT NULL REFERENCES "group"("id") ON DELETE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "group_has_users" (
    PRIMARY KEY ("group_id", "user_id"),
    "role" TEXT NOT NULL DEFAULT 'user',
    "group_id" INTEGER NOT NULL REFERENCES "group"("id") ON DELETE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

COMMIT;