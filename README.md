# Lesson Battle

Eenvoudige realtime quiz-app voor VMBO economie, met een docentscherm op `/` en een leerlingenscherm op `/join`.

## Stack

- React + Vite + TailwindCSS
- Node.js + Express
- Socket.IO voor realtime quizupdates

## Lokaal starten

1. Installeer dependencies:

```bash
npm install
```

2. Start frontend en backend tegelijk:

```bash
npm run dev
```

3. Open:

- `http://localhost:5173/` voor de docent
- `http://localhost:5173/join` voor leerlingen

## Productie

Build de frontend met:

```bash
npm run build
```

Start daarna de server:

```bash
npm start
```

## Deploymentnoot

De code is geschikt voor een Node-runtime met WebSockets, zoals Vercel met een aparte realtime server, Firebase App Hosting/Cloud Run of een vergelijkbare containerhost. Pure serverless functies zijn minder geschikt voor langdurige Socket.IO-verbindingen.
