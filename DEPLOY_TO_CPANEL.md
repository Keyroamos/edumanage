# 🚀 Quick cPanel Deployment Guide (Git Repository Method)

## ✅ Your Setup
- Domain: `system.keyroacademy.top`
- Root Directory: `/home/keyroacd/system.keyroacademy.top/`
- Public HTML: `/home/keyroacd/system.keyroacademy.top/public_html/`
- GitHub: `https://github.com/Keyroamos/edumanage.git`

---

## 📋 DEPLOYMENT STEPS

### 1️⃣ Build React Locally (Run this on your computer)

```bash
cd frontend
npm run build
```

This will create the production build in `frontend/dist`.

---

### 2️⃣ Commit and Push to GitHub

```bash
# Go back to root
cd ..
git add .
git commit -m "Update React build and static files"
git push origin main
```

---

### 3️⃣ Pull and Update on cPanel Server (SSH or Terminal)

```bash
cd /home/keyroacd/system.keyroacademy.top
git pull origin main

# Update static files (CRITICAL for fixing 500 errors)
python manage.py collectstatic --noinput
```

---

### 4️⃣ Set Up Python Environment (First time only)

```bash
cd /home/keyroacd/system.keyroacademy.top

# Create virtual environment
python3.11 -m venv /home/keyroacd/virtualenv/system.keyroacademy.top/3.11

# Activate it
source /home/keyroacd/virtualenv/system.keyroacademy.top/3.11/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

---

### 5️⃣ Configure Passenger in cPanel

1. Go to **Setup Python App** in cPanel
2. Click **Create Application**
3. Set:
   - **Python version**: 3.11
   - **Application root**: `/home/keyroacd/system.keyroacademy.top`
   - **Application URL**: `/` (leave empty or just `/`)
   - **Application startup file**: `passenger_wsgi.py`
   - **Application Entry point**: `application`

4. Click **Create**

---

### 6️⃣ Verify Files

Make sure `collectstatic` ran successfully. You should see a `static` folder in the root:

```
/home/keyroacd/system.keyroacademy.top/
├── static/             ✅ MUST EXIST and contain assets
│   ├── assets/
│   │   ├── ui-xxxxx.js
│   │   └── ...
│   └── admin/
├── frontend/
│   └── dist/           ✅ Contains built React files
└── public_html/        ✅ Document root (contains .htaccess)
```

---

### 7️⃣ Restart Application

```bash
touch /home/keyroacd/system.keyroacademy.top/passenger_wsgi.py
```

OR in cPanel: **Setup Python App** → Click **Restart**

---

## 🔄 WORKFLOW FOR UPDATES

Every time you make changes:

### On Your Computer:
```bash
# 1. Make changes to code
# 2. Build React
cd frontend
npm run build
cd ..

# 3. Commit and push
git add .
git commit -m "Your update message"
git push origin main
```

### On cPanel (SSH):
```bash
# 1. Pull changes
cd /home/keyroacd/system.keyroacademy.top
git pull origin main

# 2. Cleanup and collect (Wait for git pull to finish first!)
rm -rf static
python manage.py collectstatic --noinput

# 3. Restart app
touch passenger_wsgi.py
```

---

## 🐛 TROUBLESHOOTING

### Issue: Still getting 404 or 500 on assets

**Check:**
1. Did you run `python manage.py collectstatic`?
2. Verify `static/assets` folder exists on server.
3. Check permissions: `chmod -R 755 static`

### Issue: Blank page or errors

**Check browser console:**
- If you see CORS errors → Update `ALLOWED_HOSTS` in `school/settings.py`
- If you see 404 on assets → Re-run `collectstatic`

### Issue: API calls fail

**Update `school/settings.py`:**
```python
ALLOWED_HOSTS = ['system.keyroacademy.top', 'www.system.keyroacademy.top']

CORS_ALLOWED_ORIGINS = [
    'https://system.keyroacademy.top',
]
```

---

## ✅ VERIFICATION

After deployment, test:

1. ✅ `https://system.keyroacademy.top/` → Should load React app
2. ✅ `https://system.keyroacademy.top/pricing` → Should work (React Router)
3. ✅ `https://system.keyroacademy.top/api/config/` → Should return JSON
4. ✅ `https://system.keyroacademy.top/admin/` → Should load Django admin

---

## 📁 DIRECTORY STRUCTURE

```
/home/keyroacd/system.keyroacademy.top/
├── static/                   # Collected static files (served by WhiteNoise)
├── frontend/                 
│   ├── dist/                 # React build output
│   └── src/
├── public_html/              # Web root
│   └── .htaccess
├── school/                   # Django settings
├── students/                 # Django apps
├── manage.py
├── passenger_wsgi.py
└── requirements.txt
```

---

## 🎯 KEY POINTS

1. ✅ React builds to `public_html/` automatically
2. ✅ `public_html/.htaccess` routes everything correctly
3. ✅ Django runs via Passenger
4. ✅ Git repository is the source of truth
5. ✅ Always `git pull` on server after pushing changes

---

Need help? Check the logs:
```bash
tail -f /home/keyroacd/logs/system.keyroacademy.top.error.log
```
