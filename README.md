# NOWLY — Real-Time Social Activity Discovery

> **“What is happening around me right now?”**
> Discover nearby spontaneous activities, connect with real people through shared hobbies, and participate in real-time meetups.

---

## 🌟 Key Features

* **Interactive Live Activity Map:**
  - Real-time pins displaying live & upcoming activities around you.
  - Pulsing radar indicators for **HAPPENING NOW** meetups.
  - Category markers (🏃 Sports, 🎮 Gaming, 🎵 Music, ☕ Social, 📚 Learning, 🎉 Events, 🤝 Help, 🎨 Hobbies, 🍔 Food, 🌳 Outdoors).
  - Activity preview card with live participant count, distance in km, schedule, and quick join.

* **Real-Time Cloud Firestore Integration:**
  - Zero-lag participant counts updating across all active devices via Firestore snapshot listeners.
  - Atomic transactions preventing join race conditions and exceeding max participant limits.
  - Dedicated real-time group chat inside each activity for participants with auto-scroll.

* **Firebase Authentication:**
  - Email & password registration and login.
  - Google Sign-In with popup.
  - Apple Sign-In with popup.
  - Anonymous / Guest Explorer browsing.
  - Password reset and account deletion.

* **Discover & Smart Search:**
  - Text search across activity titles, descriptions, and locations.
  - Filter by category, radius distance (1 km to 50 km), status (happening now, starting soon, today), and available spots.

* **Privacy & Safety:**
  - User location fuzzing & approximate neighborhood coordinates to protect exact residential addresses.
  - Report inappropriate activities or users.
  - User blocking system to filter out unwanted interactions.
  - Strict security rules in `firestore.rules` and `storage.rules`.

* **Internationalization (i18n):**
  - English & Finnish (Suomi) built-in with extensible key-value translation dictionaries.

* **Theme Support:**
  - Sleek modern Light & Dark modes with synchronized map color balance.

---

## 🚀 Connecting to a Real Firebase Project

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the on-screen steps.
3. In your project settings, click **Add app** and select the **Web** platform (`</>`).
4. Register your app (e.g. `NOWLY Web`).

### 2. Configure Authentication
1. In the Firebase console left sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable:
   - **Email/Password**
   - **Google**
   - **Apple** (optional)
   - **Anonymous** (for guest browsing)

### 3. Create Cloud Firestore
1. Navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Select your preferred Cloud region and start in **Production mode**.
4. The security rules from `firestore.rules` can be deployed via Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 4. Enable Firebase Storage
1. Navigate to **Build > Storage**.
2. Click **Get Started**.
3. Deploy storage rules:
   ```bash
   firebase deploy --only storage
   ```

### 5. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values from your Firebase Project Settings:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

### 6. Run the App
```bash
npm install
npm run dev
```

---

## 🛠 Cloud Functions

The `functions/` directory contains background logic:
* `updateActivityLifecycle`: Scheduled cron function that automatically transitions activities from `upcoming` to `happening` when the start time arrives, and from `happening` to `finished` upon completion.
* `onNewActivityMessage`: Real-time Firestore trigger dispatching in-app notifications to participants when a new chat message arrives.

To deploy functions:
```bash
cd functions
npm install
npm run deploy
```
