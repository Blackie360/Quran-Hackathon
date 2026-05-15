# Environment Setup Guide

## Credentials Management

API credentials are now stored securely in environment files instead of being hardcoded.

### Frontend Setup

Do not put Quran API secrets in the Angular frontend. Browser code is public to users.

The frontend should call the local proxy paths:

```text
/content-api
/auth-api
```

Angular forwards those paths to the backend through `proxy.conf.json`.

### Backend Setup

1. **Create `.env.local`** in the `backend/` directory:
   ```bash
   QURAN_CLIENT_ID=your-client-id
   QURAN_CLIENT_SECRET=your-client-secret
   ```

2. The backend can access these variables via `process.env.QURAN_CLIENT_ID` and `process.env.QURAN_CLIENT_SECRET`.

3. **Important:** `.env.local` is in `.gitignore` and will never be committed.

## Sharing Credentials Safely

- Use `.env.example` files as templates for new developers
- Share actual credentials through secure channels (password manager, 1Password, etc.)
- Never commit `.env.local` files to git
- Rotate credentials periodically for security

## Production Deployment

For production, set environment variables directly in your deployment platform:
- **Vercel:** Add to Project Settings > Environment Variables
- **Docker:** Pass as build/runtime arguments
- **Any Node server:** Set via system environment before starting
