# 🔧 Fix API Key Restrictions - Step by Step Guide

## Current Issue:
✅ Geocoding API is **ENABLED** in the library
❌ API Key **RESTRICTIONS** are blocking it

## Solution: Update API Key Restrictions

### Step-by-Step Instructions:

#### Step 1: Open API Credentials Page
1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Make sure you're in the correct Google Cloud project

#### Step 2: Find Your API Key
1. Look for the API key: `AIzaSyClqXmdTxqSvqH8w-C45ovwA6hw5XL2dO4`
2. **Click on the API key name** (not the copy icon, but the actual key name/link)

#### Step 3: Edit API Restrictions
1. Scroll down to the **"API restrictions"** section
2. You'll see one of these options selected:
   - ⚪ **"Don't restrict key"** ← This is what you want!
   - ⚪ **"Restrict key"** ← This is likely selected and causing the issue

#### Step 4: Fix the Restrictions

**OPTION A: Remove All Restrictions (Recommended for Testing)**
1. Select **"Don't restrict key"**
2. Click **"SAVE"** button at the bottom
3. Wait 1-2 minutes

**OPTION B: Add Geocoding API to Restrictions**
1. Select **"Restrict key"**
2. Click **"Select APIs"** dropdown
3. Make sure these are **CHECKED**:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API ← **THIS ONE IS MISSING!**
   - ✅ Places API
   - ✅ Directions API
4. Click **"SAVE"**
5. Wait 1-2 minutes

#### Step 5: Verify the Fix
1. Run: `python test_geocoding_api.py`
2. You should see: **✅ SUCCESS!** instead of ❌ REQUEST_DENIED

## Visual Guide:

```
Google Cloud Console → APIs & Services → Credentials
    ↓
Click on your API Key
    ↓
Scroll to "API restrictions"
    ↓
Select "Don't restrict key" OR "Restrict key" with Geocoding API checked
    ↓
Click SAVE
    ↓
Wait 1-2 minutes
    ↓
Test again
```

## Common Mistakes:

❌ **Mistake 1:** Only enabling the API in the library (you did this ✅)
❌ **Mistake 2:** Not updating API key restrictions (this is the issue!)
❌ **Mistake 3:** Forgetting to click SAVE
❌ **Mistake 4:** Not waiting for changes to propagate

## Quick Test Command:

After making changes, run:
```bash
python test_geocoding_api.py
```

Expected output after fix:
```
✅ SUCCESS! Coordinates: -1.2921, 36.8219
✅ SUCCESS! Address: Nairobi, Kenya
```

## Still Not Working?

If after 2-3 minutes it's still not working:
1. Double-check you clicked **SAVE**
2. Verify you're editing the **correct API key**
3. Check if you have multiple Google Cloud projects
4. Try creating a new API key with no restrictions
5. Check billing is enabled

## Direct Links:

- **API Credentials:** https://console.cloud.google.com/apis/credentials
- **Geocoding API:** https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

