# AYSG Attendance Tracker

## Data persistence

User-entered attendance system data is stored in Firebase Firestore, not in the deployed app files. This means rebuilding, redeploying, or updating the React code should not delete members, events, or attendance records.

Persistent data lives in the Firestore collection `appState` under these stable document IDs:

- `aysg_members`
- `aysg_new_joinees`
- `aysg_events`
- `aysg_attendance`
- `aysg_new_joinee_attendance`

Important rule for future updates: do not rename these document IDs or replace Firebase data with new local defaults. New app versions should read existing Firestore data first, then only apply additive migrations when needed.

Local browser storage is only used as a cache/fallback. Firestore is the source of truth for shared data across devices and app versions.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
