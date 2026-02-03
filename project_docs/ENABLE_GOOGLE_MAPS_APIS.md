# How to Enable Required Google Maps APIs

Your Google Maps API key is working, but you need to enable the **Geocoding API** to use location features.

## Steps to Enable Geocoding API:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/library

2. **Enable Required APIs:**
   Search for and enable these APIs:
   
   ✅ **Maps JavaScript API** (Already enabled - working)
   ✅ **Geocoding API** (NEEDS TO BE ENABLED)
   ✅ **Places API** (Recommended for autocomplete)
   ✅ **Directions API** (For route directions)

3. **Enable Geocoding API:**
   - Search for "Geocoding API"
   - Click on it
   - Click the "ENABLE" button

4. **Verify API Key Permissions:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your API key
   - Under "API restrictions", make sure:
     - Either "Don't restrict key" is selected, OR
     - "Restrict key" is selected and includes:
       - Maps JavaScript API
       - Geocoding API
       - Places API
       - Directions API

5. **Check Billing:**
   - Ensure billing is enabled (required even for free tier)
   - Go to: https://console.cloud.google.com/billing

6. **Wait a few minutes:**
   - API changes can take 1-5 minutes to propagate

7. **Test again:**
   - Refresh your page
   - Try the location picker again

## Quick Links:

- **Enable Geocoding API:** https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
- **Enable Places API:** https://console.cloud.google.com/apis/library/places-backend.googleapis.com
- **Enable Directions API:** https://console.cloud.google.com/apis/library/directions-backend.googleapis.com
- **API Credentials:** https://console.cloud.google.com/apis/credentials

## Current Status:

✅ Maps JavaScript API - Working
✅ Map Display - Working
❌ Geocoding API - **NEEDS TO BE ENABLED**
❌ Reverse Geocoding - Will work after enabling Geocoding API

After enabling the Geocoding API, the location picker will work fully!

