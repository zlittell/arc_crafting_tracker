# Firebase Setup — Session Persistence

This document covers everything needed to get user session persistence working, both for local development and production (GitHub Pages). It assumes you have repository access and can push to the `release` branch.

---

## How persistence works

There are two layers that coexist:

| Layer | When active | What it stores |
|---|---|---|
| `localStorage` | Always — no sign-in required | All state on the current browser/device |
| Firestore | Only when the user signs in with Google | Same state, synced across devices |

**Without Firebase configured** (no env vars), the app works exactly as it did before — `localStorage` only, no sign-in button shown. The Firebase code path is never invoked.

**With Firebase configured**, a "Sign in with Google" button appears in the header. Signed-in users get their loadout synced to Firestore and restored automatically on any device they sign in from.

### State that is persisted

- `selections` — crafting loadout (items + target levels + quantities)
- `modQuantities` — selected mods and their quantities
- `collected` — how many of each material the user has gathered

### localStorage keys

| Key | Value |
|---|---|
| `arc_selections` | `CraftSelection[]` JSON |
| `arc_mod_quantities` | `Record<string, number>` JSON |
| `arc_collected` | `Record<string, number>` JSON |

### Firestore document path

```
users/{uid}
  selections:      CraftSelection[]
  modQuantities:   Record<string, number>
  collected:       Record<string, number>
  updatedAt:       Timestamp
```

One document per user, under the `users` collection. Writes are debounced 1.5 seconds after the last state change to avoid hammering Firestore.

### Sign-in behaviour

- **Not signed in → signs in, document exists:** Firestore data overwrites local state.
- **Not signed in → signs in, no document (first sign-in):** Local state uploads to Firestore.
- **Signs out:** `localStorage` continues to work as normal. No data is deleted.

---

## New code files

| File | Purpose |
|---|---|
| [`src/lib/firebase.ts`](../src/lib/firebase.ts) | Initializes Firebase app, Auth, and Firestore. Exports `auth`, `db`, `isFirebaseConfigured`. Only runs `initializeApp` if `VITE_FIREBASE_API_KEY` is present. |
| [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) | React context wrapping `onAuthStateChanged`. Exposes `user`, `loading`, `isAvailable`, `signInWithGoogle`, `signOut`. |
| [`src/hooks/usePersistence.ts`](../src/hooks/usePersistence.ts) | Single hook called in `App.tsx`. Owns all persistence logic for both layers. |

---

## Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**, give it a name (e.g. `arc-crafting-tracker`)
3. Disable Google Analytics when prompted — it is not needed
4. Wait for the project to be created and click **Continue**

---

## Step 2 — Enable Google Sign-In

1. In the left sidebar go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, click **Google**
4. Toggle it **Enabled**
5. Set a **Project support email** (your email is fine)
6. Click **Save**

---

## Step 3 — Create a Firestore database

1. In the left sidebar go to **Build → Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we will add the correct rules next)
4. Choose a region close to your users (e.g. `us-central1`) and click **Enable**

### Add security rules

Once the database is created, go to the **Rules** tab and replace the default content with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**. This ensures each user can only read and write their own document.

---

## Step 4 — Register the web app and get config values

1. In the project overview, click the **`</>`** (web) icon to add a web app
2. Give it a nickname (e.g. `arc-crafting-tracker-web`)
3. Leave **Firebase Hosting** unchecked — we use GitHub Pages
4. Click **Register app**
5. You will see a `firebaseConfig` object. Copy these six values:

```js
const firebaseConfig = {
  apiKey: "...",            // VITE_FIREBASE_API_KEY
  authDomain: "...",        // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "...",         // VITE_FIREBASE_PROJECT_ID
  storageBucket: "...",     // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...", // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "...",             // VITE_FIREBASE_APP_ID
};
```

---

## Step 5 — Add the authorised domain for Google Sign-In

Google Sign-In will block popups from domains that are not on the allowlist.

1. In the Firebase console go to **Authentication → Settings → Authorised domains**
2. Add your GitHub Pages domain: `<your-github-username>.github.io`

For local development, `localhost` is already on the list by default.

---

## Step 6 — Local development setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored (`*.local` in `.gitignore`) — never commit it.

Open `.env.local` and paste the six values from Step 4:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Start the dev server:

```bash
bun dev
```

The "Sign in with Google" button should now appear in the header. Click it and verify sign-in works and that your loadout persists across page refreshes and in the Firestore console.

---

## Step 7 — Production setup (GitHub Pages)

The deploy workflow at [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) passes the Firebase config to Vite via environment variables at build time. You need to add them as repository secrets.

1. Go to your GitHub repository → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** for each of the six values:

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | your API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | e.g. `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `your-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | numeric sender ID |
| `VITE_FIREBASE_APP_ID` | e.g. `1:123:web:abc` |

Once saved, the next deploy (push to `release` branch or manual trigger) will bake the config into the production bundle.

---

## Troubleshooting

**Sign-in button does not appear**
The env vars are either missing or empty. Open DevTools → Application → Local Storage and check that you have items under `arc_selections` (localStorage is always active). Open the Console and look for Firebase init errors. Confirm `.env.local` exists and `VITE_FIREBASE_API_KEY` is set.

**Sign-in popup is blocked or fails with "auth/unauthorized-domain"**
Your domain is not on the Firebase allowlist. Go to **Authentication → Settings → Authorised domains** and add it (see Step 5).

**Data does not sync to another device**
Check that the user is signed into the same Google account on both devices. Open the Firestore console (**Build → Firestore Database → Data**) and look for a document at `users/{uid}` — if it exists the write worked. If it does not exist, check the browser console for permission errors, which usually means the security rules from Step 3 were not published.

**Production deploy builds fine but sign-in does not work**
Verify all six secrets are set in **Settings → Secrets and variables → Actions** and that the secret names match exactly (they are case-sensitive). Trigger a fresh deploy after adding or correcting secrets.
