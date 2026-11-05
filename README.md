# DADO CRM

CRM per studio di produzione audiovisiva. Un unico progetto contiene entrambe le versioni:

- **Versione PC (desktop):** `?view=pc`
- **Versione Mobile (barra laterale a scomparsa):** `?view=swipe`
- Versione mobile con barra fissa: `?view=fixed`

## Avvio

```bash
npm install
cp .env.example .env     # inserire le proprie chiavi (opzionale)
npm run mobile           # build + server su http://localhost:3001
```

Poi aprire:

- PC: http://localhost:3001/?view=pc
- Mobile: http://localhost:3001/?view=swipe (da telefono: usare l'indirizzo del computer sulla stessa rete)

Il server Express (`server/index.js`) fornisce i dati del CRM e serve l'interfaccia compilata (`dist`).
La sincronizzazione Gmail e Gemini/OpenAI parte solo su richiesta (pulsante Aggiorna).

## Struttura

- `src/pages/*.pc.jsx` — schermate della versione PC
- `src/pages/*.jsx` — schermate della versione mobile
- `server/` — API e dati
