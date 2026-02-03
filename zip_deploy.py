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
        
        # 3. Add Frontend Build (from public_html)
        # We use public_html because vite.config.js builds directly there
        frontend_build_path = os.path.join(project_root, 'public_html')
        
        if os.path.exists(frontend_build_path):
            print(f"Adding frontend build artifact ({frontend_build_path})...")
            # We want to add the contents of public_html to the root of the zip (or appropriate location)
            # Typically for cPanel, these go into public_html
            for root, dirs, files in os.walk(frontend_build_path):
                 # Skip the edumanage subdirectory if it exists inside public_html (recursive protection)
                if 'edumanage' in dirs:
                    dirs.remove('edumanage')

                for file in files:
                    abs_path = os.path.join(root, file)
                    rel_path = os.path.relpath(abs_path, frontend_build_path) # Relative to public_html, so they appear at root of zip?
                    
                    # If the user extracts this zip to public_html, we want files to be at root.
                    # Previous script put frontend/dist files at frontend/dist path in zip?
                    # Line 73: zipf.write(abs_path, rel_path) where rel_path was rel to project_root.
                    # So it preserved frontend/dist folder.
                    
                    # BUT for cPanel deployment, we usually want the build files at the webroot.
                    # Let's put them in the zip such that they are easy to deploy.
                    # If we zip 'frontend/dist/x' as 'frontend/dist/x', user has to move them.
                    # If we zip 'public_html/x' as 'x', user extracts to public_html and it works.
                    
                    # Let's try to preserve the structure the user expects.
                    # If the user expects 'frontend/dist', I should probably zip it as such?
                    # No, the user changed config to output to public_html.
                    # So let's zip 'public_html' content.
                    
                    # Let's zip it into a folder named 'public_html_content' or just at root?
                    # The previous script preserved paths relative to project_root.
                    # e.g. 'schools/models.py' -> 'schools/models.py'.
                    
                    # I will NOT add public_html folder itself to the zip.
                    # Instead, I will add the CONTENTS of public_html to the ROOT of the zip.
                    # This ensures that when extracted to 'public_html/escal', 
                    # index.html and assets/ are at the top level of 'escal', which is what we want.
                    
                    zip_rel_path = rel_path
                    print(f"  Adding {zip_rel_path}")
                    zipf.write(abs_path, zip_rel_path)
        else:
            print(f"Error: Frontend build directory not found at {frontend_build_path}")

    print(f"\n[SUCCESS] Zip archive created successfully!")
    print(f"Size: {os.path.getsize(zip_filename) / (1024*1024):.2f} MB")
    print(f"Location: {zip_filename}")

if __name__ == "__main__":
    zip_platform()
