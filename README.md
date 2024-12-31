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
- Verwaltung von Benutzern (inkl. Rollen und Rechten, sofern erweitert)
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

3. **Umgebungsvariablen setzen**  
   Erstelle eine `.env`-Datei (oder verwende Systemumgebungsvariablen) und trage dort deine Konfiguration für die Datenbank ein (siehe [Umgebungsvariablen](#umgebungsvariablen)).

4. **Entwicklungsserver starten**
   ```bash
   npm run start
   ```
   Das Backend läuft nun standardmäßig unter `http://localhost:3000/`.

---

## API-Routen

Die folgenden Routen stehen unter dem Namespace `/api` zur Verfügung. (z. B. `http://localhost:3000/api/product`)

> **Hinweis**: In vielen der Routen werden **`express-validator`**-Validierungen eingesetzt, um Request-Parameter (z. B. IDs, Datentypen) zu prüfen.

### Login

- **POST** `/api/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ accessToken: string, tokenType: 'Bearer' }`
  - Zweck: Einloggen und JWT erhalten.

### User Management

- **GET** `/api/user/all`
  - Holt alle User.
- **GET** `/api/user/:id`
  - Holt einen bestimmten User (über MongoID).
- **POST** `/api/user`
  - Legt neuen User an.
  - Body: `{ email, password, admin }`
- **PUT** `/api/user/:id`
  - Aktualisiert User-Daten.
  - Body: `{ email, password?, admin }`
- **DELETE** `/api/user/:id`
  - Löscht einen User.

### Products

- **GET** `/api/product/all`
  - Holt alle Produkte.
- **GET** `/api/product/:id`
  - Holt ein bestimmtes Produkt.
- **POST** `/api/product`
  - Legt ein neues Produkt an.
  - Body: `{ name, size, price, color, stock, minStock? }`
- **PUT** `/api/product/:id`
  - Aktualisiert ein vorhandenes Produkt.
- **DELETE** `/api/product/:id`
  - Löscht ein Produkt.

### Purchase Orders

- **GET** `/api/purchase/all`
  - Holt alle Bestellungen.
- **GET** `/api/purchase/:id`
  - Holt eine bestimmte Bestellung.
- **POST** `/api/purchase`
  - Lege eine neue Bestellung an.
  - Body: `{ products, supplier, status, orderDate, receivedDate? }`
- **PUT** `/api/purchase/:id`
  - Aktualisiert eine bestehende Bestellung.
- **DELETE** `/api/purchase/:id`
  - Löscht eine Bestellung.

### Goods Receipts

- **GET** `/api/goodsreceipt/all`
- **GET** `/api/goodsreceipt/:id`
- **POST** `/api/goodsreceipt`
  - Body: `{ purchaseOrderId, products, receivedDate, status, remarks? }`
- **PUT** `/api/goodsreceipt/:id`
- **DELETE** `/api/goodsreceipt/:id`

### Sales Orders

- **GET** `/api/sales/all`
- **GET** `/api/sales/:id`
- **POST** `/api/sales`
  - Body: `{ products, totalAmount, createdAt? }`
- **PUT** `/api/sales/:id`
- **DELETE** `/api/sales/:id`

### Inventory Movements

- **GET** `/api/inventory/all`
- **GET** `/api/inventory/:id`
- **POST** `/api/inventory`
  - Body: `{ productId, type, quantity, date }`
- **PUT** `/api/inventory/:id`
- **DELETE** `/api/inventory/:id`

### Complaints

- **GET** `/api/complaint/all`
- **GET** `/api/complaint/:id`
- **POST** `/api/complaint`
  - Body: `{ referenceType, products, status }`
- **PUT** `/api/complaint/:id`
- **DELETE** `/api/complaint/:id`

### Returns

- **GET** `/api/return/all`
- **GET** `/api/return/:id`
- **POST** `/api/return`
  - Body: `{ products, status }`
- **PUT** `/api/return/:id`
- **DELETE** `/api/return/:id`

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
