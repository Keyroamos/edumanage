# Fix: Geocoding API REQUEST_DENIED Error

## The Problem:
Error: "This API project is not authorized to use this API."

This means the **API key restrictions** are blocking the Geocoding API, even though it's enabled.

## Solution Steps:

### Step 1: Check API Key Restrictions

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Click on your API key:**
   - Find the key: `AIzaSyClqXmdTxqSvqH8w-C45ovwA6hw5XL2dO4`
   - Click on it to edit

3. **Check "API restrictions" section:**
   - You'll see one of two options:
     - **"Don't restrict key"** ✅ (Recommended for testing)
     - **"Restrict key"** ⚠️ (Needs to include Geocoding API)

### Step 2: Fix the Restrictions

**Option A: Remove Restrictions (Easiest for testing)**
- Select **"Don't restrict key"**
- Click **"SAVE"**
- Wait 1-2 minutes

**Option B: Add Geocoding API to Restrictions**
- Select **"Restrict key"**
- Under "API restrictions", click **"Select APIs"**
- Make sure these are checked:
  - ✅ Maps JavaScript API
  - ✅ Geocoding API
  - ✅ Places API
  - ✅ Directions API
- Click **"SAVE"**
- Wait 1-2 minutes

### Step 3: Verify APIs are Enabled

1. **Go to APIs Library:**
   - Visit: https://console.cloud.google.com/apis/library

2. **Search and verify these are ENABLED:**
   - Maps JavaScript API ✅
   - Geocoding API ✅
   - Places API ✅
   - Directions API ✅

3. **If any show "ENABLE" button, click it**

### Step 4: Check Billing

- Ensure billing is enabled (required even for free tier)
- Visit: https://console.cloud.google.com/billing

### Step 5: Test Again

After making changes:
1. Wait 1-2 minutes for changes to propagate
2. Run the test: `python test_geocoding_api.py`
3. Refresh your Django app and try the location picker

## Quick Links:

- **API Credentials:** https://console.cloud.google.com/apis/credentials
- **Geocoding API:** https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
- **Places API:** https://console.cloud.google.com/apis/library/places-backend.googleapis.com
- **Directions API:** https://console.cloud.google.com/apis/library/directions-backend.googleapis.com

## Most Common Issue:

**API Key Restrictions** - The key is restricted to only certain APIs, and Geocoding API is not included.

**Quick Fix:** Set API restrictions to "Don't restrict key" temporarily to test.

