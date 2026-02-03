# Files and Folders to Upload to cPanel

## ✅ MUST UPLOAD - Core Application Files

### Root Level Files
- [ ] `passenger_wsgi.py` - **CRITICAL** - Passenger WSGI entry point
- [ ] `.htaccess` - **CRITICAL** - Apache/Passenger configuration
- [ ] `.env` - **CRITICAL** - Production environment variables (create from .env.production)
- [ ] `manage.py` - Django management script
- [ ] `requirements.txt` - Python dependencies
- [ ] `db.sqlite3` - Database file (if using SQLite)

### Application Directories
- [ ] `school/` - Main Django project folder
  - [ ] `settings.py` - Django settings
  - [ ] `urls.py` - URL routing
  - [ ] `wsgi.py` - WSGI configuration
  - [ ] `__init__.py`
  
- [ ] `schools/` - Schools app
- [ ] `finance/` - Finance app
- [ ] `food/` - Food service app
- [ ] `transport/` - Transport app
- [ ] `config/` - Configuration app

### Frontend Build
- [ ] `frontend/dist/` - **CRITICAL** - React production build
  - [ ] `index.html`
  - [ ] `assets/` folder with all JS/CSS files
  
- [ ] `templates/` - Django templates
  - [ ] `index.html` - Copy of frontend/dist/index.html

### Static and Media Files
- [ ] `static/` - Static files directory
- [ ] `media/` - User uploaded files
- [ ] `staticfiles/` - Collected static files (will be generated on server)

---

## ❌ DO NOT UPLOAD - Exclude These

### Development Files
- ❌ `node_modules/` - Frontend dependencies (too large, not needed)
- ❌ `frontend/node_modules/` - Same as above
- ❌ `frontend/src/` - Source files (only dist/ is needed)
- ❌ `__pycache__/` - Python cache files
- ❌ `*.pyc` - Compiled Python files
- ❌ `.git/` - Git repository
- ❌ `.gitignore` - Git configuration
- ❌ `venv/` or `env/` - Local virtual environment

### Build and Config Files
- ❌ `frontend/package.json` - Not needed after build
- ❌ `frontend/package-lock.json` - Not needed after build
- ❌ `frontend/vite.config.js` - Build config
- ❌ `frontend/tailwind.config.js` - Build config
- ❌ `frontend/postcss.config.js` - Build config
- ❌ `frontend/eslint.config.js` - Linting config

### Documentation and Test Files
- ❌ `*.md` files (optional - can upload for reference)
- ❌ `test_*.py` - Test files
- ❌ `*.bat` - Batch scripts
- ❌ `*.ps1` - PowerShell scripts
- ❌ `*.txt` files (except requirements.txt)
- ❌ `*.xlsx` - Excel files

---

## 📦 Recommended Upload Structure

```
public_html/edumanage/
├── .htaccess                    ✅ UPLOAD
├── .env                         ✅ UPLOAD (create from .env.production)
├── passenger_wsgi.py            ✅ UPLOAD
├── manage.py                    ✅ UPLOAD
├── requirements.txt             ✅ UPLOAD
├── db.sqlite3                   ✅ UPLOAD (if using SQLite)
│
├── school/                      ✅ UPLOAD ENTIRE FOLDER
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── schools/                     ✅ UPLOAD ENTIRE FOLDER (exclude __pycache__)
├── finance/                     ✅ UPLOAD ENTIRE FOLDER (exclude __pycache__)
├── food/                        ✅ UPLOAD ENTIRE FOLDER (exclude __pycache__)
├── transport/                   ✅ UPLOAD ENTIRE FOLDER (exclude __pycache__)
├── config/                      ✅ UPLOAD ENTIRE FOLDER (exclude __pycache__)
│
├── frontend/
│   └── dist/                    ✅ UPLOAD ENTIRE FOLDER
│       ├── index.html
│       └── assets/
│
├── templates/                   ✅ UPLOAD ENTIRE FOLDER
│   └── index.html
│
├── static/                      ✅ UPLOAD ENTIRE FOLDER
├── media/                       ✅ UPLOAD ENTIRE FOLDER
└── staticfiles/                 ⚠️ Will be created on server (collectstatic)
```

---

## 🔧 Pre-Upload Preparation

### 1. Create Production Environment File
```bash
# Copy .env.production to .env and update values
cp .env.production .env
```

Edit `.env` and update:
- `DEBUG=False`
- `SECRET_KEY=<generate-new-key>`
- `ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com`
- `CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

### 2. Verify Frontend Build
Check that `frontend/dist/` exists and contains:
- `index.html`
- `assets/` folder with JS and CSS files

### 3. Clean Up Python Cache
```bash
# Remove all __pycache__ directories
find . -type d -name "__pycache__" -exec rm -rf {} +
# Or on Windows PowerShell:
Get-ChildItem -Path . -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
```

---

## 📤 Upload Methods

### Method 1: ZIP and Upload (Recommended)

1. **Create a clean copy of the project**
   ```bash
   # Create a deployment folder
   mkdir edumanage-deploy
   ```

2. **Copy only necessary files** (see checklist above)

3. **Create ZIP file**
   - Right-click → Send to → Compressed (zipped) folder
   - Name it `edumanage.zip`

4. **Upload to cPanel**
   - Go to File Manager
   - Navigate to `public_html/`
   - Upload `edumanage.zip`
   - Extract the ZIP file
   - Delete the ZIP after extraction

### Method 2: FTP Upload

1. **Connect via FTP client** (FileZilla, WinSCP)
   - Host: your-domain.com
   - Username: cPanel username
   - Password: cPanel password
   - Port: 21

2. **Upload folders one by one**
   - Upload to `public_html/edumanage/`
   - Exclude files/folders from "DO NOT UPLOAD" list

### Method 3: Git Deploy (Advanced)

1. **Initialize git repository on server**
2. **Push code to repository**
3. **Pull on server**
4. **Run deployment commands**

---

## ⚠️ Important Notes

1. **Database**: If using SQLite, upload `db.sqlite3`. If using MySQL, you'll create the database on the server.

2. **File Permissions**: After upload, set correct permissions:
   - Directories: 755
   - Files: 644
   - Database: 664

3. **Virtual Environment**: Will be created on the server, not uploaded.

4. **Static Files**: Run `collectstatic` on the server after upload.

5. **Sensitive Data**: Never commit `.env` to git. Create it manually on the server.

---

## ✅ Post-Upload Verification

After uploading, verify these files exist on the server:

```bash
# Check critical files
ls -la ~/public_html/edumanage/passenger_wsgi.py
ls -la ~/public_html/edumanage/.htaccess
ls -la ~/public_html/edumanage/.env
ls -la ~/public_html/edumanage/frontend/dist/index.html
ls -la ~/public_html/edumanage/templates/index.html
```

---

## 📊 Estimated Upload Size

- **With frontend build**: ~50-100 MB
- **Without node_modules**: Significantly smaller
- **Database**: Varies based on data

---

## 🆘 Troubleshooting

**Issue**: Upload is too large
- **Solution**: Exclude `node_modules/`, `__pycache__/`, `.git/`

**Issue**: Missing files after extraction
- **Solution**: Check ZIP contents before upload, ensure all folders are included

**Issue**: Permission denied errors
- **Solution**: Set correct file permissions (755 for directories, 644 for files)
