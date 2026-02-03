# 🔧 FIXING STATIC FILES MIME TYPE ERROR

## ❌ The Problem

Your browser is getting this error:
```
Refused to apply style from 'https://edumanage.bdmis.co.ke/assets/index-C2czPPsv.css' 
because its MIME type ('text/html') is not a supported stylesheet MIME type
```

**What this means:**
- The browser is requesting CSS/JS files from `/assets/`
- But Django is returning HTML instead of the actual CSS/JS files
- This happens because Django is intercepting the static file requests

---

## ✅ SOLUTION - Multiple Steps

### **Step 1: Upload Updated .htaccess** ⚡ CRITICAL

I've updated the `.htaccess` file with:
1. Correct MIME types for CSS, JS, fonts, etc.
2. Disabled Passenger for static files
3. Rules to serve `/assets/`, `/static/`, `/media/` directly

**Upload this file to your server NOW.**

---

### **Step 2: Create Symbolic Link for Assets Folder**

The frontend build creates files in `/assets/` but Django expects them in `/static/`. We need to make the assets accessible.

**Option A: Via cPanel Terminal** (RECOMMENDED)
```bash
cd ~/public_html/edu
ln -s frontend/dist/assets assets
```

**Option B: Via cPanel File Manager**
1. Go to `public_html/edu/`
2. Create a folder called `assets`
3. Copy all files from `frontend/dist/assets/` to `assets/`

---

### **Step 3: Run collectstatic**

This collects all static files into one location:

```bash
cd ~/public_html/edu
python3.9 manage.py collectstatic --noinput
```

This will copy files to the `staticfiles/` directory.

---

### **Step 4: Update Django URLs (if needed)**

Check if your `school/urls.py` is serving static files correctly. It should have:

```python
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    # ... your other URLs ...
    
    # Serve static files
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'frontend/dist/assets')}),
]
```

---

### **Step 5: Verify File Permissions**

Make sure the web server can read the files:

```bash
chmod -R 755 ~/public_html/edu/frontend/dist
chmod -R 755 ~/public_html/edu/static
chmod -R 755 ~/public_html/edu/staticfiles
```

---

## 🚀 QUICK FIX (Do This Now)

**In cPanel Terminal, run these commands:**

```bash
# Navigate to your project
cd ~/public_html/edu

# Create symbolic link for assets
ln -sf frontend/dist/assets assets

# Set permissions
chmod -R 755 frontend/dist
chmod -R 755 assets

# Restart the application
touch passenger_wsgi.py
```

**Then upload the updated `.htaccess` file.**

---

## 🔍 Verify the Fix

After making these changes:

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** the page (Ctrl+Shift+R)
3. **Check the browser console** - errors should be gone
4. **Verify files load:**
   - Visit: `https://edumanage.bdmis.co.ke/assets/index-C2czPPsv.css`
   - Should show CSS code, not HTML

---

## 📁 Expected File Structure

Your server should have:

```
public_html/edu/
├── .htaccess                    ← Updated with MIME types
├── passenger_wsgi.py
├── manage.py
├── frontend/
│   └── dist/
│       ├── index.html
│       └── assets/              ← Original assets
│           ├── index-C2czPPsv.css
│           ├── index-AJ2aEkzT.js
│           └── ...
├── assets/                      ← Symbolic link to frontend/dist/assets
├── static/
├── staticfiles/                 ← Created by collectstatic
└── ...
```

---

## 🔧 Alternative Solution: Copy Assets to Static

If symbolic links don't work, copy the assets:

```bash
cd ~/public_html/edu
mkdir -p static/assets
cp -r frontend/dist/assets/* static/assets/
python3.9 manage.py collectstatic --noinput
```

---

## ⚠️ Common Issues

### Issue: "Permission Denied"
```bash
chmod -R 755 ~/public_html/edu
```

### Issue: "collectstatic fails"
Check `settings.py` has:
```python
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'frontend/dist'),
]
```

### Issue: Still getting HTML instead of CSS
1. Clear browser cache completely
2. Check .htaccess is uploaded correctly
3. Restart Apache: `touch passenger_wsgi.py`
4. Check file exists: `ls -la ~/public_html/edu/frontend/dist/assets/`

---

## 📊 Testing Commands

Run these to verify everything is in place:

```bash
# Check if assets folder exists
ls -la ~/public_html/edu/frontend/dist/assets/

# Check if symbolic link works
ls -la ~/public_html/edu/assets

# Check file permissions
ls -la ~/public_html/edu/frontend/dist/assets/index-C2czPPsv.css

# Test MIME type (should show "text/css")
file ~/public_html/edu/frontend/dist/assets/index-C2czPPsv.css
```

---

## ✅ Success Indicators

You'll know it's fixed when:
1. ✅ No MIME type errors in browser console
2. ✅ CSS loads and page is styled correctly
3. ✅ JavaScript loads and app is interactive
4. ✅ Visiting `/assets/index-C2czPPsv.css` shows CSS code

---

## 🆘 If Still Not Working

Try this nuclear option:

```bash
cd ~/public_html/edu

# Copy everything to root static
cp -r frontend/dist/* .

# Set permissions
chmod -R 755 assets

# Restart
touch passenger_wsgi.py
```

This puts the assets at the root level where they can be served directly.

---

## 📞 Next Steps

1. ✅ Upload updated `.htaccess`
2. ✅ Create symbolic link: `ln -s frontend/dist/assets assets`
3. ✅ Set permissions: `chmod -R 755 frontend/dist`
4. ✅ Restart: `touch passenger_wsgi.py`
5. ✅ Clear browser cache and test

The MIME type errors should disappear! 🎉
