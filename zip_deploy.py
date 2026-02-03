import os
import zipfile

def zip_platform():
    project_root = r"c:\Users\Admin\OneDrive\Desktop\edumanage"
    zip_filename = os.path.join(project_root, "platform_deploy.zip")
    
    # Files/Folders to include
    include_roots = [
        'school', 
        'schools', 
        'finance', 
        'transport', 
        'food', 
        'config', 
        'templates', 
        'static',
        'media'       # Optional: include existing media if any
    ]
    
    include_files = [
        'manage.py',
        'passenger_wsgi.py',
        'requirements.txt',
        '.env.production',
        'db.sqlite3',
        '.htaccess',
        'fix_server.py'
    ]
    
    # Specific frontend handling
    # We include 'dist' but most importantly 'staticfiles' handles the serving
    frontend_dist = os.path.join('frontend', 'dist')

    print(f"Creating {zip_filename}...")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Add Root Files
        for file in include_files:
            file_path = os.path.join(project_root, file)
            if os.path.exists(file_path):
                print(f"Adding {file}...")
                zipf.write(file_path, file)
            else:
                print(f"Warning: {file} not found.")

        # 2. Add Backend Directories
        for folder in include_roots:
            folder_path = os.path.join(project_root, folder)
            if os.path.exists(folder_path):
                print(f"Adding folder {folder}...")
                for root, dirs, files in os.walk(folder_path):
                    # Exclude __pycache__
                    if '__pycache__' in dirs:
                        dirs.remove('__pycache__')
                    
                    for file in files:
                        if file == '.DS_Store' or file.endswith('.pyc'):
                            continue
                            
                        abs_path = os.path.join(root, file)
                        rel_path = os.path.relpath(abs_path, project_root)
                        zipf.write(abs_path, rel_path)
        
        # 3. Add Frontend Build (dist only)
        frontend_dist_path = os.path.join(project_root, frontend_dist)
        if os.path.exists(frontend_dist_path):
            print(f"Adding frontend build artifact ({frontend_dist})...")
            for root, dirs, files in os.walk(frontend_dist_path):
                for file in files:
                    abs_path = os.path.join(root, file)
                    rel_path = os.path.relpath(abs_path, project_root)
                    zipf.write(abs_path, rel_path)
        else:
            print(f"Error: Frontend build directory not found at {frontend_dist}")

    print(f"\n[SUCCESS] Zip archive created successfully!")
    print(f"Size: {os.path.getsize(zip_filename) / (1024*1024):.2f} MB")
    print(f"Location: {zip_filename}")

if __name__ == "__main__":
    zip_platform()
