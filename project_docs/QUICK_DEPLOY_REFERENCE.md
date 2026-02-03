# 🚀 EduManage - Quick Deployment Reference

## ⚡ Quick Start (5 Steps)

### 1️⃣ Prepare Environment File
```bash
# Copy and edit .env
cp .env.production .env
# Edit .env and set:
DEBUG=False
SECRET_KEY=your-new-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

### 2️⃣ Update cPanel Paths
Edit `passenger_wsgi.py` - Line 8:
```python
INTERP = os.path.expanduser("~/virtualenv/public_html/edumanage/3.9/bin/python3")
# Replace with YOUR actual path from cPanel Python App
```

Edit `.htaccess` - Lines 2-5:
```apache
PassengerAppRoot /home/YOUR_USERNAME/public_html/edumanage
PassengerPython /home/YOUR_USERNAME/virtualenv/public_html/edumanage/3.9/bin/python3
# Replace YOUR_USERNAME with your cPanel username
```

### 3️⃣ Upload to cPanel
**Upload to**: `public_html/edumanage/`

**Include**:
- ✅ All Python apps (schools, finance, food, transport, config)
- ✅ frontend/dist/ folder
- ✅ templates/ folder
- ✅ static/ and media/ folders
- ✅ passenger_wsgi.py, .htaccess, .env, requirements.txt
- ✅ manage.py, db.sqlite3

**Exclude**:
- ❌ node_modules/
- ❌ frontend/src/
- ❌ __pycache__/
- ❌ .git/

### 4️⃣ Setup on Server (via cPanel Terminal)
```bash
# Navigate to project
cd ~/public_html/edumanage

# Activate virtual environment
source ~/virtualenv/public_html/edumanage/3.9/bin/activate

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Set permissions
chmod -R 755 static staticfiles media
chmod 664 db.sqlite3
```

### 5️⃣ Restart Application
```bash
# Method 1: Touch the WSGI file
touch ~/public_html/edumanage/passenger_wsgi.py

# Method 2: Use cPanel Python App Manager
# Go to "Setup Python App" → Click "Restart"
```

---

## 🔑 Critical Configuration

### Generate New SECRET_KEY
```python
# In Python shell:
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Database Options

**Option A: SQLite (Simple)**
- Upload `db.sqlite3`
- Set permissions: `chmod 664 db.sqlite3`

**Option B: MySQL (Recommended)**
```python
# In settings.py:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'username_edumanage',
        'USER': 'username_dbuser',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```
Then run:
```bash
pip install mysqlclient
python manage.py migrate
python manage.py createsuperuser
```

---

## 📁 Required File Structure

```
public_html/edumanage/
├── .htaccess                 ← Apache config
├── .env                      ← Environment variables
├── passenger_wsgi.py         ← WSGI entry point
├── manage.py
├── requirements.txt
├── db.sqlite3
├── school/                   ← Django project
├── schools/                  ← Apps
├── finance/
├── food/
├── transport/
├── config/
├── frontend/
│   └── dist/                 ← React build
│       ├── index.html
│       └── assets/
├── templates/
│   └── index.html            ← Copy of dist/index.html
├── static/
├── staticfiles/              ← Created by collectstatic
└── media/
```

---

## 🔧 Common Issues & Fixes

### Issue: "Internal Server Error"
```bash
# Check error logs
tail -f ~/logs/edumanage_error.log

# Verify paths in passenger_wsgi.py
# Restart application
touch ~/public_html/edumanage/passenger_wsgi.py
```

### Issue: "Static files not loading"
```bash
# Recollect static files
python manage.py collectstatic --noinput --clear

# Check permissions
chmod -R 755 static staticfiles
```

### Issue: "CSRF verification failed"
```python
# In .env, add:
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Issue: "Module not found"
```bash
# Activate venv and reinstall
source ~/virtualenv/public_html/edumanage/3.9/bin/activate
pip install -r requirements.txt --force-reinstall
```

---

## ✅ Pre-Launch Checklist

- [ ] DEBUG=False in .env
- [ ] New SECRET_KEY generated
- [ ] ALLOWED_HOSTS configured
- [ ] CSRF_TRUSTED_ORIGINS set
- [ ] SSL certificate installed
- [ ] Database configured and migrated
- [ ] Static files collected
- [ ] File permissions set (755/644)
- [ ] All API endpoints tested
- [ ] Login/logout working
- [ ] Media uploads working
- [ ] M-Pesa in production mode (if applicable)

---

## 📞 Quick Commands Reference

```bash
# Activate virtual environment
source ~/virtualenv/public_html/edumanage/3.9/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Check deployment settings
python manage.py check --deploy

# Restart application
touch ~/public_html/edumanage/passenger_wsgi.py

# View error logs
tail -f ~/logs/edumanage_error.log

# Set permissions
chmod -R 755 ~/public_html/edumanage
chmod 644 ~/public_html/edumanage/.env
chmod 664 ~/public_html/edumanage/db.sqlite3
```

---

## 🌐 Access Your Application

After deployment:
- **Frontend**: https://yourdomain.com/edumanage
- **Admin Panel**: https://yourdomain.com/edumanage/admin
- **API**: https://yourdomain.com/edumanage/api/

---

## 📚 Full Documentation

For detailed instructions, see:
- **CPANEL_DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **UPLOAD_CHECKLIST.md** - What to upload
- **DEPLOYMENT_INFO.txt** - Deployment summary

---

## 🎯 Success Indicators

Your deployment is successful when:
1. ✅ Homepage loads without errors
2. ✅ Login page appears correctly
3. ✅ Can log in with credentials
4. ✅ Dashboard loads with data
5. ✅ Static files (CSS/JS) load properly
6. ✅ Images and media files display
7. ✅ API endpoints respond correctly

---

**Need Help?** Check the error logs and refer to the troubleshooting section in CPANEL_DEPLOYMENT_GUIDE.md
