# EduManage - cPanel Deployment Guide

## Complete Deployment Instructions for public_html/edumanage

This guide provides step-by-step instructions to deploy your EduManage platform to cPanel.

---

## 📋 Pre-Deployment Checklist

### 1. **Files Prepared**
- ✅ Frontend built successfully (`frontend/dist/` folder)
- ✅ `passenger_wsgi.py` created
- ✅ `.htaccess` created
- ✅ `.env.production` template created
- ✅ `requirements.txt` ready

### 2. **What You Need**
- cPanel login credentials
- Domain name configured
- SSH access (optional but recommended)
- Database credentials (if using MySQL)

---

## 🚀 Deployment Steps

### Step 1: Prepare Your cPanel Environment

1. **Log into cPanel**
   - Go to your hosting provider's cPanel
   - Navigate to your account

2. **Create Python Application**
   - Go to **"Setup Python App"** in cPanel
   - Click **"Create Application"**
   - Configure:
     - **Python Version**: 3.9 or higher
     - **Application Root**: `public_html/edumanage`
     - **Application URL**: `/edumanage` (or root `/` if deploying to main domain)
     - **Application Startup File**: `passenger_wsgi.py`
   - Click **"Create"**

3. **Note the Virtual Environment Path**
   - After creation, cPanel will show the virtual environment path
   - Example: `/home/username/virtualenv/public_html/edumanage/3.9`
   - You'll need this path later

---

### Step 2: Upload Files to cPanel

#### Option A: Using File Manager (Easier)

1. **Compress Your Project**
   - On your local machine, compress the entire `edumanage` folder to `edumanage.zip`
   - **Exclude**: `node_modules`, `frontend/node_modules`, `__pycache__`, `.git`

2. **Upload via File Manager**
   - In cPanel, go to **File Manager**
   - Navigate to `public_html/`
   - Click **Upload**
   - Upload `edumanage.zip`
   - Right-click the uploaded file → **Extract**
   - Delete the zip file after extraction

#### Option B: Using FTP (Alternative)

1. **Connect via FTP Client** (FileZilla, WinSCP, etc.)
   - Host: Your domain or server IP
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

2. **Upload Files**
   - Navigate to `public_html/`
   - Upload the entire `edumanage` folder
   - **Exclude**: `node_modules`, `frontend/node_modules`, `__pycache__`, `.git`

---

### Step 3: Configure the Application

1. **Update passenger_wsgi.py**
   - Edit `public_html/edumanage/passenger_wsgi.py`
   - Update the `INTERP` path with your actual virtual environment path:
     ```python
     INTERP = os.path.expanduser("~/virtualenv/public_html/edumanage/3.9/bin/python3")
     ```

2. **Update .htaccess**
   - Edit `public_html/edumanage/.htaccess`
   - Replace `YOUR_USERNAME` with your actual cPanel username:
     ```apache
     PassengerAppRoot /home/YOUR_USERNAME/public_html/edumanage
     PassengerPython /home/YOUR_USERNAME/virtualenv/public_html/edumanage/3.9/bin/python3
     ```

3. **Create Production Settings**
   - Copy `.env.production` to `.env`
   - Edit `.env` and update:
     ```bash
     DEBUG=False
     SECRET_KEY=generate-a-new-secret-key-here
     ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
     ```
   - **Generate a new SECRET_KEY**: Use Django's `get_random_secret_key()` or an online generator

---

### Step 4: Install Python Dependencies

#### Option A: Using cPanel Terminal (Recommended)

1. **Open Terminal in cPanel**
   - Go to **Terminal** in cPanel

2. **Navigate to Project**
   ```bash
   cd public_html/edumanage
   ```

3. **Activate Virtual Environment**
   ```bash
   source ~/virtualenv/public_html/edumanage/3.9/bin/activate
   ```

4. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

#### Option B: Using SSH

1. **Connect via SSH**
   ```bash
   ssh username@yourdomain.com
   ```

2. **Follow the same commands as Option A**

---

### Step 5: Configure Static Files

1. **Collect Static Files**
   ```bash
   cd ~/public_html/edumanage
   source ~/virtualenv/public_html/edumanage/3.9/bin/activate
   python manage.py collectstatic --noinput
   ```

2. **Copy Frontend Build Files**
   ```bash
   # The frontend build files should already be in frontend/dist/
   # Django will serve them from the static directory
   ```

3. **Set Permissions**
   ```bash
   chmod -R 755 ~/public_html/edumanage/static
   chmod -R 755 ~/public_html/edumanage/staticfiles
   chmod -R 755 ~/public_html/edumanage/media
   ```

---

### Step 6: Configure Database

#### Option A: Using SQLite (Simpler, for smaller deployments)

1. **Upload Your Database**
   - Upload `db.sqlite3` to `public_html/edumanage/`

2. **Set Permissions**
   ```bash
   chmod 664 ~/public_html/edumanage/db.sqlite3
   chmod 775 ~/public_html/edumanage
   ```

3. **Run Migrations** (if needed)
   ```bash
   cd ~/public_html/edumanage
   source ~/virtualenv/public_html/edumanage/3.9/bin/activate
   python manage.py migrate
   ```

#### Option B: Using MySQL (Recommended for production)

1. **Create MySQL Database in cPanel**
   - Go to **MySQL Databases**
   - Create a new database (e.g., `username_edumanage`)
   - Create a database user
   - Add user to database with ALL PRIVILEGES

2. **Update settings.py**
   - Edit `school/settings.py`:
     ```python
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

3. **Install MySQL Client**
   ```bash
   source ~/virtualenv/public_html/edumanage/3.9/bin/activate
   pip install mysqlclient
   ```

4. **Run Migrations**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

---

### Step 7: Update Django Settings for Production

Edit `school/settings.py`:

```python
import os
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'frontend/dist'),  # Add frontend build
]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

---

### Step 8: Configure URL Routing for React Frontend

Edit `school/urls.py` to serve the React frontend:

```python
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('schools.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/food/', include('food.urls')),
    path('api/transport/', include('transport.urls')),
    
    # Serve static files
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Serve React frontend for all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='frontend'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

---

### Step 9: Create Template Directory for React

1. **Create templates directory**
   ```bash
   mkdir -p ~/public_html/edumanage/templates
   ```

2. **Copy index.html from frontend build**
   ```bash
   cp ~/public_html/edumanage/frontend/dist/index.html ~/public_html/edumanage/templates/
   ```

3. **Update settings.py TEMPLATES configuration**
   ```python
   TEMPLATES = [
       {
           'BACKEND': 'django.template.backends.django.DjangoTemplates',
           'DIRS': [os.path.join(BASE_DIR, 'templates')],
           'APP_DIRS': True,
           'OPTIONS': {
               'context_processors': [
                   'django.template.context_processors.debug',
                   'django.template.context_processors.request',
                   'django.contrib.auth.context_processors.auth',
                   'django.contrib.messages.context_processors.messages',
                   'django.template.context_processors.media',
               ],
           },
       },
   ]
   ```

---

### Step 10: Restart the Application

1. **In cPanel Python App Manager**
   - Go to **Setup Python App**
   - Find your application
   - Click **Restart**

2. **Or via Terminal**
   ```bash
   touch ~/public_html/edumanage/passenger_wsgi.py
   ```

---

### Step 11: Test Your Deployment

1. **Visit Your Domain**
   - Go to `https://yourdomain.com/edumanage` (or your configured URL)
   - The React frontend should load

2. **Test API Endpoints**
   - Try logging in
   - Check if data loads correctly

3. **Check for Errors**
   - If you see errors, check the error logs:
     ```bash
     tail -f ~/logs/edumanage_error.log
     ```

---

## 🔧 Troubleshooting

### Issue: "Internal Server Error"
**Solution:**
- Check `passenger_wsgi.py` paths are correct
- Verify virtual environment is activated
- Check error logs: `tail -f ~/logs/edumanage_error.log`

### Issue: "Static files not loading"
**Solution:**
- Run `python manage.py collectstatic --noinput`
- Check `.htaccess` rules
- Verify file permissions: `chmod -R 755 static staticfiles`

### Issue: "Database connection error"
**Solution:**
- Verify database credentials in `.env`
- Check database user has proper privileges
- Test database connection: `python manage.py dbshell`

### Issue: "Module not found"
**Solution:**
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`
- Check Python version matches

### Issue: "CSRF verification failed"
**Solution:**
- Add your domain to `ALLOWED_HOSTS` in settings
- Check `CSRF_TRUSTED_ORIGINS` includes your domain:
  ```python
  CSRF_TRUSTED_ORIGINS = ['https://yourdomain.com']
  ```

---

## 📁 Final Directory Structure on cPanel

```
public_html/
└── edumanage/
    ├── .htaccess
    ├── .env
    ├── passenger_wsgi.py
    ├── manage.py
    ├── requirements.txt
    ├── db.sqlite3
    ├── school/
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── schools/
    ├── finance/
    ├── food/
    ├── transport/
    ├── config/
    ├── frontend/
    │   └── dist/
    │       ├── index.html
    │       ├── assets/
    │       └── ...
    ├── templates/
    │   └── index.html
    ├── static/
    ├── staticfiles/
    └── media/
```

---

## 🔐 Security Checklist

- [ ] `DEBUG = False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] SSL certificate installed (HTTPS)
- [ ] Database credentials secured
- [ ] File permissions set correctly (755 for directories, 644 for files)
- [ ] `.env` file not publicly accessible
- [ ] API keys rotated for production
- [ ] CSRF protection enabled
- [ ] Security headers configured

---

## 📊 Post-Deployment Tasks

1. **Create Superuser** (if using new database)
   ```bash
   python manage.py createsuperuser
   ```

2. **Set Up Cron Jobs** (for scheduled tasks)
   - Go to **Cron Jobs** in cPanel
   - Add any scheduled tasks your app needs

3. **Configure Backups**
   - Set up automatic database backups
   - Configure file backups in cPanel

4. **Monitor Application**
   - Check error logs regularly
   - Monitor resource usage
   - Set up uptime monitoring

---

## 🆘 Support

If you encounter issues:
1. Check the error logs: `~/logs/edumanage_error.log`
2. Verify all paths in configuration files
3. Ensure all dependencies are installed
4. Contact your hosting provider for server-specific issues

---

## ✅ Deployment Complete!

Your EduManage platform should now be live at your domain. Test all features thoroughly before announcing to users.

**Remember to:**
- Keep your dependencies updated
- Monitor server resources
- Regularly backup your database
- Review security settings periodically
