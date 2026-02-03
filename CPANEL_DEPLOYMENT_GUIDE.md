# 🚀 EduManage cPanel Deployment Guide

## ✅ STEP 1: Rebuild React with Correct Configuration

The vite.config.js has been updated to use base: '/' for cPanel deployment.

**On your local machine, run:**

```bash
cd frontend
npm run build
```

This will create a `frontend/dist/` folder with all your React files.

---

## ✅ STEP 2: Upload Files to cPanel

### A. Upload Django Backend

Upload these files to `/home/username/edumanage/` (or your preferred backend folder):

```
/home/username/edumanage/
├── manage.py
├── passenger_wsgi.py
├── school/
├── schools/
├── students/
├── teachers/
├── finance/
├── transport/
├── food/
├── requirements.txt
└── ... (all Python files)
```

### B. Upload React Build to public_html

**IMPORTANT:** Copy the **CONTENTS** of `frontend/dist/` (not the dist folder itself) directly into `public_html/`

```
/home/username/public_html/
├── index.html          ✅ REQUIRED
├── assets/             ✅ REQUIRED (contains JS/CSS)
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
├── favicon.png
└── ... (other static files)
```

**❌ WRONG:**
```
public_html/dist/index.html  ❌ This causes 404!
```

**✅ CORRECT:**
```
public_html/index.html  ✅ This works!
```

---

## ✅ STEP 3: Configure Passenger for Django

Create/update `.htaccess` in `public_html/`:

```apache
# Passenger Configuration
PassengerAppRoot /home/username/edumanage
PassengerBaseURI /
PassengerPython /home/username/virtualenv/edumanage/3.11/bin/python

# Serve React for all routes except API
RewriteEngine On
RewriteBase /

# Don't rewrite files or directories that exist
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Don't rewrite API calls - let Django handle them
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/admin/
RewriteCond %{REQUEST_URI} !^/media/

# Serve index.html for all other routes (React Router)
RewriteRule ^ /index.html [L]
```

---

## ✅ STEP 4: Update Django Settings for Production

In `school/settings.py`, ensure:

```python
# Production settings
DEBUG = False
ALLOWED_HOSTS = ['system.keyroacademy.top', 'www.system.keyroacademy.top']

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# React build files served from public_html
STATICFILES_DIRS = []  # Remove frontend/dist from here

# CORS for API calls
CORS_ALLOWED_ORIGINS = [
    'https://system.keyroacademy.top',
]
```

---

## ✅ STEP 5: Install Dependencies & Collect Static

SSH into your cPanel and run:

```bash
cd ~/edumanage
source ~/virtualenv/edumanage/3.11/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

---

## ✅ STEP 6: Restart Application

In cPanel:
1. Go to **Setup Python App**
2. Click **Restart** next to your application

OR via SSH:
```bash
touch ~/edumanage/passenger_wsgi.py
```

---

## 🔍 VERIFICATION CHECKLIST

After deployment, verify:

✅ `https://system.keyroacademy.top/` loads React app (no 404)
✅ `https://system.keyroacademy.top/api/config/` returns JSON
✅ `https://system.keyroacademy.top/admin/` loads Django admin
✅ React routing works (refresh on `/pricing` doesn't 404)

---

## 🐛 TROUBLESHOOTING

### Issue: Still getting 404 on root

**Solution:**
1. Verify `public_html/index.html` exists
2. Check file permissions (644 for files, 755 for folders)
3. Clear browser cache (Ctrl+Shift+R)

### Issue: API calls fail with CORS errors

**Solution:**
Add to `school/settings.py`:
```python
CORS_ALLOW_ALL_ORIGINS = True  # For testing only
```

### Issue: Static files (CSS/JS) not loading

**Solution:**
1. Run `python manage.py collectstatic --noinput`
2. Check `STATIC_ROOT` path in settings
3. Verify `.htaccess` doesn't block `/static/`

---

## 📁 FINAL DIRECTORY STRUCTURE

```
/home/username/
├── edumanage/              # Django backend
│   ├── manage.py
│   ├── passenger_wsgi.py
│   └── school/
├── virtualenv/
│   └── edumanage/
│       └── 3.11/
└── public_html/            # React frontend
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── favicon.png
```

---

## 🎯 QUICK DEPLOYMENT COMMANDS

```bash
# 1. Build React locally
cd frontend && npm run build

# 2. Upload dist/* to public_html/

# 3. SSH into cPanel
cd ~/edumanage
source ~/virtualenv/edumanage/3.11/bin/activate
python manage.py collectstatic --noinput
python manage.py migrate
touch passenger_wsgi.py

# 4. Done! Visit https://system.keyroacademy.top
```

---

## 🔥 IMPORTANT NOTES

1. **React serves from root** (`/`) - all HTML/CSS/JS in `public_html/`
2. **Django handles API** (`/api/*`) - via Passenger
3. **`.htaccess` routes everything** - React for UI, Django for API
4. **Always rebuild React** after frontend changes
5. **Restart Passenger** after backend changes

---

Need help with any step? Let me know! 🚀
