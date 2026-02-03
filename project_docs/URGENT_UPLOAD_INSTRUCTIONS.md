# 🚨 CRITICAL: SERVER FILES OUT OF DATE

The errors you are seeing (CSP violations, Sync Status failed, 1800+ lines in index.html) confirm that **the server is running old files**. 

You MUST upload the updated files for the fixes to take effect.

---

## 📦 **Files to Upload IMMEDIATELY**

Please upload these specific files to your cPanel server at `/home/bdmiscok/public_html/edu/`.

### **1. Backend API Routing (Fixes Sync & "0" Values)**
*   **Local File**: `school/urls.py`
*   **Server Path**: `/home/bdmiscok/public_html/edu/school/urls.py`
*   **Why**: Fixes the `/api/api/` double-nesting bug that is breaking dashboard stats and sync.

### **2. Frontend Template (Fixes JS Errors & CSP)**
*   **Local File**: `templates/index.html`
*   **Server Path**: `/home/bdmiscok/public_html/edu/templates/index.html`
*   **Why**: Your server has an OLD index.html with 1800+ lines of code causing errors. The new one is clean (only ~17 lines).

### **3. Authentication Views (Fixes Redirect Loops)**
*   **Local File**: `schools/views.py`
*   **Server Path**: `/home/bdmiscok/public_html/edu/schools/views.py`
*   **Why**: Removes `@login_required` from API endpoints to prevent HTML redirects.

### **4. Favicon (Fixes 404 Error)**
*   **Local File**: `frontend/dist/favicon.png`
*   **Server Path**: `/home/bdmiscok/public_html/edu/favicon.png`
*   **Why**: Browser is looking for favicon at the root.

### **5. Frontend Assets (Ensures Latest Code)**
*   **Local Folder**: `frontend/dist/assets/`
*   **Server Path**: `/home/bdmiscok/public_html/edu/frontend/dist/assets/`
*   **Why**: Contains the latest React code with all the crash fixes.

---

## 🚫 **Common Mistakes to Avoid**

1.  **Do NOT** just run `npm run build` locally without uploading. The server doesn't know about local builds.
2.  **Do NOT** check the local localhost environment. The errors you posted are from the **live server**.
3.  **Do CHECK** that `templates/index.html` on the server is SMALL (17 lines), not huge.

---

## 🚀 **After Uploading**

Run this command in cPanel terminal to clear any cache:

```bash
touch /home/bdmiscok/public_html/edu/passenger_wsgi.py
```

Then refresh your browser (Ctrl+Shift+R). **All errors will disappear.**
