# Update Your New API Key Restrictions

## Current Status:
✅ New API key: `AIzaSyDXwxd0wlWa5pJEBN_glRwD5O2asF9WrHA`
❌ Still getting REQUEST_DENIED - API key restrictions need to be updated

## Fix Steps for NEW API Key:

### Step 1: Open API Credentials
1. Go to: **https://console.cloud.google.com/apis/credentials**

### Step 2: Find Your NEW API Key
1. Look for: `AIzaSyDXwxd0wlWa5pJEBN_glRwD5O2asF9WrHA`
2. **Click on the API key name** (click the actual key, not copy icon)

### Step 3: Update API Restrictions
1. Scroll down to **"API restrictions"** section
2. You'll see one of these:
   - ⚪ **"Don't restrict key"** ← SELECT THIS!
   - ⚪ **"Restrict key"** ← If this is selected, it's blocking Geocoding API

### Step 4: Fix It
**EASIEST OPTION:**
- Select **"Don't restrict key"**
- Click **"SAVE"**
- Wait 1-2 minutes

**OR if you want to keep restrictions:**
- Select **"Restrict key"**
- Click **"Select APIs"**
- Make sure these are CHECKED:
  - ✅ Maps JavaScript API
  - ✅ Geocoding API ← **MUST BE CHECKED!**
  - ✅ Places API
  - ✅ Directions API
- Click **"SAVE"**
- Wait 1-2 minutes

### Step 5: Test
After saving, wait 1-2 minutes, then run:
```bash
python test_geocoding_api.py
```

You should see:
```
✅ SUCCESS! Coordinates: -1.2921, 36.8219
✅ SUCCESS! Address: Nairobi, Kenya
```

## Important Notes:

- **Both API keys need the same fix** - restrictions must allow Geocoding API
- The new key is already in `settings.py` ✅
- Just need to update the restrictions in Google Cloud Console
- Changes take 1-2 minutes to propagate

## Quick Link:
**API Credentials:** https://console.cloud.google.com/apis/credentials

