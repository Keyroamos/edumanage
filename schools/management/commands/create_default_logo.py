from django.core.management.base import BaseCommand
from django.conf import settings
import os
from PIL import Image, ImageDraw, ImageFont

class Command(BaseCommand):
    help = 'Creates a default school logo'

    def handle(self, *args, **kwargs):
        # Create images directory if it doesn't exist
        images_dir = os.path.join(settings.BASE_DIR, 'schools', 'static', 'images')
        os.makedirs(images_dir, exist_ok=True)

        # Create a default logo
        img = Image.new('RGB', (200, 200), color='white')
        d = ImageDraw.Draw(img)
        
        # Add text
        d.text((100, 100), "SCHOOL", fill='navy', anchor="mm")
        
        # Save the image
        img.save(os.path.join(images_dir, 'default-logo.png'))
        
        self.stdout.write(self.style.SUCCESS('Successfully created default logo')) 