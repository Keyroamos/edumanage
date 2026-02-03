with open('db.sqlite3', 'rb') as f:
    content = f.read()
    if b'ChatGPT_Image' in content:
        print("Found ChatGPT_Image in db.sqlite3")
        # Try to find the full filename
        pos = content.find(b'ChatGPT_Image')
        while pos != -1:
            end = content.find(b'.png', pos)
            if end != -1:
                print(f"Full string found: {content[pos:end+4].decode('utf-8', errors='ignore')}")
            pos = content.find(b'ChatGPT_Image', pos + 1)
    else:
        print("ChatGPT_Image NOT found in db.sqlite3")
