# HanaShift Tech — sito statico

Sito multipagina in inglese con demo guidata interattiva. Nessun build step, nessuna dipendenza:
solo HTML, CSS e JavaScript vanilla. Pronto per il deploy su GitHub Pages.

## Struttura

```
hanashift-site/
├── index.html          Homepage + demo guidata
├── method.html         Our Method — registri, approccio tecnico, stato del progetto
├── products.html       Products — tre edizioni + early access
├── .nojekyll           Dice a GitHub Pages di non processare i file con Jekyll
├── privacy.html        Privacy Policy (bozza)
├── terms.html          Terms of Service (bozza)
├── assets/
│   ├── styles.css      Stile condiviso (design system in :root)
│   └── demo.js         Motore della chat guidata
└── README.md
```

## Girare in locale

Basta aprire `index.html` nel browser. Per un test più fedele (path relativi, cache) usa un server locale:

```bash
# Opzione 1 — Node
npx serve .

# Opzione 2 — Python
python3 -m http.server 5173
```

Poi apri `http://localhost:3000` (serve) o `http://localhost:5173` (python).

## Deploy su GitHub Pages

Il sito e statico puro: nessun build step, nessuna configurazione.

```bash
cd hanashift-site
git init
git add -A
git commit -m "HanaShift site"
git branch -M main
git remote add origin https://github.com/UTENTE/REPO.git
git push -u origin main
```

Poi su GitHub: **Settings -> Pages -> Source: Deploy from a branch -> main -> / (root) -> Save**.
Dopo un paio di minuti il sito e online. Spunta anche **Enforce HTTPS**.

### Due cose da sapere

**Nome del repo.** Se lo chiami `UTENTE.github.io` il sito sta su `https://UTENTE.github.io`.
Con qualsiasi altro nome finisce in un sottopercorso: `https://UTENTE.github.io/REPO/`.
Funziona uguale, perche tutti i link interni sono relativi.

**Il repo deve essere pubblico** (Pages su repo privati richiede un piano a pagamento).
Non ci sono segreti nel codice, quindi va bene — ma ricorda che chiunque puo leggere
le risposte scriptate della demo.

Il file `.nojekyll` serve a dire a GitHub di servire i file cosi come sono, senza
passarli da Jekyll. Non cancellarlo.

### Dominio personalizzato

Se piu avanti comprate un dominio: aggiungi un file `CNAME` nella root con dentro
solo il dominio (es. `hanashift.tech`), poi punta il DNS a GitHub Pages.

## Cosa collegare prima di andare online

1. **Form beta** — GitHub Pages non esegue codice lato server, quindi serve un servizio esterno.
   In `index.html` c'e la costante `FORM_ENDPOINT`: incollaci l'URL e il form inizia a funzionare.
   Opzioni gratuite: **Formspree** (50 invii/mese), **Getform**, oppure uno **script Google Apps**
   collegato a un foglio Google. Finche e vuota, il form valida i campi e spiega che manca
   l'endpoint. Senza questo non raccogli nessun contatto.
2. **Privacy Policy e Terms** — le pagine ci sono ma sono bozze: tutti i campi fra parentesi quadre
   `[...]` vanno compilati e il testo fatto rivedere da un avvocato prima di andare online.
3. **Contenuti giapponesi** — le frasi in keigo e le spiegazioni nella demo vanno validate da un
   madrelingua prima della pubblicazione. Un errore proprio nella demo che dimostra la competenza
   sul keigo fa più danno che non avere la demo.

## Sostituire la demo scriptata col modello reale

In `assets/demo.js` tutte le risposte stanno in due oggetti: `OUT` (scenario 1, output keigo per
destinatario) e `REPLY` (scenario 2, risposte in inglese). Le funzioni `thinking()` già simulano
la latenza di inferenza, quindi sostituire i valori statici con una chiamata asincrona al modello
non richiede di cambiare il flusso.

Attenzione: su GitHub Pages non puoi chiamare direttamente il modello, perché la chiave API
finirebbe nel codice pubblico. Quando arriverà il momento serve un piccolo backend (Cloudflare
Workers, Vercel Functions, Render) che tenga la chiave e faccia da tramite.

Nota: per il pitch conviene comunque tenere la versione scriptata — davanti a una giuria è più
affidabile di un modello che gira live.
