# 🔧 FIXING THE PASSENGER WSGI ERROR

## ❌ The Problem

You're getting this error:
```
FileNotFoundError: [Errno 2] No such file or directory
```

This happens because the `passenger_wsgi.py` file is trying to use a virtual environment path that doesn't exist on your server.

---

## ✅ SOLUTION - Two Options

### **Option 1: Use Simplified passenger_wsgi.py (RECOMMENDED)**

Replace your current `passenger_wsgi.py` with this simpler version:

```python
"""
Passenger WSGI file for cPanel deployment
"""
import sys
import os

# Add your project directory to the sys.path
cwd = os.getcwd()
sys.path.insert(0, cwd)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Steps:**
1. Upload the new `passenger_wsgi.py` (I've created it for you)
2. Replace the old one on your server
3. Restart the application

---

### **Option 2: Setup Python App in cPanel First**

If you want to use a virtual environment properly:

#### Step 1: Create Python Application in cPanel
1. Go to **"Setup Python App"** in cPanel
2. Click **"Create Application"**
3. Configure:
   - **Python Version**: 3.9
   - **Application Root**: `public_html/edu`
   - **Application URL**: `/edu` (or `/` for root)
   - **Application Startup File**: `passenger_wsgi.py`
4. Click **"Create"**

#### Step 2: Note the Virtual Environment Path
After creation, cPanel will show you the exact path, something like:
```
/home/bdmiscok/virtualenv/public_html/edu/3.9
```

#### Step 3: Update passenger_wsgi.py
Use this version with the CORRECT path from cPanel:

```python
"""
Passenger WSGI file for cPanel deployment
"""
import sys
import os

# IMPORTANT: Update this path with the one shown in cPanel Python App
INTERP = os.path.expanduser("~/virtualenv/public_html/edu/3.9/bin/python3")
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Set the path to your project
cwd = os.getcwd()
sys.path.insert(0, cwd)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

#### Step 4: Install Dependencies
In cPanel Terminal:
```bash
cd ~/public_html/edu
source ~/virtualenv/public_html/edu/3.9/bin/activate
pip install -r requirements.txt
```

---

## 🚀 QUICK FIX (Fastest Solution)

**Do this NOW:**

1. **Upload the new simplified `passenger_wsgi.py`** (already created in your local folder)

2. **In cPanel File Manager:**
   - Navigate to `public_html/edu/`
   - Delete the old `passenger_wsgi.py`
   - Upload the new one

3. **Restart the application:**
   - Touch the file to trigger restart:
   ```bash
   touch ~/public_html/edu/passenger_wsgi.py
   ```
   
   OR in cPanel:
   - Go to "Setup Python App"
   - Click "Restart" button

4. **Check if it works:**
   - Visit your domain
   - Check the error logs again

---

## 📝 Understanding the Error

The original `passenger_wsgi.py` had this line:
```python
INTERP = os.path.expanduser("~/virtualenv/public_html/edumanage/3.9/bin/python3")
```

But your actual path is:
```
~/virtualenv/public_html/edu/3.9/bin/python3
```

**Two issues:**
1. The folder name was `edumanage` instead of `edu`
2. The virtual environment might not exist yet

The simplified version bypasses this by letting cPanel's Python App handle the virtual environment automatically.

---

## 🔍 Verify Virtual Environment Exists

To check if your virtual environment exists, run in cPanel Terminal:

```bash
ls -la ~/virtualenv/public_html/edu/3.9/bin/python3
```

**If it says "No such file or directory":**
- The virtual environment doesn't exist
- Use Option 1 (simplified passenger_wsgi.py)
- OR create the Python App in cPanel first (Option 2)

**If it shows the file:**
- Update the path in passenger_wsgi.py to match exactly
- Make sure it's `/edu/` not `/edumanage/`

---

## ✅ After Fixing

Once you upload the corrected `passenger_wsgi.py`:

1. **Restart the application:**
   ```bash
   touch ~/public_html/edu/passenger_wsgi.py
   ```

2. **Check error logs:**
   ```bash
   tail -f ~/public_html/edu/stderr.log
   ```

3. **If you see new errors**, they'll likely be about missing dependencies:
   ```bash
   cd ~/public_html/edu
   # If using Python App (with venv):
   source ~/virtualenv/public_html/edu/3.9/bin/activate
   pip install -r requirements.txt
   
   # If NOT using venv:
   pip3.9 install --user -r requirements.txt
   ```

---

## 📋 Complete Working passenger_wsgi.py

I've created the corrected file for you. Upload this to your server:

**File: `passenger_wsgi.py`** (already in your local folder)

---

## 🆘 Still Having Issues?

If you still get errors after uploading the new file:

1. **Check Django is installed:**
   ```bash
   python3.9 -c "import django; print(django.get_version())"
   ```

2. **Check the settings module path:**
   ```bash
   ls -la ~/public_html/edu/school/settings.py
   ```

3. **Install dependencies:**
   ```bash
   cd ~/public_html/edu
   pip3.9 install --user django
   pip3.9 install --user -r requirements.txt
   ```

4. **Check file permissions:**
   ```bash
   chmod 755 ~/public_html/edu
   chmod 644 ~/public_html/edu/passenger_wsgi.py
   ```

---

## 📞 Next Steps

1. ✅ Upload the new `passenger_wsgi.py`
2. ✅ Restart the application
3. ✅ Check the error logs
4. ✅ Report any new errors (they'll be different and easier to fix)

The simplified version should work immediately without needing a virtual environment setup!
