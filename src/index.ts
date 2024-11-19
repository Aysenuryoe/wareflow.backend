/* istanbul ignore file */

import http from "http"; // Importiere das http-Modul für HTTP-Server
import https from "https"; // Importiere das https-Modul für HTTPS-Server
import mongoose from "mongoose"; // Importiere Mongoose für die MongoDB-Datenbankverbindung
import app from "./app"; // Importiere die Express-App

import dotenv from "dotenv"; // Importiere dotenv für Umgebungsvariablen
import { readFile } from "fs/promises"; // Importiere readFile für das Lesen von Dateien
import { prefillDB } from "./prefill"; // Importiere die Funktion zum Vorbefüllen der Datenbank

dotenv.config(); // Lade Umgebungsvariablen aus der .env-Datei

const useSSL = process.env.USE_SSL === "true"; // Überprüfe, ob SSL verwendet werden soll

async function setup() {
  let mongodURI = process.env.DB_CONNECTION_STRING; // Hole die DB-Verbindungszeichenfolge aus den Umgebungsvariablen
  if (!mongodURI) {
    console.error(
      `Cannot start, no database configured. Set environment variable DB_CONNECTION_STRING. Use "memory" for MongoMemoryServer`
    );
    process.exit(1); // Beende den Prozess, wenn keine DB-URL angegeben ist
  }
  if (mongodURI === "memory") {
    console.log("Start MongoMemoryServer");
    const MMS = await import("mongodb-memory-server"); // Importiere das MongoDB-Memory-Server-Modul
    const mongo = await MMS.MongoMemoryServer.create(); // Erstelle eine Instanz des Memory-Servers
    mongodURI = mongo.getUri(); // Hole die URI für den Memory-Server
  }

  console.log(`Connect to mongod at ${mongodURI}`);
  await mongoose.connect(mongodURI); // Stelle die Verbindung zur MongoDB her

  if (useSSL) {
    const [privateSSLKey, publicSSLCert] = await Promise.all([
      readFile(process.env.SSL_KEY_FILE!), // Lade den privaten SSL-Schlüssel
      readFile(process.env.SSL_CERT_FILE!), // Lade das öffentliche SSL-Zertifikat
    ]);

    const httpsPort = process.env.HTTPS_PORT
      ? parseInt(process.env.HTTPS_PORT)
      : 3001; // Bestimme den Port für HTTPS
    const httpsServer = https.createServer(
      { key: privateSSLKey, cert: publicSSLCert },
      app
    ); // Erstelle einen HTTPS-Server
    httpsServer.listen(httpsPort, () => {
      console.log(`Listening for HTTPS at https://localhost:${httpsPort}`);
    });
  } else {
    const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000; // Bestimme den HTTP-Port
    const httpServer = http.createServer(app); // Erstelle einen HTTP-Server
    httpServer.listen(port, () => {
      console.log(`Listening for HTTP at http://localhost:${port}`);
    });
  }

  if (process.env.DB_PREFILL === "true") {
    prefillDB(); // Fülle die Datenbank mit Testdaten, wenn die Umgebungsvariable gesetzt ist
  }
}

setup(); // Führe die Setup-Funktion aus
