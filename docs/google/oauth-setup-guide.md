# OAuth Setup Guide for Google Apps Script Projects

Complete guide for configuring OAuth scopes and permissions for TypeScript + clasp-based Apps Script projects.

## Table of Contents

1. [Understanding OAuth Scopes](#understanding-oauth-scopes)
2. [Initial Setup](#initial-setup)
3. [Configuring appsscript.json](#configuring-appsscriptjson)
4. [First-Time Authorization](#first-time-authorization)
5. [Troubleshooting](#troubleshooting)
6. [Advanced: GCP Project Setup](#advanced-gcp-project-setup)

---

## Understanding OAuth Scopes

Apps Script uses **OAuth 2.0 scopes** to request permission to access Google services. When your script runs, Google checks if you've authorized it for the specific APIs it needs.

### Common Scopes for Fitness Projects

| Scope                                                     | Access                       | When You Need It               |
| --------------------------------------------------------- | ---------------------------- | ------------------------------ |
| `https://www.googleapis.com/auth/spreadsheets`            | Read/write spreadsheets      | Any sheet operations           |
| `https://www.googleapis.com/auth/drive`                   | Full Drive access            | Reading/writing any Drive file |
| `https://www.googleapis.com/auth/drive.file`              | Only files created by script | Limited Drive access (safer)   |
| `https://www.googleapis.com/auth/script.external_request` | Fetch external URLs          | API calls outside Google       |

**Gotcha:** Apps Script auto-detects scopes from your code, but explicit declaration in `appsscript.json` prevents unexpected permission prompts.

---

## Initial Setup

### Step 1: Install clasp (if not already)

```bash
npm install -g @google/clasp
```

### Step 2: Login to Google Account

```bash
clasp login
```

This opens a browser to authorize clasp itself (one-time setup). You'll see:

- "Google Cloud SDK wants to access your Google Account"
- Click **Allow**

**What just happened?** clasp stores OAuth tokens in `~/.clasprc.json` so it can deploy code on your behalf.

### Step 3: Clone or Create Apps Script Project

**For existing project:**

```bash
cd /path/to/your/project
clasp clone <scriptId>
```

**For new project:**

```bash
clasp create --type standalone --title "My Fitness Script"
```

This creates `.clasp.json` with your script ID:

```json
{
  "scriptId": "1a2b3c4d5e6f7g8h9i0j",
  "rootDir": "./build"
}
```

---

## Configuring appsscript.json

### Step 4: Add Explicit OAuth Scopes

**For fitness ingestion project**, create or edit `projects/fitness-ingestion/src/appsscript.json`:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v3",
        "serviceId": "drive"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

**Key Points:**

- `drive.readonly` is safer than full `drive` if you only read CSVs
- `script.scriptapp` enables triggers (time-based, on-edit, etc.)
- Copy this file to `build/` when deploying (your vite.config should handle this)

### Step 5: Verify Build Output

Check that `appsscript.json` appears in your build directory:

```bash
npm run build  # or whatever your build command is
ls build/appsscript.json
```

**Gotcha:** If `appsscript.json` is missing from `build/`, clasp uses auto-detected scopes, which may differ from your intent.

---

## First-Time Authorization

### Step 6: Deploy and Run

```bash
clasp push
clasp open
```

This opens the Apps Script editor in your browser.

### Step 7: Trigger Authorization Flow

1. In the Apps Script editor, click **Run** (play button icon) on any function (e.g., `strong_sync_trigger`)
2. A popup appears: **"Authorization required"**
3. Click **Review permissions**
4. **Select your Google account**
5. You'll see a warning: **"Google hasn't verified this app"**
   - Click **Advanced** → **Go to [Your Project Name] (unsafe)**

   > **Why "unsafe"?** Because it's your personal script, not a published app. This is normal for development.

6. Review the permissions:

   ```
   This will allow [Your Project Name] to:
   - See, edit, create, and delete your spreadsheets
   - See and download files from your Google Drive
   ```

7. Click **Allow**

**What just happened?** Google created an OAuth token for your account → script combo. This token is stored server-side and tied to your script ID.

### Step 8: Verify Execution

After authorization, the function runs. Check **Execution log** (Ctrl+Enter) for output:

```
12:34:56 PM Notice Execution started
12:34:57 PM Info === Starting Strong Workouts Sync ===
12:34:58 PM Notice Execution completed
```

---

## Troubleshooting

### Error: "We're sorry, a server error occurred"

**Cause:** Scope mismatch between `appsscript.json` and deployed code.

**Fix:**

```bash
# Clear deployed files
clasp push --force

# Re-authorize
clasp open
# Run function again → Review permissions → Allow
```

### Error: "Access not granted or expired"

**Cause:** OAuth token expired (rare) or you revoked permissions.

**Fix:**

1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find your script name → Remove access
3. Re-run function in Apps Script editor → Authorize again

### Error: "Drive API has not been used in project"

**Cause:** Advanced Drive service not enabled.

**Fix:**

1. In Apps Script editor: **Services** (+ icon) → Add **Drive API v3**
2. Or add to `appsscript.json`:

   ```json
   "dependencies": {
     "enabledAdvancedServices": [
       {
         "userSymbol": "Drive",
         "version": "v3",
         "serviceId": "drive"
       }
     ]
   }
   ```

3. Deploy: `clasp push`

### Unexpected Permission Prompt After Code Change

**Cause:** You added a new API call (e.g., `UrlFetchApp.fetch()`) that requires a scope not in `appsscript.json`.

**Fix:**

1. Add missing scope:

   ```json
   "oauthScopes": [
     "https://www.googleapis.com/auth/script.external_request"
   ]
   ```

2. Deploy: `clasp push`
3. Re-authorize when prompted

---

## Advanced: GCP Project Setup

For **production apps** or **add-ons**, create a dedicated Google Cloud Platform (GCP) project. This is **optional** for personal scripts.

### Step 9: Create GCP Project (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **New Project** → Name it (e.g., "Lifting Fitness Scripts")
3. Copy **Project Number** (e.g., `123456789012`)

### Step 10: Link Apps Script to GCP Project

In `appsscript.json`:

```json
{
  "oauthScopes": [...],
  "dependencies": {...},
  "executionApi": {
    "access": "ANYONE"
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

In Apps Script editor:

1. **Project Settings** (gear icon)
2. Scroll to **Google Cloud Platform (GCP) Project**
3. Click **Change project**
4. Enter your GCP project number
5. Click **Set project**

**Benefits:**

- Quota tracking in GCP Console
- OAuth consent screen branding
- API usage analytics

---

## Quick Reference

### Minimal appsscript.json for Fitness Project

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "enabledAdvancedServices": [
      {"userSymbol": "Drive", "version": "v3", "serviceId": "drive"}
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly"
  ],
  "runtimeVersion": "V8"
}
```

### Re-Authorization Checklist

When you change scopes or services:

- [ ] Update `appsscript.json`
- [ ] Run `npm run build` (to copy to `build/`)
- [ ] Run `clasp push`
- [ ] In Apps Script editor, run any function
- [ ] Click **Review permissions** → **Allow**

### Scope Selection Guide

**Need to...**

- ✅ Read CSV from Drive → `drive.readonly`
- ✅ Write to existing sheet → `spreadsheets`
- ✅ Create new sheets → `spreadsheets` + `drive.file`
- ✅ Call external APIs → `script.external_request`
- ✅ Run on schedule → `script.scriptapp`

---

## Security Best Practices

1. **Principle of Least Privilege:** Use `.readonly` scopes when possible
2. **Never commit tokens:** Add `~/.clasprc.json` to `.gitignore` (clasp does this)
3. **Audit permissions regularly:** [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
4. **For shared scripts:** Document required scopes in `README.md`

---

## Next Steps

- [Setup Triggers for Automated Sync](./triggers-setup-guide.md)
- [Advanced Drive API Usage](./drive-api-guide.md)
- [Deploying as Web App](./web-app-deployment.md)
