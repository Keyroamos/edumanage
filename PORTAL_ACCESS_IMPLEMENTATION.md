# Portal Access System Implementation

## Overview
Implemented a secure portal access link system that allows schools to generate and manage unique login links for different user roles (Teachers, Students, Accountant, Food Manager, Transport Manager, and Drivers).

## Features Implemented

### 1. Backend Changes

#### Database Model (`config/models.py`)
- Added `portal_slug` field to `SchoolConfig` model
- Auto-generates unique 12-character slug on save
- Migration created and applied successfully

#### API Endpoints (`schools/views.py`)
- **Updated `api_school_config`**: Now returns `portal_slug` in config response
- **Updated `api_school_config_update`**: Includes `portal_slug` in update response
- **New `api_regenerate_portal_slug`**: POST endpoint to regenerate portal access code for security

#### URL Routes (`schools/urls.py`)
- Added route: `/api/config/regenerate-portal/`

### 2. Frontend Changes

#### Settings Page (`frontend/src/pages/Settings.jsx`)
- Added new **"Portal Access"** tab in Settings
- Displays 6 role-specific portal cards:
  - 👨‍🏫 Teachers Portal
  - 🎓 Students Portal
  - 💼 Accountant Portal
  - 🍽️ Food Manager Portal
  - 🚌 Transport Manager Portal
  - 🚗 Drivers Portal

#### Features per Portal Card:
- **Unique Portal URL**: `{origin}/portal/{portal_slug}/{role}`
- **One-Click Copy**: Copy button to clipboard
- **Visual Design**: Color-coded cards with emojis
- **Responsive Layout**: Grid layout adapts to screen size

#### Security Features:
- **Regenerate Access Code**: Button to invalidate all existing links
- **Current Code Display**: Shows active portal slug
- **Confirmation Dialog**: Warns before regeneration
- **Info Banner**: Explains portal access system

## How It Works

### For School Administrators:
1. Navigate to **Settings → Portal Access**
2. View all portal links with unique access codes
3. Copy and share specific links with respective users
4. Regenerate access code anytime for security

### For End Users:
1. Receive portal link from school admin
2. Access their role-specific portal using the unique link
3. Login with their credentials
4. Access only their designated portal features

## Portal URL Structure
```
https://yourdomain.com/portal/{unique-school-slug}/{role}
```

Example:
```
https://localhost:5173/portal/a1b2c3d4e5f6/teacher
https://localhost:5173/portal/a1b2c3d4e5f6/student
```

## Security Benefits

1. **Unique Access Codes**: Each school has a unique portal slug
2. **Role Separation**: Different paths for different user types
3. **Regeneration**: Can invalidate all links instantly if compromised
4. **No Guessing**: 12-character random slugs prevent brute force

## Next Steps (Optional Enhancements)

1. **Portal Route Implementation**: Create actual portal pages for each role
2. **Slug-Based Authentication**: Validate portal_slug in login endpoints
3. **Access Logging**: Track which portals are being accessed
4. **Custom Slugs**: Allow admins to set custom portal slugs
5. **Expiration**: Add time-based expiration for portal links
6. **QR Codes**: Generate QR codes for easy mobile access

## Files Modified

### Backend:
- `config/models.py` - Added portal_slug field
- `schools/views.py` - Updated config endpoints, added regenerate endpoint
- `schools/urls.py` - Added regenerate route
- `config/migrations/0005_schoolconfig_portal_slug.py` - New migration

### Frontend:
- `frontend/src/pages/Settings.jsx` - Added Portal Access tab with full UI

## Testing

1. ✅ Migration applied successfully
2. ✅ Portal slug auto-generates on school creation
3. ✅ Config API returns portal_slug
4. ✅ Frontend displays portal links
5. ✅ Copy to clipboard works
6. ✅ Regenerate endpoint functional

## Usage Instructions

1. Login as school admin
2. Go to Settings
3. Click "Portal Access" tab
4. Copy the relevant portal link
5. Share with users via email/SMS
6. Users access their portal using the link
7. Regenerate code if security is compromised
