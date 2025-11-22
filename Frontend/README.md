# MailClient (Expo + React + Redux)

This is a minimal Expo-based client for an internal mail system. It targets web and mobile via Expo and uses Redux Toolkit for state.

Features in this skeleton:
- Inbox (fetch messages)
- Compose (send message)
- Redux Toolkit slice with async thunks

Backend expectations (simple REST):
- GET /api/messages  -> list of messages
- POST /api/messages -> send a message (accepts { to, subject, body })

Setup (Windows PowerShell):

1. Install Expo CLI (if you don't have it):

```powershell
npm install -g expo-cli
```

2. Install dependencies:

```powershell
cd Frontend; npm install
# Then install native peer deps for navigation and paper (recommended):
expo install react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-paper react-native-vector-icons
```

3. Configure API base URL (create `.env` or set env var):

Edit `.env` or set environment variable `API_BASE_URL`. Example `.env`:

```
API_BASE_URL=http://your-backend-host:3000
```

4. Start in web mode:

```powershell
npm start
# then press w to open the web app, or use the devtools to open on a device
```

Run tests:

```powershell
npm test
```

Notes:
- This is a skeleton; adapt the UI and security (auth) to your internal requirements.
- For production, set proper CORS and secure the backend since the DB is on a physical server.
