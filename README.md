# wareflow-backend

**wareflow-backend** ist das Backend des Warenwirtschaftssystems (WWS) **wareflow**, welches speziell auf die Bedürfnisse kleinerer Boutiquen zugeschnitten ist. Dieses Projekt wurde als Bachelorarbeit von Aysenur Yoleri realisiert.  
Das Backend basiert auf **Node.js** und **TypeScript** und nutzt **MongoDB** als Datenbank.

---

## Überblick

**wareflow-backend** stellt alle benötigten Schnittstellen (APIs) zur Verfügung, um die wichtigsten Prozesse in einem Warenwirtschaftssystem zu ermöglichen:

- Verwaltung von Produkten (inkl. Lagerbeständen)
- Einkaufsvorgänge (Purchase Orders) und Wareneingänge (Goods Receipts)
- Verkaufsaufträge (Sales Orders)
- Inventarbewegungen (z. B. Zu-/Abgänge, Retouren, Retourenbuchungen)
- Retouren-Management (z. B. beschädigte Ware, Kundenrücksendungen)
- Einfache Authentifizierung über JWT

Zielgruppe sind kleine Boutiquen, die auf möglichst einfache Art und Weise den Bestand und die Bestell- sowie Verkaufsprozesse verwalten möchten.

---

## Features

- **TypeScript**-basiertes Node.js-Backend
- **Express** als Webframework
- **MongoDB** als Datenbank (über Mongoose oder ein vergleichbares ODM)
- **JWT** (JSON Web Token) für Authentifizierung
- **Express-Validator** für Request-Validierungen und Fehlermeldungen
- **Routen** für Einkauf, Verkauf, Inventarbewegungen, Beschwerden und Retouren
- **Einfache CRUD-Funktionalitäten** für jedes Modul
- **CORS** konfiguriert für flexible Frontend-Anbindung

---

## Voraussetzungen

- **Node.js** (empfohlen Version 16 oder höher)
- **npm** oder **yarn** (je nach Präferenz)
- **MongoDB** (lokal installiert oder gehostet z. B. via MongoDB Atlas)

> **Hinweis:** Achte darauf, dass dein MongoDB-Server läuft oder dass du Zugriff auf einen gehosteten MongoDB-Cluster hast, bevor du das Backend startest.

---

## Installation & Setup

1. **Repository klonen**

   ```bash
   git clone <URL_zum_Repository>
   cd wareflow-backend
   ```

2. **Abhängigkeiten installieren**

   ```bash
   npm install
   ```

   oder

   ```bash
   yarn install
   ```

### 3. Umgebungsvariablen setzen

Erstelle eine `.env`-Datei im Stammverzeichnis deines Projekts (oder verwende Systemumgebungsvariablen) und trage dort deine Konfiguration ein. Unten findest du eine Übersicht der benötigten Umgebungsvariablen mit Beschreibungen und Beispielen.

| **Variable**           | **Beschreibung**                                                | **Beispiel**                        |
| ---------------------- | --------------------------------------------------------------- | ----------------------------------- |
| `DB_CONNECTION_STRING` | Verbindungszeichenfolge zur MongoDB-Datenbank                   | `mongodb://localhost:3001/wareflow` |
| `HTTP_PORT`            | Port für den HTTP-Server                                        | `3000`                              |
| `HTTPS_PORT`           | Port für den HTTPS-Server                                       | `3443`                              |
| `USE_SSL`              | Aktiviert die Verwendung von SSL (`true` oder `false`)          | `true`                              |
| `SSL_KEY_FILE`         | Pfad zur SSL-Schlüsseldatei                                     | `/pfad/zum/ssl/key.pem`             |
| `SSL_CERT_FILE`        | Pfad zur SSL-Zertifikatdatei                                    | `/pfad/zum/ssl/cert.pem`            |
| `JWT_SECRET`           | Geheimes Schlüssel für JWT-Authentifizierung                    | `dein_geheimes_jwt_schlüssel`       |
| `JWT_TTL`              | Gültigkeitsdauer des JWT (z.B. in Sekunden oder als Zeitspanne) | `3600` oder `1h`                    |
| `DB_PREFILL`           | Vorbefüllen der Datenbank (`true` oder `false`)                 | `false`                             |

#### Beispiel `.env`-Datei

```env
# Datenbankkonfiguration
DB_CONNECTION_STRING=mongodb://localhost:3001/wareflow

# Serverkonfiguration
HTTP_PORT=3000
HTTPS_PORT=3443
USE_SSL=true
SSL_KEY_FILE=/pfad/zum/ssl/key.pem
SSL_CERT_FILE=/pfad/zum/ssl/cert.pem

# JWT-Konfiguration
JWT_SECRET=dein_geheimes_jwt_schlüssel
JWT_TTL=3600

# Datenbankbefüllung
DB_PREFILL=false
```

#### Hinweise:

- **`DB_CONNECTION_STRING`**: Stelle sicher, dass die MongoDB-URL korrekt ist und auf deine Datenbankinstanz zeigt.
- **`USE_SSL`**: Setze diese Variable auf `true`, wenn du SSL/TLS für sichere Verbindungen verwenden möchtest. Andernfalls auf `false`.
- **`SSL_KEY_FILE` und `SSL_CERT_FILE`**: Diese Variablen sind nur erforderlich, wenn `USE_SSL=true` gesetzt ist. Gib den vollständigen Pfad zu deinen SSL-Schlüssel- und Zertifikatdateien an.
- **`JWT_SECRET`**: Verwende einen starken, zufälligen Schlüssel, um die Sicherheit deiner JWT-Token zu gewährleisten.
- **`JWT_TTL`**: Definiere, wie lange ein JWT-Token gültig sein soll. Dies kann in Sekunden (`3600` für eine Stunde) oder als Zeitspanne (`1h` für eine Stunde) angegeben werden.
- **`DB_PREFILL`**: Wenn diese Variable auf `true` gesetzt ist, werden beim Start des Servers möglicherweise vordefinierte Daten in die Datenbank eingefügt. Dies ist nützlich für Entwicklungs- oder Testumgebungen.

4. **Entwicklungsserver starten**
   ```bash
   npm run start
   ```
   Das Backend läuft nun standardmäßig unter `http://localhost:3000/`.

---

### Übersicht der API-Routen

| **Route-Datei**            | **Methode** | **Endpunkt** | **Beschreibung**                                                              |
| -------------------------- | ----------- | ------------ | ----------------------------------------------------------------------------- |
| **`authentication.ts`**    | -           | -            | Middleware für Authentifizierung (`authentication`, `optionalAuthentication`) |
| **`complaints.ts`**        | GET         | `/all`       | Alle Reklamationen abrufen                                                    |
|                            | GET         | `/:id`       | Eine spezifische Reklamation abrufen                                          |
|                            | POST        | `/`          | Eine neue Reklamation erstellen                                               |
|                            | PUT         | `/:id`       | Eine spezifische Reklamation aktualisieren                                    |
|                            | DELETE      | `/:id`       | Eine spezifische Reklamation löschen                                          |
| **`goodsreceipt.ts`**      | GET         | `/all`       | Alle Wareneingänge abrufen                                                    |
|                            | GET         | `/:id`       | Einen spezifischen Wareneingang abrufen                                       |
|                            | POST        | `/`          | Einen neuen Wareneingang erstellen                                            |
|                            | PUT         | `/:id`       | Einen spezifischen Wareneingang aktualisieren                                 |
|                            | DELETE      | `/:id`       | Einen spezifischen Wareneingang löschen                                       |
| **`inventoryMovement.ts`** | GET         | `/all`       | Alle Bestandsbewegungen abrufen                                               |
|                            | GET         | `/:id`       | Eine spezifische Bestandsbewegung abrufen                                     |
|                            | POST        | `/`          | Eine neue Bestandsbewegung erstellen                                          |
|                            | PUT         | `/:id`       | Eine spezifische Bestandsbewegung aktualisieren                               |
|                            | DELETE      | `/:id`       | Eine spezifische Bestandsbewegung löschen                                     |
| **`login.ts`**             | POST        | `/`          | Benutzer anmelden und JWT erhalten                                            |
| **`product.ts`**           | GET         | `/all`       | Alle Produkte abrufen                                                         |
|                            | GET         | `/:id`       | Ein spezifisches Produkt abrufen                                              |
|                            | POST        | `/`          | Ein neues Produkt erstellen                                                   |
|                            | PUT         | `/:id`       | Ein spezifisches Produkt aktualisieren                                        |
|                            | DELETE      | `/:id`       | Ein spezifisches Produkt löschen                                              |
| **`purchaseorder.ts`**     | GET         | `/all`       | Alle Bestellungen abrufen                                                     |
|                            | GET         | `/:id`       | Eine spezifische Bestellung abrufen                                           |
|                            | POST        | `/`          | Eine neue Bestellung erstellen                                                |
|                            | PUT         | `/:id`       | Eine spezifische Bestellung aktualisieren                                     |
|                            | DELETE      | `/:id`       | Eine spezifische Bestellung löschen                                           |
| **`return.ts`**            | GET         | `/all`       | Alle Rückgaben abrufen                                                        |
|                            | GET         | `/:id`       | Eine spezifische Rückgabe abrufen                                             |
|                            | POST        | `/`          | Eine neue Rückgabe erstellen                                                  |
|                            | PUT         | `/:id`       | Eine spezifische Rückgabe aktualisieren                                       |
|                            | DELETE      | `/:id`       | Eine spezifische Rückgabe löschen                                             |
| **`salesorder.ts`**        | GET         | `/all`       | Alle Verkaufsbestellungen abrufen                                             |
|                            | GET         | `/:id`       | Eine spezifische Verkaufsbestellung abrufen                                   |
|                            | POST        | `/`          | Eine neue Verkaufsbestellung erstellen                                        |
|                            | PUT         | `/:id`       | Eine spezifische Verkaufsbestellung aktualisieren                             |
|                            | DELETE      | `/:id`       | Eine spezifische Verkaufsbestellung löschen                                   |
| **`user.ts`**              | GET         | `/all`       | Alle Benutzer abrufen                                                         |
|                            | GET         | `/:id`       | Einen spezifischen Benutzer abrufen                                           |
|                            | POST        | `/`          | Einen neuen Benutzer erstellen                                                |
|                            | PUT         | `/:id`       | Einen spezifischen Benutzer aktualisieren                                     |
|                            | DELETE      | `/:id`       | Einen spezifischen Benutzer löschen                                           |

### Detaillierte Routenbeschreibung

#### 1. **Authentifizierung**

Die `authentication.ts`-Datei definiert Middleware-Funktionen zur Authentifizierung, jedoch keine direkten Routen.

- **`authentication`**: Middleware zur Überprüfung von JWT-Tokens und Extraktion der `userId`.
- **`optionalAuthentication`**: Middleware zur optionalen Überprüfung von JWT-Tokens.

#### 2. **Reklamationen (`complaints.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                           |
| ----------- | ------------ | ------------------------------------------ |
| GET         | `/all`       | Alle Reklamationen abrufen                 |
| GET         | `/:id`       | Eine spezifische Reklamation abrufen       |
| POST        | `/`          | Eine neue Reklamation erstellen            |
| PUT         | `/:id`       | Eine spezifische Reklamation aktualisieren |
| DELETE      | `/:id`       | Eine spezifische Reklamation löschen       |

#### 3. **Wareneingänge (`goodsreceipt.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                              |
| ----------- | ------------ | --------------------------------------------- |
| GET         | `/all`       | Alle Wareneingänge abrufen                    |
| GET         | `/:id`       | Einen spezifischen Wareneingang abrufen       |
| POST        | `/`          | Einen neuen Wareneingang erstellen            |
| PUT         | `/:id`       | Einen spezifischen Wareneingang aktualisieren |
| DELETE      | `/:id`       | Einen spezifischen Wareneingang löschen       |

#### 4. **Bestandsbewegungen (`inventoryMovement.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                                |
| ----------- | ------------ | ----------------------------------------------- |
| GET         | `/all`       | Alle Bestandsbewegungen abrufen                 |
| GET         | `/:id`       | Eine spezifische Bestandsbewegung abrufen       |
| POST        | `/`          | Eine neue Bestandsbewegung erstellen            |
| PUT         | `/:id`       | Eine spezifische Bestandsbewegung aktualisieren |
| DELETE      | `/:id`       | Eine spezifische Bestandsbewegung löschen       |

#### 5. **Login (`login.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                   |
| ----------- | ------------ | ---------------------------------- |
| POST        | `/`          | Benutzer anmelden und JWT erhalten |

#### 6. **Produkte (`product.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                       |
| ----------- | ------------ | -------------------------------------- |
| GET         | `/all`       | Alle Produkte abrufen                  |
| GET         | `/:id`       | Ein spezifisches Produkt abrufen       |
| POST        | `/`          | Ein neues Produkt erstellen            |
| PUT         | `/:id`       | Ein spezifisches Produkt aktualisieren |
| DELETE      | `/:id`       | Ein spezifisches Produkt löschen       |

#### 7. **Bestellungen (`purchaseorder.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                          |
| ----------- | ------------ | ----------------------------------------- |
| GET         | `/all`       | Alle Bestellungen abrufen                 |
| GET         | `/:id`       | Eine spezifische Bestellung abrufen       |
| POST        | `/`          | Eine neue Bestellung erstellen            |
| PUT         | `/:id`       | Eine spezifische Bestellung aktualisieren |
| DELETE      | `/:id`       | Eine spezifische Bestellung löschen       |

#### 8. **Rückgaben (`return.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                        |
| ----------- | ------------ | --------------------------------------- |
| GET         | `/all`       | Alle Rückgaben abrufen                  |
| GET         | `/:id`       | Eine spezifische Rückgabe abrufen       |
| POST        | `/`          | Eine neue Rückgabe erstellen            |
| PUT         | `/:id`       | Eine spezifische Rückgabe aktualisieren |
| DELETE      | `/:id`       | Eine spezifische Rückgabe löschen       |

#### 9. **Verkaufsbestellungen (`salesorder.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                                  |
| ----------- | ------------ | ------------------------------------------------- |
| GET         | `/all`       | Alle Verkaufsbestellungen abrufen                 |
| GET         | `/:id`       | Eine spezifische Verkaufsbestellung abrufen       |
| POST        | `/`          | Eine neue Verkaufsbestellung erstellen            |
| PUT         | `/:id`       | Eine spezifische Verkaufsbestellung aktualisieren |
| DELETE      | `/:id`       | Eine spezifische Verkaufsbestellung löschen       |

#### 10. **Benutzer (`user.ts`)**

| **Methode** | **Endpunkt** | **Beschreibung**                          |
| ----------- | ------------ | ----------------------------------------- |
| GET         | `/all`       | Alle Benutzer abrufen                     |
| GET         | `/:id`       | Einen spezifischen Benutzer abrufen       |
| POST        | `/`          | Einen neuen Benutzer erstellen            |
| PUT         | `/:id`       | Einen spezifischen Benutzer aktualisieren |
| DELETE      | `/:id`       | Einen spezifischen Benutzer löschen       |

---

## Authentifizierung

- **JWT-basiert**:  
  Bei geschützten Routen kann ein `Authorization`-Header im Format `Bearer <TOKEN>` erwartet werden.  
  Beispiele:
  ```bash
  curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/api/protected-route
  ```
- **Middleware**:  
  In der Datei `authentication.ts` befinden sich die Funktionen `authentication` (erzwingt Token) und `optionalAuthentication` (Token optional).

---

## Fehlerbehandlung

- Bei ungültigen Requests (z. B. falsches Datenformat, fehlende Felder) gibt **Express Validator** eine entsprechende Fehlermeldung mit `400 (Bad Request)` zurück.
- Bei fehlenden oder ungültigen Tokens gibt es einen **401 (Unauthorized)**-Status.
- Für nicht gefundene Ressourcen wird i. d. R. ein **404 (Not Found)** ausgegeben.

---

## Lizenz

Dieses Projekt wurde im Rahmen einer Bachelorarbeit von Aysenur Yoleri erstellt. Zur genauen Lizenzierung liegen noch keine detaillierten Angaben vor. Bitte wende dich an die Projektverantwortlichen, wenn du dieses Projekt weiterverwenden oder adaptieren möchtest.

---
