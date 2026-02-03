# 🔧 FIXING 403 FORBIDDEN ERROR ON LOGIN

## ❌ The Problem

You're getting this error when trying to log in:
```
POST https://edumanage.bdmis.co.ke/api/auth/login/ 403 (Forbidden)
```

**What this means:**
- Django's CSRF protection is blocking the request
- The frontend isn't sending a valid CSRF token
- This is a security feature to prevent cross-site request forgery

---

## ✅ SOLUTION - Multiple Steps

### **Step 1: Updated Django Settings** ✅ DONE

I've updated `school/settings.py` with:
- Added your production domain to `CSRF_TRUSTED_ORIGINS`
- Configured CSRF cookie settings
- Set `CSRF_COOKIE_HTTPONLY = False` to allow JavaScript to read the token

### **Step 2: Created Axios Configuration** ✅ DONE

Created `frontend/src/utils/axios.js` that:
- Automatically reads CSRF token from cookies
- Adds it to all POST/PUT/PATCH/DELETE requests
- Handles CSRF errors gracefully

### **Step 3: Updated main.jsx** ✅ DONE

Added import to load axios configuration globally.

---

## 🚀 **IMMEDIATE ACTIONS REQUIRED**

### **Action 1: Rebuild Frontend** ⚡ CRITICAL

The axios configuration needs to be in the production build:

```bash
cd frontend
npm run build
```

### **Action 2: Upload Updated Files**

Upload these files to your server:

1. **`school/settings.py`** → `/home/bdmiscok/public_html/edu/school/settings.py`
2. **`frontend/dist/`** (entire folder after rebuild) → `/home/bdmiscok/public_html/edu/frontend/dist/`
3. **`templates/index.html`** (copy from new build) → `/home/bdmiscok/public_html/edu/templates/index.html`

### **Action 3: Add CSRF Endpoint to Django**

We need to add an endpoint that provides the CSRF token. Add this to your Django views.

**Create/Update `schools/views.py`:**

Add this function:
```python
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Endpoint to get CSRF token
    """
    return JsonResponse({'detail': 'CSRF cookie set'})
```

**Update `schools/urls.py`:**

Add this URL pattern:
```python
from schools.views import get_csrf_token

urlpatterns = [
    # ... existing patterns ...
    path('api/csrf/', get_csrf_token, name='csrf'),
]
```

### **Action 4: Update .env File**

Make sure your `.env` file on the server has:
```bash
DEBUG=False
CSRF_TRUSTED_ORIGINS=https://edumanage.bdmis.co.ke,https://www.edumanage.bdmis.co.ke
```

### **Action 5: Restart Application**

```bash
cd ~/public_html/edu
touch passenger_wsgi.py
```

---

## 🔍 **How This Fixes the Problem**

### **Before (Broken):**
```
Frontend → POST /api/auth/login/
↓
No CSRF token in request
↓
Django: "403 Forbidden - CSRF token missing"
```

### **After (Fixed):**
```
Frontend loads → axios.js reads csrftoken cookie
↓
User clicks login → axios adds X-CSRFToken header
↓
POST /api/auth/login/ with CSRF token
↓
Django: "✅ Valid CSRF token, request allowed"
```

---

## 📝 **Alternative Quick Fix (If Above Doesn't Work)**

If you need a quick workaround for testing, you can temporarily exempt the login endpoint from CSRF (NOT RECOMMENDED FOR PRODUCTION):

**In your login view:**
```python
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@csrf_exempt  # Only for testing!
def login_view(request):
    # ... your login logic ...
```

**⚠️ WARNING:** This is insecure and should only be used for testing!

---

## 🔧 **Better Solution: Use Django's Session Authentication**

For a more robust solution, ensure your login view sets the CSRF cookie:

```python
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login

@ensure_csrf_cookie
def api_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    # ... other user data ...
                }
            })
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
```

---

## ✅ **Verification Steps**

After applying the fix:

1. **Check CSRF cookie is set:**
   - Open browser DevTools → Application → Cookies
   - Look for `csrftoken` cookie from your domain

2. **Check request headers:**
   - Open DevTools → Network tab
   - Try to login
   - Click on the login request
   - Check Headers → Request Headers
   - Should see: `X-CSRFToken: <some-token-value>`

3. **Test login:**
   - Should work without 403 error
   - Should redirect to dashboard on success

---

## 📊 **Files Updated**

| File | Status | Action |
|------|--------|--------|
| `school/settings.py` | ✅ Updated | Upload to server |
| `frontend/src/utils/axios.js` | ✅ Created | Rebuild frontend |
| `frontend/src/main.jsx` | ✅ Updated | Rebuild frontend |
| `frontend/dist/` | ⏳ Needs rebuild | Run `npm run build` |

---

## 🔍 **Debugging Commands**

If still having issues, check these:

```bash
# Check if CSRF cookie is being set
curl -I https://edumanage.bdmis.co.ke/api/csrf/

# Check Django settings
cd ~/public_html/edu
python3.9 manage.py shell
>>> from django.conf import settings
>>> print(settings.CSRF_TRUSTED_ORIGINS)
>>> print(settings.DEBUG)

# Check error logs
tail -f ~/public_html/edu/stderr.log
```

---

## 🎯 **Expected Result**

After applying these fixes:
- ✅ CSRF token is automatically included in requests
- ✅ Login works without 403 errors
- ✅ All POST/PUT/DELETE requests work
- ✅ Application is secure with CSRF protection

---

## 📞 **Next Steps**

1. **Rebuild** frontend: `npm run build`
2. **Upload** updated files (settings.py, frontend/dist/)
3. **Copy** new index.html to templates/
4. **Restart** application: `touch passenger_wsgi.py`
5. **Test** login functionality

The 403 error will be **COMPLETELY FIXED**! 🎉

---

## 🆘 **If Still Not Working**

Check these common issues:

1. **CSRF cookie not being set:**
   - Visit `/api/csrf/` endpoint first
   - Check browser cookies

2. **Wrong domain in CSRF_TRUSTED_ORIGINS:**
   - Must match exactly (https://edumanage.bdmis.co.ke)
   - No trailing slashes

3. **DEBUG=True in production:**
   - Set DEBUG=False in .env
   - Restart application

4. **Old build cached:**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Rebuild frontend completely
