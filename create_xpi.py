import zipfile
import os

def create_xpi():
    # Files and folders to include
    include_list = [
        'manifest.json',
        'popup',
        'content',
        'assets',
        'services',
        'settings',
        'utils',
        'LICENSE',
        'README.md'
    ]
    
    output_filename = 'ai-page-reader.xpi'
    
    # Remove existing file if it exists
    if os.path.exists(output_filename):
        os.remove(output_filename)
        
    print(f"Creating {output_filename}...")
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in include_list:
            if os.path.isfile(item):
                print(f"Adding file: {item}")
                zipf.write(item)
            elif os.path.isdir(item):
                print(f"Adding folder: {item}")
                for root, dirs, files in os.walk(item):
                    for file in files:
                        file_path = os.path.join(root, file)
                        # Keep the path relative to the root of the zip
                        zipf.write(file_path, file_path)
                        
    print("Done! XPI created successfully.")

if __name__ == "__main__":
    create_xpi()
